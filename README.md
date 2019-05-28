# Integration Layer Adapter
Th Integration Layer Adapter (ILA) allows flows to communicate with the Integration Layer Service. It is primarily intended take the place between a transformer and the ILS. For more information, see the [ILS Documentation](https://github.com/openintegrationhub/openintegrationhub/tree/master/services)

## Usage
Make sure to pass on the property `ilaId` through the config, which must match among all connected flows.

## Actions

### upsertChunk
Makes a POST request to the ILS at path `/chunks` for the purpose of merging chunks of incomplete objects.

Make sure to pass on the fields `cid` and `def` through the config, which both must match among all connected flows taking this action.

#### Request:
```json
{
  "ilaId": "123abc",
  "cid": "email",
  "def": {
    "required": [
      "firstName",
      "lastName",
      "email",
      "address"
    ],
    "payload": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "doe@domain.org"
    }
  }
}
```

#### Response
```json
{
  "_id": "5ce79b6f56ff82000fbeabaf",
  "expireAt": "2019-05-24T08:21:19.813Z",
  "valid": false,
  "__v": 0,
  "ilaId": "123abc",
  "cid": "email",
  "def": {
    "required": [
      "firstName",
      "lastName",
      "email",
      "address"
    ],
    "payload": {
      "lastName": "Doe",
      "email": "doe@domain.org"
    }
  }
}
```

## Triggers
### getChunksPolling
Makes a GET request to the ILS at path `/chunks/{ilaId}`. Retrieves all Objects of the given `ilaId` that have been marked as valid.

#### Response
```json
{
  "_id": "5ce79b6f56ff82000fbeabaf",
  "expireAt": "2019-05-24T09:21:19.813Z",
  "valid": true,
  "__v": 0,
  "ilaId": "123abc",
  "cid": "email",
  "def": {
    "required": [
      "firstName",
      "lastName",
      "email",
      "address"
    ],
    "payload": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "doe@domain.org",
      "address": "357 Doestreet"
    }
  }
}
```
