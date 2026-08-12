import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { toolSchemas, ToolHandler } from './tools/definitions.js';

dotenv.config();

const server = new Server(
  {
    name: 'opentrons-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const handler = new ToolHandler();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'opentrons_search_docs',
        description: toolSchemas.opentrons_search_docs.description,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '検索キーワード' },
            maxResults: { type: 'number', description: '返却件数 (既定: 5)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'opentrons_validate_protocol',
        description: toolSchemas.opentrons_validate_protocol.description,
        inputSchema: {
          type: 'object',
          properties: {
            protocolContent: { type: 'string', description: 'Pythonプロトコルコード' },
          },
          required: ['protocolContent'],
        },
      },
      {
        name: 'opentrons_upload_and_run',
        description: toolSchemas.opentrons_upload_and_run.description,
        inputSchema: {
          type: 'object',
          properties: {
            protocolContent: { type: 'string', description: 'Pythonプロトコルコード' },
            filename: { type: 'string', description: '保存ファイル名' },
          },
          required: ['protocolContent'],
        },
      },
      {
        name: 'opentrons_get_robot_status',
        description: toolSchemas.opentrons_get_robot_status.description,
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run ID (任意)' },
          },
        },
      },
      {
        name: 'opentrons_control_run',
        description: toolSchemas.opentrons_control_run.description,
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run ID' },
            action: { type: 'string', enum: ['play', 'pause', 'stop', 'resume'], description: '制御アクション' },
          },
          required: ['runId', 'action'],
        },
      },
      {
        name: 'opentrons_execute_command',
        description: toolSchemas.opentrons_execute_command.description,
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run ID' },
            commandType: { type: 'string', description: 'コマンドタイプ' },
            params: { type: 'object', description: 'コマンドパラメータ' },
            intent: { type: 'string', enum: ['setup', 'protocol'], description: 'インテント' },
          },
          required: ['runId', 'commandType'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;
    switch (name) {
      case 'opentrons_search_docs':
        result = await handler.searchDocs(args as any);
        break;
      case 'opentrons_validate_protocol':
        result = await handler.validateProtocol(args as any);
        break;
      case 'opentrons_upload_and_run':
        result = await handler.uploadAndRun(args as any);
        break;
      case 'opentrons_get_robot_status':
        result = await handler.getRobotStatus((args || {}) as any);
        break;
      case 'opentrons_control_run':
        result = await handler.controlRun(args as any);
        break;
      case 'opentrons_execute_command':
        result = await handler.executeCommand(args as any);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error.message || 'An unexpected tool execution error occurred.',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Opentrons MCP Server running on STDIO');
}

main().catch((error) => {
  console.error('Fatal server start error:', error);
  process.exit(1);
});
