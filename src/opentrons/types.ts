export interface OpentronsHealth {
  name: string;
  api_version: string;
  fw_version: string;
  board_revision: string;
  logs?: string[];
}

export interface OpentronsProtocolFile {
  name: string;
  role?: string;
}

export interface OpentronsProtocol {
  id: string;
  createdAt: string;
  protocolType: string;
  protocolKey?: string;
  files: OpentronsProtocolFile[];
  analysisSummaries?: Array<{
    id: string;
    status: 'pending' | 'completed' | 'failed';
  }>;
}

export interface OpentronsRunAction {
  id: string;
  actionType: 'play' | 'pause' | 'stop' | 'resume';
  createdAt: string;
}

export interface OpentronsCommand {
  id: string;
  commandType: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  params?: Record<string, unknown>;
  error?: unknown;
}

export interface OpentronsRun {
  id: string;
  createdAt: string;
  status: 'idle' | 'running' | 'pause-requested' | 'paused' | 'stop-requested' | 'stopped' | 'failed' | 'succeeded' | 'finishing';
  current: boolean;
  protocolId?: string;
  actions: OpentronsRunAction[];
  errors: Array<{
    id: string;
    errorType: string;
    createdAt: string;
    detail: string;
    errorCode?: string;
    source?: string;
  }>;
  pipettes: Array<{
    id: string;
    pipetteName: string;
    mount: 'left' | 'right';
  }>;
  modules: Array<{
    id: string;
    model: string;
    location: { slotName: string };
    serialNumber?: string;
  }>;
}

export interface OpentronsModule {
  id: string;
  serialNumber: string;
  moduleModel: string;
  moduleType: string;
  status: string;
  hasAvailableUpdate?: boolean;
  usbPort?: {
    port: number;
    hub?: number;
  };
  data?: Record<string, unknown>;
}

export interface OpentronsPipette {
  id: string | null;
  name: string | null;
  model?: string | null;
}

export interface OpentronsPipettesResponse {
  left: OpentronsPipette;
  right: OpentronsPipette;
}

export interface StructuredError {
  errorCode: string;
  errorType: string;
  message: string;
  lineNumber?: number;
  stepName?: string;
  rawDetails?: unknown;
  remediationHint: string;
}

export interface PhysicalValidationResult {
  valid: boolean;
  missingModules: string[];
  missingPipettes: string[];
  details: string[];
}
