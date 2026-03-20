# Agent Directory MCP Server

MCP Server for agent and service discovery — register, search, rate, and manage AI agents and services in a local directory.

## Features

- **register_service** — Register a new service/agent with name, description, capabilities, endpoint, and tags
- **search_services** — Search by keyword, capability, or tag
- **get_service** — Get detailed information about a specific service
- **list_categories** — List all unique tags/categories with service counts
- **rate_service** — Rate a service from 1-5 with optional comment
- **remove_service** — Remove a service from the directory

## Installation

```bash
npm install -g @aiagentkarl/agent-directory-mcp-server
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agent-directory": {
      "command": "npx",
      "args": ["-y", "@aiagentkarl/agent-directory-mcp-server"]
    }
  }
}
```

## Storage

All data is stored locally in `~/.agent-directory/` as JSON files:
- `services.json` — Registered services
- `ratings.json` — Service ratings

## License

MIT
