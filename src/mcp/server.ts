import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { mcpTools } from './tools.js';

// ── Token authentication ──────────────────────────────────────────────────────
// Set MCP_TOKEN in your .env to require a Bearer token from clients.
// If MCP_TOKEN is not set, the server runs without auth (local/trusted use only).
const MCP_TOKEN = process.env['MCP_TOKEN'];

function checkAuth(meta: any): boolean {
  if (!MCP_TOKEN) return true; // No token configured → open access
  const auth: string = meta?.authorization ?? meta?.Authorization ?? '';
  return auth === `Bearer ${MCP_TOKEN}` || auth === MCP_TOKEN;
}
// ─────────────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'saraviamtech-builder', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  if (!checkAuth((request as any).params?._meta)) {
    throw new Error('Unauthorized: invalid or missing MCP_TOKEN');
  }

  return {
    tools: mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: {
        type: 'object',
        properties: (tool.inputSchema as any).shape
          ? Object.fromEntries(
              Object.entries((tool.inputSchema as any).shape).map(([k, v]: [string, any]) => [
                k,
                {
                  type: v._def?.typeName?.replace('Zod', '').toLowerCase() ?? 'string',
                  description: v.description ?? '',
                },
              ])
            )
          : {},
      },
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!checkAuth((request as any).params?._meta)) {
    return { content: [{ type: 'text', text: 'Unauthorized: invalid or missing MCP_TOKEN' }], isError: true };
  }

  const tool = mcpTools.find(t => t.name === request.params.name);
  if (!tool) {
    return { content: [{ type: 'text', text: `Tool "${request.params.name}" not found` }], isError: true };
  }

  try {
    const parsed = tool.inputSchema.parse(request.params.arguments ?? {});
    return await tool.handler(parsed);
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('SaraviamTech MCP Server running on stdio');
if (MCP_TOKEN) {
  console.error('Auth: Bearer token required');
} else {
  console.error('Auth: none (set MCP_TOKEN in .env to enable)');
}
