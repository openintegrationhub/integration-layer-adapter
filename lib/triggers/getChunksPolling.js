/**
 * Copyright 2019 Wice GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const Q = require('q');
const request = require('request-promise');

/**
 * This method will be called from OIH providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param snapshot saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  const self = this;

  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).toISOString();
  async function emitData() {
    const { ilaId } = cfg;
    const chunks = await getChunks(ilaId, snapshot);

    console.error(`Found ${chunks.length} new chunks.`);

    if (chunks.length > 0) {
      chunks.forEach((elem) => {
        self.emit('data', elem.payload);
      });
      snapshot.lastUpdated = chunks[chunks.length - 1].expireAt;
      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
      self.emit('snapshot', snapshot);
    }
  }

  function emitError(e) {
    console.log(`ERROR: ${e}`);
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

async function getChunks(iladId, snapshot) {
  const uri = `http://ils.oih-dev-ns.svc.cluster.local:3002/chunks/${iladId}`;

  try {
    const requestOptions = {
      uri,
      json: true,
    };

    const chunks = await fetchAll(requestOptions, snapshot);

    return chunks;
  } catch (e) {
    throw new Error(e);
  }
}

async function fetchAll(options, snapshot) {
  try {
    const result = [];
    const chunks = await request.get(options);

    if (Object.entries(chunks.data).length === 0 && chunks.constructor === Object) {
      return { errors: [{ message: 'No chunks found!', code: 404 }] };
    }

    chunks.data.filter((chunk) => {
      if (chunk.expireAt > snapshot.lastUpdated) {
        result.push(chunk);
      }
    });
    result.sort((a, b) => parseInt(a.lastUpdate) - parseInt(b.lastUpdate));
    return result;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processTrigger,
  getChunks,
};
