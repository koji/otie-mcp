import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  OpentronsHealth,
  OpentronsProtocol,
  OpentronsRun,
  OpentronsRunAction,
  OpentronsModule,
  OpentronsPipettesResponse,
  OpentronsCommand,
} from './types.js';

export class OpentronsClient {
  private client: AxiosInstance;
  private robotIp: string;
  private robotPort: number;

  constructor(robotIp?: string, robotPort?: number, apiToken?: string) {
    this.robotIp = robotIp || process.env.OPENTRONS_ROBOT_IP || '127.0.0.1';
    this.robotPort = robotPort || parseInt(process.env.OPENTRONS_ROBOT_PORT || '31950', 10);
    const token = apiToken || process.env.OPENTRONS_API_TOKEN;

    const headers: Record<string, string> = {
      'Opentrons-Version': '2',
    };
    if (token) {
      headers['x-api-token'] = token;
    }

    this.client = axios.create({
      baseURL: `http://${this.robotIp}:${this.robotPort}`,
      headers,
      timeout: 15000,
    });
  }

  public getBaseUrl(): string {
    return `http://${this.robotIp}:${this.robotPort}`;
  }

  public async getHealth(): Promise<OpentronsHealth> {
    const res = await this.client.get<OpentronsHealth>('/health');
    return res.data;
  }

  public async uploadProtocol(protocolContent: string, filename: string = 'protocol.py'): Promise<OpentronsProtocol> {
    const form = new FormData();
    form.append('files', Buffer.from(protocolContent), {
      filename,
      contentType: 'text/x-python',
    });

    const res = await this.client.post<{ data: OpentronsProtocol }>('/protocols', form, {
      headers: form.getHeaders(),
    });
    return res.data.data;
  }

  public async getProtocol(protocolId: string): Promise<OpentronsProtocol> {
    const res = await this.client.get<{ data: OpentronsProtocol }>(`/protocols/${protocolId}`);
    return res.data.data;
  }

  public async createRun(protocolId?: string): Promise<OpentronsRun> {
    const body: Record<string, unknown> = {};
    if (protocolId) {
      body.protocolId = protocolId;
    }
    const res = await this.client.post<{ data: OpentronsRun }>('/runs', { data: body });
    return res.data.data;
  }

  public async getRun(runId: string): Promise<OpentronsRun> {
    const res = await this.client.get<{ data: OpentronsRun }>(`/runs/${runId}`);
    return res.data.data;
  }

  public async controlRun(runId: string, actionType: 'play' | 'pause' | 'stop' | 'resume'): Promise<OpentronsRunAction> {
    const res = await this.client.post<{ data: OpentronsRunAction }>(`/runs/${runId}/actions`, {
      data: { actionType },
    });
    return res.data.data;
  }

  public async executeCommand(
    runId: string,
    commandType: string,
    params: Record<string, unknown> = {},
    intent: 'setup' | 'protocol' = 'protocol'
  ): Promise<OpentronsCommand> {
    const res = await this.client.post<{ data: OpentronsCommand }>(`/runs/${runId}/commands`, {
      data: {
        commandType,
        params,
        intent,
      },
    });
    return res.data.data;
  }

  public async getRunCommands(runId: string): Promise<OpentronsCommand[]> {
    const res = await this.client.get<{ data: OpentronsCommand[] }>(`/runs/${runId}/commands`);
    return res.data.data;
  }

  public async getModules(): Promise<OpentronsModule[]> {
    const res = await this.client.get<{ data: OpentronsModule[] }>('/modules');
    return res.data.data;
  }

  public async getPipettes(): Promise<OpentronsPipettesResponse> {
    const res = await this.client.get<OpentronsPipettesResponse>('/pipettes');
    return res.data;
  }
}
