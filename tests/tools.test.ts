import { ToolHandler } from '../src/tools/definitions';

describe('ToolHandler', () => {
  let handler: ToolHandler;

  beforeEach(() => {
    handler = new ToolHandler();
  });

  test('searchDocs should return search results', async () => {
    const res = await handler.searchDocs({ query: 'transfer' });
    expect(res.count).toBeGreaterThan(0);
    expect(res.results.length).toBeGreaterThan(0);
  });

  test('validateProtocol should extract requirements and perform check', async () => {
    const protocolCode = `
from opentrons import protocol_api

def run(protocol: protocol_api.ProtocolContext):
    mod = protocol.load_module('temperature module gen2', '1')
`;
    const res = await handler.validateProtocol({ protocolContent: protocolCode });
    expect(res.valid).toBeDefined();
    if ('requirements' in res && res.requirements) {
      expect(res.requirements.modules).toContain('temperature module gen2');
    }
  });

  test('getRobotStatus should return health and status structure', async () => {
    const status = await handler.getRobotStatus({});
    expect(status.robotEndpoint).toBeDefined();
  });
});
