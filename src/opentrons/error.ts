import { StructuredError } from './types.js';

export class OpentronsErrorFormatter {
  public formatError(errorPayload: any): StructuredError {
    let errorCode = 'UNKNOWN_OPENTRONS_ERROR';
    let errorType = 'GeneralError';
    let message = 'An error occurred during Opentrons API execution.';
    let lineNumber: number | undefined = undefined;
    let stepName: string | undefined = undefined;
    let remediationHint = 'Check protocol syntax, robot connection, and labware definitions.';

    if (typeof errorPayload === 'string') {
      message = errorPayload;
    } else if (errorPayload && typeof errorPayload === 'object') {
      if (errorPayload.errorCode) errorCode = String(errorPayload.errorCode);
      if (errorPayload.errorType) errorType = String(errorPayload.errorType);
      if (errorPayload.detail) message = String(errorPayload.detail);
      else if (errorPayload.message) message = String(errorPayload.message);

      // Extract line number if present in error message or stack trace
      const lineMatch = message.match(/line (\d+)/i) || (errorPayload.traceback && String(errorPayload.traceback).match(/line (\d+)/i));
      if (lineMatch) {
        lineNumber = parseInt(lineMatch[1], 10);
      }

      // Extract step name or command type
      if (errorPayload.commandType) {
        stepName = String(errorPayload.commandType);
      }
    }

    // Determine remediation hint based on error patterns
    const msgLower = message.toLowerCase();
    if (msgLower.includes('module') && msgLower.includes('not found')) {
      errorCode = 'ERR_MODULE_NOT_CONNECTED';
      remediationHint = 'Ensure the specified module is connected via USB and powered on before running protocol.';
    } else if (msgLower.includes('tip') && (msgLower.includes('out of') || msgLower.includes('empty'))) {
      errorCode = 'ERR_TIP_RACK_EMPTY';
      remediationHint = 'Refill or replace the tip rack or update the protocol tip rack position.';
    } else if (msgLower.includes('dock') || msgLower.includes('labware')) {
      errorCode = 'ERR_INVALID_LABWARE';
      remediationHint = 'Verify labware load name against Opentrons labware library.';
    } else if (msgLower.includes('syntax') || msgLower.includes('indentation')) {
      errorCode = 'ERR_PYTHON_SYNTAX';
      remediationHint = 'Fix Python syntax/indentation errors at the reported line number.';
    }

    return {
      errorCode,
      errorType,
      message,
      lineNumber,
      stepName,
      rawDetails: errorPayload,
      remediationHint,
    };
  }
}
