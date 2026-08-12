# Opentrons HTTP API v2 Reference

## Overview
The Opentrons HTTP API v2 controls OT-2 and Opentrons Flex robots via RESTful endpoints on port `31950`.
All requests require header `Opentrons-Version: 2`.

## Health Check
`GET /health`
Returns robot software and hardware status.
Response:
```json
{
  "name": "OT2-Robot",
  "api_version": "7.0.0",
  "fw_version": "v1.0.0",
  "board_revision": "2.1"
}
```

## Protocols Endpoint
### Upload Protocol
`POST /protocols` (Content-Type: multipart/form-data)
Files: `files` (array of protocol files e.g., `.py` or `.json`)
Response:
```json
{
  "data": {
    "id": "protocol-id-123",
    "createdAt": "2026-08-12T00:00:00Z",
    "protocolType": "python",
    "protocolKey": "my-protocol",
    "files": [{"name": "protocol.py", "role": "main"}],
    "analysisSummaries": []
  }
}
```

### Get Protocol
`GET /protocols/{protocol_id}`

## Runs Endpoint
### Create Run
`POST /runs`
Body:
```json
{
  "data": {
    "protocolId": "protocol-id-123"
  }
}
```
Response:
```json
{
  "data": {
    "id": "run-id-456",
    "createdAt": "2026-08-12T00:00:00Z",
    "status": "idle",
    "current": true,
    "actions": [],
    "errors": [],
    "pipettes": [],
    "modules": []
  }
}
```

### Control Run Action
`POST /runs/{run_id}/actions`
Body:
```json
{
  "data": {
    "actionType": "play" // or "pause", "stop", "resume"
  }
}
```

### Get Run Status
`GET /runs/{run_id}`

### Enqueue / Execute Direct Commands
`POST /runs/{run_id}/commands`
Body:
```json
{
  "data": {
    "commandType": "home",
    "params": {}
  }
}
```

## Hardware & Modules Endpoints
### Get Connected Modules
`GET /modules`
Response:
```json
{
  "data": [
    {
      "id": "mod-123",
      "serialNumber": "TC12345",
      "moduleModel": "thermocyclerModuleV1",
      "moduleType": "thermocyclerModule",
      "status": "idle"
    }
  ]
}
```

### Get Connected Pipettes
`GET /pipettes`
Response:
```json
{
  "left": {"id": "p300_single_v2.0", "name": "p300_single_gen2"},
  "right": {"id": null, "name": null}
}
```
