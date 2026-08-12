import { z } from 'zod';
import { OpentronsClient } from '../opentrons/client.js';
import { ProtocolHardwareValidator } from '../opentrons/validator.js';
import { OpentronsErrorFormatter } from '../opentrons/error.js';
import { DocumentationSearchEngine } from '../qmd/search.js';

export const toolSchemas = {
  opentrons_search_docs: {
    description: 'Opentrons Python Protocol API & HTTP API ドキュメントをキーワード検索し、関連する仕様やサンプルコードを返却します。',
    parameters: z.object({
      query: z.string().describe('検索キーワード（例: "temperature module", "transfer", "load_labware"）'),
      maxResults: z.number().optional().default(5).describe('返却する最大結果数'),
    }),
  },
  opentrons_validate_protocol: {
    description: 'Opentrons Python プロトコルコードの構文・物理ハードウェア要件（接続モジュール/ピペット）を事前チェックします。',
    parameters: z.object({
      protocolContent: z.string().describe('検証する Python プロトコルコード本文'),
    }),
  },
  opentrons_upload_and_run: {
    description: 'プロトコル検証・アップロード・Run生成・実行開始を一括で行います。ハードウェア不足時はブロックします。',
    parameters: z.object({
      protocolContent: z.string().describe('実行する Python プロトコルコード本文'),
      filename: z.string().optional().default('protocol.py').describe('保存ファイル名'),
    }),
  },
  opentrons_get_robot_status: {
    description: 'ロボットの接続状態、モジュール・ピペット構成、および指定された Run の現在ステータスを取得します。',
    parameters: z.object({
      runId: z.string().optional().describe('ステータスを確認したい Run の ID (任意)'),
    }),
  },
  opentrons_control_run: {
    description: '実行中の Run に対して play (開始/再開), pause (一時停止), stop (停止), resume (再開) の制御アクションを発行します。',
    parameters: z.object({
      runId: z.string().describe('対象の Run ID'),
      action: z.enum(['play', 'pause', 'stop', 'resume']).describe('制御アクション'),
    }),
  },
  opentrons_execute_command: {
    description: '指定された Run に対して個別のハードウェアダイレクトコマンドを発行・実行します。',
    parameters: z.object({
      runId: z.string().describe('対象の Run ID'),
      commandType: z.string().describe('コマンドタイプ (例: "home", "loadLabware", "movePipette")'),
      params: z.record(z.unknown()).optional().default({}).describe('コマンドパラメータ'),
      intent: z.enum(['setup', 'protocol']).optional().default('protocol').describe('コマンドインテント'),
    }),
  },
};

export class ToolHandler {
  private client: OpentronsClient;
  private validator: ProtocolHardwareValidator;
  private errorFormatter: OpentronsErrorFormatter;
  private searchEngine: DocumentationSearchEngine;

  constructor(client?: OpentronsClient) {
    this.client = client || new OpentronsClient();
    this.validator = new ProtocolHardwareValidator();
    this.errorFormatter = new OpentronsErrorFormatter();
    this.searchEngine = new DocumentationSearchEngine();
  }

  public async searchDocs(args: { query: string; maxResults?: number }) {
    const results = this.searchEngine.search(args.query, args.maxResults ?? 5);
    return {
      query: args.query,
      count: results.length,
      results,
    };
  }

  public async validateProtocol(args: { protocolContent: string }) {
    try {
      let modules: any[] = [];
      let pipettes: any = { left: { id: null, name: null }, right: { id: null, name: null } };

      try {
        modules = await this.client.getModules();
        pipettes = await this.client.getPipettes();
      } catch (err) {
        // If robot is offline/mock mode, proceed with hardware check warnings
      }

      const hardwareCheck = this.validator.validate(args.protocolContent, modules, pipettes);
      const requirements = this.validator.extractRequirements(args.protocolContent);

      return {
        valid: hardwareCheck.valid,
        requirements,
        hardwareCheck,
      };
    } catch (err: any) {
      return {
        valid: false,
        error: this.errorFormatter.formatError(err?.response?.data || err),
      };
    }
  }

  public async uploadAndRun(args: { protocolContent: string; filename?: string }) {
    try {
      let modules: any[] = [];
      let pipettes: any = { left: { id: null, name: null }, right: { id: null, name: null } };

      try {
        modules = await this.client.getModules();
        pipettes = await this.client.getPipettes();
      } catch {
        // Continue to hardware validation
      }

      const hardwareCheck = this.validator.validate(args.protocolContent, modules, pipettes);
      if (!hardwareCheck.valid) {
        return {
          status: 'BLOCKED',
          reason: 'Required hardware modules or pipettes are missing on the target robot.',
          details: hardwareCheck,
        };
      }

      // Step 1: Upload protocol
      const protocol = await this.client.uploadProtocol(args.protocolContent, args.filename || 'protocol.py');

      // Step 2: Create run instance
      const run = await this.client.createRun(protocol.id);

      // Step 3: Trigger play action
      const action = await this.client.controlRun(run.id, 'play');

      return {
        status: 'STARTED',
        protocolId: protocol.id,
        runId: run.id,
        actionId: action.id,
        runStatus: run.status,
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        error: this.errorFormatter.formatError(err?.response?.data || err),
      };
    }
  }

  public async getRobotStatus(args: { runId?: string }) {
    try {
      let health = null;
      let modules = null;
      let pipettes = null;

      try {
        health = await this.client.getHealth();
        modules = await this.client.getModules();
        pipettes = await this.client.getPipettes();
      } catch (e: any) {
        health = { status: 'unreachable', error: e.message };
      }

      let runDetails = null;
      if (args.runId) {
        try {
          const run = await this.client.getRun(args.runId);
          const commands = await this.client.getRunCommands(args.runId);
          const completedSteps = commands.filter((c) => c.status === 'succeeded').length;
          const totalSteps = commands.length;

          runDetails = {
            runId: run.id,
            status: run.status,
            current: run.current,
            completedSteps,
            totalSteps,
            commands,
          };
        } catch (e: any) {
          runDetails = { error: e.message };
        }
      }

      return {
        robotEndpoint: this.client.getBaseUrl(),
        health,
        connectedModules: modules,
        connectedPipettes: pipettes,
        runDetails,
      };
    } catch (err: any) {
      return {
        error: this.errorFormatter.formatError(err?.response?.data || err),
      };
    }
  }

  public async controlRun(args: { runId: string; action: 'play' | 'pause' | 'stop' | 'resume' }) {
    try {
      const actionResult = await this.client.controlRun(args.runId, args.action);
      return {
        runId: args.runId,
        action: args.action,
        result: actionResult,
      };
    } catch (err: any) {
      return {
        error: this.errorFormatter.formatError(err?.response?.data || err),
      };
    }
  }

  public async executeCommand(args: {
    runId: string;
    commandType: string;
    params?: Record<string, unknown>;
    intent?: 'setup' | 'protocol';
  }) {
    try {
      const commandResult = await this.client.executeCommand(
        args.runId,
        args.commandType,
        args.params || {},
        args.intent || 'protocol'
      );
      return {
        runId: args.runId,
        command: commandResult,
      };
    } catch (err: any) {
      return {
        error: this.errorFormatter.formatError(err?.response?.data || err),
      };
    }
  }
}
