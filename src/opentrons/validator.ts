import { OpentronsModule, OpentronsPipettesResponse, PhysicalValidationResult } from './types.js';

export interface ProtocolRequirements {
  modules: string[];
  pipettes: string[];
}

export class ProtocolHardwareValidator {
  /**
   * Parse Python protocol content for load_module and load_instrument calls
   */
  public extractRequirements(protocolContent: string): ProtocolRequirements {
    const modules: string[] = [];
    const pipettes: string[] = [];

    // Match load_module('module_name', ...)
    const moduleMatches = protocolContent.matchAll(/load_module\s*\(\s*['"]([^'"]+)['"]/g);
    for (const match of moduleMatches) {
      if (match[1] && !modules.includes(match[1])) {
        modules.push(match[1]);
      }
    }

    // Match load_instrument('pipette_name', ...)
    const pipetteMatches = protocolContent.matchAll(/load_instrument\s*\(\s*['"]([^'"]+)['"]/g);
    for (const match of pipetteMatches) {
      if (match[1] && !pipettes.includes(match[1])) {
        pipettes.push(match[1]);
      }
    }

    return { modules, pipettes };
  }

  /**
   * Validate protocol requirements against currently connected hardware
   */
  public validate(
    protocolContent: string,
    connectedModules: OpentronsModule[],
    connectedPipettes: OpentronsPipettesResponse
  ): PhysicalValidationResult {
    const { modules: reqModules, pipettes: reqPipettes } = this.extractRequirements(protocolContent);

    const missingModules: string[] = [];
    const missingPipettes: string[] = [];
    const details: string[] = [];

    // Check Modules
    for (const reqMod of reqModules) {
      const normalizedReq = this.normalizeModuleName(reqMod);
      const isConnected = connectedModules.some((mod) => {
        const modType = mod.moduleType?.toLowerCase() || '';
        const modModel = mod.moduleModel?.toLowerCase() || '';
        return modType.includes(normalizedReq) || modModel.includes(normalizedReq);
      });

      if (!isConnected) {
        missingModules.push(reqMod);
        details.push(`Required module '${reqMod}' is not connected to the robot.`);
      }
    }

    // Check Pipettes
    const activePipetteNames: string[] = [];
    if (connectedPipettes.left?.name) activePipetteNames.push(connectedPipettes.left.name.toLowerCase());
    if (connectedPipettes.right?.name) activePipetteNames.push(connectedPipettes.right.name.toLowerCase());

    for (const reqPip of reqPipettes) {
      const normalizedReq = reqPip.toLowerCase().replace(/_gen\d+/g, '');
      const isConnected = activePipetteNames.some((pipName) => pipName.includes(normalizedReq));

      if (!isConnected) {
        missingPipettes.push(reqPip);
        details.push(`Required pipette '${reqPip}' is not attached to the robot.`);
      }
    }

    const valid = missingModules.length === 0 && missingPipettes.length === 0;

    return {
      valid,
      missingModules,
      missingPipettes,
      details,
    };
  }

  private normalizeModuleName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('temperature')) return 'temperature';
    if (lower.includes('magnetic')) return 'magnetic';
    if (lower.includes('thermocycler')) return 'thermocycler';
    if (lower.includes('heatershifter') || lower.includes('heater-shifter')) return 'heatershifter';
    return lower;
  }
}
