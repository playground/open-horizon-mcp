import log4js from 'log4js';
import { z } from "zod";
import { MCPToolResponse, ToolResponse } from '../models/model.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { makeHttpRequest, getErrorMessage } from '../services/common.js';
import 'dotenv/config'

const l = log4js.getLogger();
const EXCHANGE_URL = process.env.EXCHANGE_URL;
const ORG = process.env.EXCHANGE_ORG;

export class ToolExchange {
  toolName = 'exchange';
  toolDescription = `
    Use this tool to manage Open Horizon Exchange resources such as services, nodes, and policies (including node policies, service policies, deployment policies).

    ALWAYS set the target to "policy" for all policy-related actions.  Do not use "deployment", "node", or "service" as targets for policy queries even if the prompt includes those words.

    IMPORTANT: Set target: "policy" for ALL policy-related actions.
    - NEVER set target to "node", "service", or "deployment" for policy actions.
    - Instead, use policyType to specify the type of policy:
        • "node"
        • "service"
        • "deployment"

    Valid actions:
    - "list": List all policies or policies by type
    - "details": Show details for a specific policy
    - "create": Create a policy (requires data)
    - "delete": Delete a specific policy
    - "status": Get the status of a specific policy

    Targets:
    Use the "target" field to indicate what type of Exchange resource is being managed.

    Valid values for "target" are:
    - "node" for node-related actions
    - "service" for service-related actions
    - "policy" for all policy-related actions
    - Always use **singular form** ("node", not "nodes") — even if the user asks for “nodes”, "policies" or “services”.
    - Do not include "policyType" unless target is "policy". Omit "policyType" entirely for service or node queries.
    - When to use each:
    - Use "node" when managing node details or status
      - If the user prompt is about nodes (e.g. "get all nodes", "list registered nodes") use target: "node"

      - If the prompt is about services (e.g. "get all services", "show details of service X") use target: "service"

      - If the prompt is about **any kind of policy** (e.g. "node policy", "service policy", "deployment policy") use:
        - target: must be "policy"
        - policyType: "node" | "service" | "deployment" depending on the type of policy being queried
    - Examples:
      - Prompt: "Get all nodes in the exchange"
        Expected target: "node", action: "list"

      - Prompt: "List all services"
        Expected target: "service", action: "list"

      - Prompt: "Show the service policy named foo"
        Expected target: "policy", policyType: "service", name: "foo", action: "details"

    Rules:
    - For "list": "policyType" is optional; "name" must be omitted
    - For "details", "delete", or "status": "policyType" and "name" are required
    - For "create": "policyType", "name", and "data" are required

    Always map policy-related phrases to the correct target:
    - "deployment policy": target: "policy", policyType: "deployment"
    - "node policy": target: "policy", policyType: "node"
    - "service policy": target: "policy", policyType: "service"
    - Do NOT set target = "service" even if the word "service" is used in the policy name.

    Name Extraction Guidelines

    Always extract the full value of the "name" field if the prompt mentions a specific entity.
    Always include the name field for these actions:
    - "details"
    - "delete"
    - "status"
    - The name may include:
      • Hyphens: "chunk-saved-model"
      • Underscores: "_arm64"
      • Dots/versions: "1.0.0"

    Look for:
      - Phrases like “named <name>” or “called <name>”
      - Quoted values like "<name>", or values inside backticks or apostrophes

    Do NOT:
      - Truncate or simplify long names
      - Assume only the last word is the name
      - Omit names even if they look complex

    Always extract the complete string as-is (e.g. "policy-chunk-saved-model-service_arm64")

    Examples:
    - exchange(action: "list", target: "policy")
    - exchange(action: "list", target: "policy", policyType: "deployment")
    - exchange(action: "details", target: "policy", policyType: "node", name: "witty-anoa")
    - exchange(action: "delete", target: "policy", policyType: "service", name: "weather-policy")
    - exchange(action: "create", target: "policy", policyType: "node", name: "my-policy", data: { ... })
    - Prompt: "Get the node policy called edge-policy-123"
      - Expected tool arguments { target: "policy", policyType: "node", action: "details", name: "edge-policy-123" }
    - Prompt: "Show me the service policy named policy-chunk-saved-model-service_arm64"
      - Expected tool arguments { target: "policy", policyType: "service", action: "details", name: "policy-chunk-saved-model-service_arm64" }
    - Prompt: "Delete the deployment policy named deploy-main"
      - Expected tool arguments { target: "policy", policyType: "deployment", action: "delete", name: "deploy-main" }
  `;
  toolParamsSchema = {
    action: z.enum(['list', 'details', 'create', 'delete', 'status'])
      .describe('The operation to perform: list, details, create, delete, or status'),
    target: z.enum(['service', 'node', 'policy'])
      .describe('The type of resource to operate on'),
    policyType: z.preprocess(
        (val) => (val === null || val === '' ? undefined : val),
        z.enum(['node', 'service', 'deployment']).optional()
      ).describe('If target is "policy", specify which kind of policy'),
    name: z.string()
      .optional()
      .describe('Name of the policy, required for most actions except list or if target is "node" and action is "status"'),
    data: z.any().optional().describe('Optional JSON payload for create or update actions')
  };  
  constructor(private mcpServer: McpServer) {
    l.info('ToolExchange initialized');
    this.registerTool();
    l.info('ToolExchange registered');
  }

  registerTool() {
    this.mcpServer.tool(
      this.toolName,
      this.toolDescription,
      this.toolParamsSchema,
      this.toolCallback
    );
  }
  listResources = async (target: string, name: string, policyType: string): Promise<any> => {
    // Implement logic to list resources of the specified type
    console.log(`Listing resources of type: ${target}, policyType: ${policyType}, name: ${name}`);
    if (!['service', 'node', 'policy'].includes(target)) {
      throw new Error(`Invalid target type: ${target}. Must be one of 'service', 'node', or 'policy'.`);
    }
    try {
      // Here you would typically make an API call to the Open Horizon Exchange
      // to retrieve the list of resources. For now, we return a placeholder response.
      if(target === 'policy') {
        // For policies, we need to handle the policyType as well
        let exchangeUrl = '';
        if(policyType === 'node') {
          if(!name) {
            return { content: [{ type: 'text', text: `Details for ${target} named ${name}` }] };
          } else {
            exchangeUrl = `${EXCHANGE_URL}/${ORG}/business/policies/nodes/${name}/policy`;
          }
        } else {
          exchangeUrl = `${EXCHANGE_URL}/${ORG}/business/policies`;
        }
        console.log(`Fetching policy list from Exchange at ${exchangeUrl} for target: ${target}`);
        const response = await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});
        
        // If response has content property, it's already formatted as ToolResponse (error case)
        if (response && typeof response === 'object' && 'content' in response) {
          return response;
        }
        
        // Otherwise, wrap the successful response in proper MCP format
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2)
            }
          ]
        };

      } else {
        const exchangeUrl = target === 'policy' ? `${EXCHANGE_URL}/${ORG}/business/policies` : `${EXCHANGE_URL}/${ORG}/${target}s`;
        console.log(`Fetching resources from Exchange at ${exchangeUrl} for target: ${target}`);
        const response = await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});
        
        // If response has content property, it's already formatted as ToolResponse (error case)
        if (response && typeof response === 'object' && 'content' in response) {
          return response;
        }
        
        // Otherwise, wrap the successful response in proper MCP format
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }
    } catch (err: any) {
      console.log(`Error fetching resources from Exchange: ${err.message}`);
      return getErrorMessage(err);
    }
  }
  getResourceDetails = async (target: string, name: string, policyType: string): Promise<ToolResponse> =>
  {
    // Implement logic to get details of a specific resource
    l.info(`Getting details for ${target} with name: ${name}`);
    // Placeholder for actual implementation
    try {
      // Here you would typically make an API call to the Open Horizon Exchange
      // to retrieve the list of resources. For now, we return a placeholder response.
      if (policyType && target !== 'policy') {
        l.info(`[Fix] Detected policyType='${policyType}' but target='${target}'. Overriding target to 'policy'`);
        target = 'policy';
      }
      if(target === 'policy') {
        // For policies, we need to handle the policyType as well
        let exchangeUrl = '';
        if(policyType === 'node') {
          if(!name) {
            return { content: [{ type: 'text', text: `Details for ${target} named ${name}` }] };
          } else {
            exchangeUrl = `${EXCHANGE_URL}/${ORG}/nodes/${name}/policy`;
          }
        } else if(policyType === 'service') {
          if(!name) {
            return { content: [{ type: 'text', text: `Details for ${policyType} ${target} name is required` }] };
          } else {
            exchangeUrl = `${EXCHANGE_URL}/${ORG}/business/policies/${name}`;
          }
        } else if(policyType === 'deployment') {
          if(!name) {
            return { content: [{ type: 'text', text: `Details for ${policyType} ${target} name is required` }] };
          } else {
            exchangeUrl = `${EXCHANGE_URL}/${ORG}/services/${name}/policy`;
          }
        } else {
          exchangeUrl = `${EXCHANGE_URL}/${ORG}/business/policies`;
        }
        l.info(`Fetching policy details from Exchange at ${exchangeUrl} for target: ${target}`);
        return await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});

      } else if(target === 'service') {
        if(!name) {
          return { content: [{ type: 'text', text: `Details for ${target} named ${name}` }] };
        }
        const exchangeUrl = `${EXCHANGE_URL}/${ORG}/services/${name}`;
        l.info(`Fetching service details from Exchange at ${exchangeUrl} for target: ${target}`);
        return await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});
      } else if(target === 'node') {
        const exchangeUrl = `${EXCHANGE_URL}/${ORG}/node-details`;
        return await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});        
      } else {
        const exchangeUrl = target === 'policy' ? `${EXCHANGE_URL}/${ORG}/business/policies` : `${EXCHANGE_URL}/${ORG}/${target}s`;
        l.info(`Fetching resources from Exchange at ${exchangeUrl} for target: ${target}`);
        const response = await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});
        //console.dir(response, { depth: null, colors: true });
        //return {content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]};
        return response;
        //return {content: [{type: 'tool', tool_name: 'exchange', tool_output: response, _meta:{} as Record<string, unknown> }]};
      }
    } catch (err: any) {
      l.info(`Error fetching resources from Exchange: ${err.message}`);
      return getErrorMessage(err);
    }

    return { content: [{ type: 'text', text: `Details for ${target} named ${name}` }] };
  }
  createResource = async (target: string, data: any): Promise<any> => {
    // Implement logic to create a new resource
    l.debug(`Creating ${target} with data: ${JSON.stringify(data)}`);
    // Placeholder for actual implementation
    return { content: [{ type: 'text', text: `Created ${target} with provided data` }] };
  }
  deleteResource = async (target: string, name: string): Promise<any> => {
    // Implement logic to delete a specific resource
    l.debug(`Deleting ${target} with name: ${name}`);
    // Placeholder for actual implementation
    return { content: [{ type: 'text', text: `Deleted ${target} named ${name}` }] };
  }
  getResourceStatus = async (target: string, name: string): Promise<any> =>
  {
    // Implement logic to get the status of a specific resource
    l.debug(`Getting status for ${target} with name: ${name}`);
    // Placeholder for actual implementation
    if(target === 'node') {
      // For nodes, we might want to check the status of the node
      const exchangeUrl = `${EXCHANGE_URL}/${ORG}/nodes/${name}/status`;
      console.log(`Fetching node status from Exchange at ${exchangeUrl}`);
      return await makeHttpRequest(exchangeUrl, {Authorization: `Basic ${process.env.EXCHANGE_CREDENTIAL}`});
    } else {
      return { content: [{ type: 'text', text: `Status for ${target} named ${name}` }] };
    }
  }
  toolCallback = async (params: any): Promise<any> => {
    l.debug("ToolExchange callback received params:", params);
    
    const { action, target, name, policyType, data } = params;
    console.log(`> action=${action}, target=${target}, name=${name}, policyType=${policyType}, data=${JSON.stringify(data)}`);  

    let result;
    switch (action) {
      case 'list':
        result = await this.listResources(target, name, policyType);
        break;
      case 'details':
        if (!name) return getErrorMessage("Name is required for details action");
        result = await this.getResourceDetails(target, name, policyType);
        break;
      case 'create':
        if (!data) return getErrorMessage("Data is required for create action");
        result = await this.createResource(target, data);
        break;
      case 'delete':
        if (!name) return getErrorMessage("Name is required for delete action");
        result = await this.deleteResource(target, name);
        break;
      case 'status':
        if (!name) return getErrorMessage("Name is required for status action");
        result = await this.getResourceStatus(target, name);
        break;
      default:
        return getErrorMessage(`Unknown action: ${action}`);
    }

    return result;
  }
}
