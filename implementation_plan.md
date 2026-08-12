# Implementation Plan - Opentrons API MCP Server

Create a TypeScript/Node.js based Model Context Protocol (MCP) server for Opentrons HTTP API v2 and Python Protocol API as specified in `task.md`.

## User Review Required

> [!NOTE]
> The server will connect to an Opentrons robot at `http://<OPENTRONS_ROBOT_IP>:31950` by default. Environment variables `OPENTRONS_ROBOT_IP`, `OPENTRONS_ROBOT_PORT`, and `OPENTRONS_API_TOKEN` can be configured.

> [!IMPORTANT]
> The documentation search tool (`opentrons_search_docs`) will use a built-in TypeScript markdown search engine indexed from `docs/` (with CLI `qmd` fallthrough compatibility) to ensure zero native build runtime dependencies and out-of-the-box search capability.

## Proposed Changes

### Project & Configuration

#### [NEW] [`package.json`](file:///c:/Users/19172/Desktop/dev/otie-mcp/package.json)
- Define dependencies: `@modelcontextprotocol/sdk`, `zod`, `axios`, `dotenv`, `form-data`.
- Dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/jest`, `jest`, `ts-jest`.
- Scripts: `build`, `start`, `dev`, `build:index`, `test`.

#### [NEW] [`tsconfig.json`](file:///c:/Users/19172/Desktop/dev/otie-mcp/tsconfig.json)
- Configure ES2022 / NodeNext module resolution and build outputs to `dist/`.

---

### Opentrons API & Validation Core

#### [NEW] [`src/opentrons/types.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/opentrons/types.ts)
- Interfaces for Opentrons API v2 resources: Protocol, Run, Action, Command, Module, Pipette, RobotHealth, Analysis, ErrorResponse.

#### [NEW] [`src/opentrons/client.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/opentrons/client.ts)
- `OpentronsClient` implementation for HTTP API v2 calls (`Opentrons-Version: 2` header).
- Protocol upload & get, run management, action dispatcher (`play`, `pause`, `stop`, `resume`), hardware/module query, and direct command execution.

#### [NEW] [`src/opentrons/validator.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/opentrons/validator.ts)
- Deck and hardware validator comparing protocol requirements against connected modules (`GET /modules`) and pipettes (`GET /pipettes`).

#### [NEW] [`src/opentrons/error.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/opentrons/error.ts)
- Error parsing logic producing structured JSON error reports with `errorCode`, line number, step name, and actionable hints.

---

### Documentation Search Engine

#### [NEW] [`src/qmd/search.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/qmd/search.ts)
- Markdown documentation indexer and search provider. Reads `.md` files under `docs/`, parses headers and snippets, and returns structured search results.
- `npm run build:index` script support.

#### [NEW] [`docs/opentrons_python_api.md`](file:///c:/Users/19172/Desktop/dev/otie-mcp/docs/opentrons_python_api.md)
- Reference documentation for Opentrons Python Protocol API v2 (labware, pipettes, modules, protocol context).

#### [NEW] [`docs/opentrons_http_api.md`](file:///c:/Users/19172/Desktop/dev/otie-mcp/docs/opentrons_http_api.md)
- Reference documentation for Opentrons HTTP API v2 (protocols, runs, commands, actions, health).

---

### MCP Tools & Entrypoint

#### [NEW] [`src/tools/definitions.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/tools/definitions.ts)
- Implement all 6 required MCP tools using Zod schemas:
  1. `opentrons_search_docs`
  2. `opentrons_validate_protocol`
  3. `opentrons_upload_and_run`
  4. `opentrons_get_robot_status`
  5. `opentrons_control_run`
  6. `opentrons_execute_command`

#### [NEW] [`src/index.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/src/index.ts)
- MCP Server initialization, STDIO transport listener, tool registration, environment variable handling.

---

### Verification & Testing

#### [NEW] [`tests/client.test.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/tests/client.test.ts)
#### [NEW] [`tests/validator.test.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/tests/validator.test.ts)
#### [NEW] [`tests/search.test.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/tests/search.test.ts)
#### [NEW] [`tests/tools.test.ts`](file:///c:/Users/19172/Desktop/dev/otie-mcp/tests/tools.test.ts)

## Verification Plan

### Automated Tests
- `npm test`: Run Jest unit and integration tests verifying search indexing, protocol validator, error formatter, Opentrons API client, and MCP tool handlers.
- `npm run build`: Verify TypeScript compilation with zero errors.

### Manual Verification
- Execute `node dist/index.js` or `npx tsx src/index.ts` and test tool execution via stdio JSON-RPC requests.
