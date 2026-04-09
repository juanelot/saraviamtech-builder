import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { mcpTools } from './tools.js';

const server = new Server(
  { name: 'saraviamtech-builder', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: mcpTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: {
      type: 'object',
      properties: (tool.inputSchema as any).shape
        ? Object.fromEntries(
            Object.entries((tool.inputSchema as any).shape).map(([k, v]: [string, any]) => [
              k,
              { type: v._def?.typeName?.replace('Zod', '').toLowerCase() ?? 'string', description: v.description ?? '' }
            ])
          )
        : {},
    },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
