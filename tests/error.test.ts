import { OpentronsErrorFormatter } from '../src/opentrons/error';

describe('OpentronsErrorFormatter', () => {
  let formatter: OpentronsErrorFormatter;

  beforeEach(() => {
    formatter = new OpentronsErrorFormatter();
  });

  test('should format error object and extract line number and remediation hint', () => {
    const errorPayload = {
      errorCode: '4000',
      errorType: 'PythonSyntaxError',
      detail: 'IndentationError: unexpected indent on line 24',
    };

    const formatted = formatter.formatError(errorPayload);
    expect(formatted.errorCode).toBe('ERR_PYTHON_SYNTAX');
    expect(formatted.lineNumber).toBe(24);
    expect(formatted.remediationHint).toContain('Python syntax');
  });

  test('should format module not connected error correctly', () => {
    const errorPayload = {
      detail: 'Required module temperature module not found on deck',
    };

    const formatted = formatter.formatError(errorPayload);
    expect(formatted.errorCode).toBe('ERR_MODULE_NOT_CONNECTED');
    expect(formatted.remediationHint).toContain('USB');
  });
});
