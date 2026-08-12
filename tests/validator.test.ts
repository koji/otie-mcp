import { ProtocolHardwareValidator } from '../src/opentrons/validator';
import { OpentronsModule, OpentronsPipettesResponse } from '../src/opentrons/types';

describe('ProtocolHardwareValidator', () => {
  let validator: ProtocolHardwareValidator;

  beforeEach(() => {
    validator = new ProtocolHardwareValidator();
  });

  test('should extract required modules and pipettes from protocol python code', () => {
    const protocolCode = `
from opentrons import protocol_api

metadata = {'apiLevel': '2.15'}

def run(protocol: protocol_api.ProtocolContext):
    temp_mod = protocol.load_module('temperature module gen2', '4')
    p300 = protocol.load_instrument('p300_single_gen2', 'left')
`;
    const reqs = validator.extractRequirements(protocolCode);
    expect(reqs.modules).toContain('temperature module gen2');
    expect(reqs.pipettes).toContain('p300_single_gen2');
  });

  test('should validate hardware check when modules and pipettes are present', () => {
    const protocolCode = `
def run(protocol):
    mod = protocol.load_module('temperature module gen2', '1')
    p = protocol.load_instrument('p300_single_gen2', 'left')
`;
    const connectedModules: OpentronsModule[] = [
      {
        id: 'mod-1',
        serialNumber: '123',
        moduleModel: 'temperatureModuleV2',
        moduleType: 'temperatureModule',
        status: 'idle',
      },
    ];
    const connectedPipettes: OpentronsPipettesResponse = {
      left: { id: 'p300-1', name: 'p300_single_gen2' },
      right: { id: null, name: null },
    };

    const result = validator.validate(protocolCode, connectedModules, connectedPipettes);
    expect(result.valid).toBe(true);
    expect(result.missingModules).toHaveLength(0);
    expect(result.missingPipettes).toHaveLength(0);
  });

  test('should block and detect missing module', () => {
    const protocolCode = `
def run(protocol):
    mod = protocol.load_module('magnetic module gen2', '1')
`;
    const result = validator.validate(protocolCode, [], { left: { id: null, name: null }, right: { id: null, name: null } });
    expect(result.valid).toBe(false);
    expect(result.missingModules).toContain('magnetic module gen2');
  });
});
