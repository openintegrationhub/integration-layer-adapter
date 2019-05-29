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
 */
async function processAction(msg, cfg) {
  const self = this;

  async function emitData() {
    const reply = await upsertChunk(msg, cfg);
    self.emit('data', reply);
  }

  function emitError(e) {
    console.log('Oops! Error occurred');
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

async function upsertChunk(msg, cfg) {
  try {
    const uri = 'http://ils.oih-dev-ns.svc.cluster.local:3002/chunks';

    const options = {
      uri,
      json: true,
      body: {
        ilaId: cfg.ilaId,
        cid: cfg.cid,
        def: cfg.def,
        payload: msg.body,
      },
    };
    const chunk = await request.post(options);

    if (!chunk) {
      return { errors: [{ message: 'Server error!', code: 500 }] };
    }

    return chunk;
  } catch (e) {
    // console.error(`ERROR: ${e}`);
    // throw new Error(e);
    return e;
  }
}

module.exports = {
  process: processAction,
  upsertChunk,
};
