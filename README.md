# Open Horizon MCP Server

A Model Context Protocol (MCP) server for interacting with Open Horizon Exchange APIs. This server provides tools and resources for managing Open Horizon services, nodes, and deployment policies.

## Overview

The Open Horizon MCP Server is built on the Model Context Protocol (MCP) framework, providing a standardized interface for AI assistants to interact with Open Horizon Exchange APIs. It enables AI assistants to perform various operations related to Open Horizon edge computing platform management.

## Features

- **Service Management**
  - List available services
  - Get detailed information about specific services
  - Publish new services to the Exchange
  - Delete services from the Exchange
  - Generate service definition files

- **Node Management**
  - List registered nodes
  - Get node policy details
  - Register nodes with policies
  - Unregister nodes from the Exchange

- **Policy Management**
  - List deployment policies
  - Get detailed information about specific policies
  - Check which workloads are deployed with a specific policy
  - Check service compatibility with policies
  - Delete policies from the Exchange

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Access to an Open Horizon Exchange instance
- Open Horizon Exchange credentials

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd open-horizon-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   EXCHANGE_URL=<your-exchange-url>
   EXCHANGE_ORG=<your-organization>
   EXCHANGE_CREDENTIAL=<your-base64-encoded-credentials>
   PORT=3000
   ```

## Usage

### Starting the Server

Start the server on the default port (3000):
```bash
npm start
```

Start the server on a custom port:
```bash
npm run start:port --port=8080
```

Run in development mode with auto-reload:
```bash
npm run dev
```

### Docker Support

Build Docker images for different architectures:

```bash
# For ARM64
npm run build:docker:arm64

# For AMD64
npm run build:docker:amd64
```

### IBM Cloud Code Engine Deployment

The project includes scripts for deploying to IBM Cloud Code Engine:

```bash
# Deploy to development environment
npm run deploy:dev

# Deploy to staging environment
npm run deploy:stage

# Deploy to production environment
npm run deploy:prod
```

## API Endpoints

- `POST /mcp`: Main endpoint for MCP protocol communication
- `GET /health`: Health check endpoint for monitoring

## MCP Tools

The server provides the following tools through the MCP protocol. Each tool has specific trigger phrases that AI assistants like Claude can use to recognize when to call them.

### Node Management Tools

| Tool Name | Description | Example Trigger Phrases |
|-----------|-------------|------------------------|
| `list-nodes` | List all nodes registered in the Exchange/Management Hub | "List all nodes in the Exchange", "Show me all registered nodes", "Get a list of all nodes in the Management Hub", "What nodes are registered in the system?" |
| `get-node-policy` | Get the policy associated with a specific node | "Show me the policy for node X", "What policy is applied to node X?", "Get node X policy from the Management Hub" |
| `register-node-policy` | Register a node with a policy | "Register node X with policy Y", "Apply policy Y to node X", "Add node X to the Management Hub with policy Y" |
| `unregister-node` | Unregister a node from the Exchange/Management Hub | "Unregister node X", "Remove node X from the Exchange", "Delete node X from the Management Hub" |

### Service Management Tools

| Tool Name | Description | Example Trigger Phrases |
|-----------|-------------|------------------------|
| `list-services` | List all services in the Open Horizon Exchange/Management Hub | "List all services", "Show available services", "What services are in the Exchange?", "Show services in the Management Hub" |
| `get-service-details` | Get detailed information about a specific service | "Show details for service X", "Tell me about service X", "Get information about service X from the Management Hub" |
| `publish-service` | Publish a new service to the Exchange/Management Hub | "Publish a new service", "Add service X to the Exchange", "Register service X with the Management Hub" |
| `delete-service` | Delete a service from the Exchange/Management Hub | "Delete service X", "Remove service X from the Exchange", "Remove service X from the Management Hub" |
| `generate-service-definition` | Generate a service definition file | "Generate a service definition", "Create service definition for X", "Make a service definition template" |

### Policy Management Tools

| Tool Name | Description | Example Trigger Phrases |
|-----------|-------------|------------------------|
| `list-deployment-policies` | List all deployment policies in the Exchange/Management Hub | "List all policies", "Show deployment policies", "What policies are available?", "Show policies in the Management Hub" |
| `get-policy-details` | Get detailed information about a specific policy | "Show details for policy X", "Tell me about policy X", "Get policy X information from the Management Hub" |
| `check-policy-deployments` | Check which workloads are deployed with a specific policy | "What workloads use policy X?", "Show deployments for policy X", "Which services are deployed with policy X?" |
| `check-policy-compatibility` | Check which services are compatible with a specific policy | "Which services are compatible with policy X?", "Show services compatible with policy X", "What can run with policy X?" |
| `delete-policy` | Delete a policy from the Exchange/Management Hub | "Delete policy X", "Remove policy X from the Exchange", "Delete policy X from the Management Hub" |

## Using with AI Assistants

This MCP server is designed to work with AI assistants like Claude that support the Model Context Protocol. Here are some tips to ensure the AI assistant properly recognizes and uses the available tools:

### Best Practices for Tool Recognition

1. **Use Clear and Specific Requests**
   - Instead of: "Show me the nodes"
   - Use: "List all nodes registered in the Open Horizon Exchange"

2. **Include Key Terms**
   - Include terms like "nodes", "services", "policies", "Exchange"/"Management Hub", and "Open Horizon" in your requests
   - Example: "Show me all the nodes in the Open Horizon Exchange" or "List all nodes in the Management Hub"
   - Note: The terms "Exchange" and "Management Hub" are interchangeable in Open Horizon

3. **Be Explicit About Actions**
   - Clearly state the action you want to perform (list, get details, publish, delete, etc.)
   - Example: "List all deployment policies in the Exchange"

4. **Troubleshooting**
   - If the AI isn't recognizing a tool, try rephrasing your request using the example trigger phrases listed in the MCP Tools section
   - For complex operations, break them down into smaller steps

### Example Interactions

```
User: "List all nodes registered in the Open Horizon Exchange"
AI: [Uses list-nodes tool to retrieve and display all registered nodes]

User: "Show me details about the deployment policy named 'my-policy'"
AI: [Uses get-policy-details tool to retrieve and display policy information]

User: "I want to publish a new service to the Exchange"
AI: [Uses publish-service tool and guides you through the process]
```

### Specific Tool Usage Tips

#### Using the list-nodes Tool

The `list-nodes` tool is particularly useful for viewing all edge devices registered with your Open Horizon instance. To ensure Claude recognizes when to use this tool:

- Be explicit about wanting to see "nodes" or "edge devices"
- Use phrases like:
  - "List all nodes in the Open Horizon Exchange"
  - "Show me all the nodes registered in the Management Hub"
  - "What edge devices are registered in the system?"
  - "Get a list of all nodes"
  - "Display all registered edge devices"

If Claude doesn't recognize your request, try rephrasing with one of these specific patterns.

## Templates

The server includes templates for common operations:

- `service-definition.json`: Basic service definition template
- `service-definition-with-inputs.json`: Service definition template with user inputs
- `node.policy.json`: Node policy template
- `config.json`: Configuration template
- `config-with-inputs.json`: Configuration template with user inputs

## Development

### Project Structure

```
open-horizon-mcp-server/
├── src/
│   ├── models/
│   │   └── model.ts
│   ├── services/
│   │   └── common.ts
│   ├── tools/
│   │   ├── check-policy-compatibility.ts
│   │   ├── check-policy-deployments.ts
│   │   ├── delete-policy.ts
│   │   ├── delete-service.ts
│   │   ├── generate-service-definition.ts
│   │   ├── get-node-policy.ts
│   │   ├── get-policy-details.ts
│   │   ├── get-service-details.ts
│   │   ├── list-deployment-policies.ts
│   │   ├── list-nodes.ts
│   │   ├── list-services.ts
│   │   ├── publish-service.ts
│   │   ├── register-node-policy.ts
│   │   └── unregister-node.ts
│   ├── mcp-server.ts
│   └── server.ts
├── templates/
│   ├── config-with-inputs.json
│   ├── config.json
│   ├── node.policy.json
│   ├── service-definition-with-inputs.json
│   └── service-definition.json
├── package.json
└── tsconfig.json
```

### Building the Project

```bash
npm run build
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
