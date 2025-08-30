import express from 'express';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { SessionEntry } from './models/model.js';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolExchange } from './tools/tool-exchange.js';

/**
 * Factory to create and configure a new McpServer (tools/resources/prompts)
 * Note: We explicitly pass `capabilities` so that the client knows we support tools.
 */
export function createMcpServer(initialHeaders: IncomingHttpHeaders): McpServer {
  const server = new McpServer({
    name: 'open-horizon-mcp-server',
    version: '1.0.0',

    // Declare that this server supports tools, resources, and prompts
    capabilities: {
      tools:     { listChanged: true },
      resources: { listChanged: true },
      prompts:   { listChanged: true }
    },
    instructions: `
      You have access to one tool: 'exchange'.

      1. **'exchange' tool**  
        - Purpose: Perform IBM Open Horizon Management Hub API operations  
        - Use this if the request is about: services, nodes, policies, deployments, or statuses  
        - Supported entityType: 'service', 'node', 'policy'  
        - Supported intentType: 'list', 'details', 'create', 'delete', 'status'  

      You can:
      - list resources:      { intentType: "list", entityType: "service" }
      - get details:         { intentType: "details", entityType: "node", name: "node-1" }
      - create resources:    { intentType: "create", entityType: "policy", data: { ... } }
      - delete resources:    { intentType: "delete", entityType: "service", name: "service-id" }
      - get error/status:    { intentType: "status", entityType: "node", name: "node-1" }

      The 'entityType' can be: 'service', 'node', or 'policy'.
      The 'intentType' can be: 'list', 'details', 'create', 'delete', or 'status'.
      The 'name' field is optional and used for specific entities like nodes or services.
      The 'data' field is optional and used for creating resources like policies.
    `
  });
  new ToolExchange(server);                                                                                                                                   // :contentReference[oaicite:7]{index=7}
  return server;
}