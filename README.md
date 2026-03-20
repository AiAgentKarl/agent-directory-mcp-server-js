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


---

## More MCP Servers by AiAgentKarl

| Category | Servers |
|----------|---------|
| 🔗 Blockchain | [Solana](https://github.com/AiAgentKarl/solana-mcp-server) |
| 🌍 Data | [Weather](https://github.com/AiAgentKarl/weather-mcp-server) · [Germany](https://github.com/AiAgentKarl/germany-mcp-server) · [Agriculture](https://github.com/AiAgentKarl/agriculture-mcp-server) · [Space](https://github.com/AiAgentKarl/space-mcp-server) · [Aviation](https://github.com/AiAgentKarl/aviation-mcp-server) · [EU Companies](https://github.com/AiAgentKarl/eu-company-mcp-server) |
| 🔒 Security | [Cybersecurity](https://github.com/AiAgentKarl/cybersecurity-mcp-server) · [Policy Gateway](https://github.com/AiAgentKarl/agent-policy-gateway-mcp) · [Audit Trail](https://github.com/AiAgentKarl/agent-audit-trail-mcp) |
| 🤖 Agent Infra | [Memory](https://github.com/AiAgentKarl/agent-memory-mcp-server) · [Directory](https://github.com/AiAgentKarl/agent-directory-mcp-server) · [Hub](https://github.com/AiAgentKarl/mcp-appstore-server) · [Reputation](https://github.com/AiAgentKarl/agent-reputation-mcp-server) |
| 🔬 Research | [Academic](https://github.com/AiAgentKarl/crossref-academic-mcp-server) · [LLM Benchmark](https://github.com/AiAgentKarl/llm-benchmark-mcp-server) · [Legal](https://github.com/AiAgentKarl/legal-court-mcp-server) |

[→ Full catalog (40+ servers)](https://github.com/AiAgentKarl)

## License

MIT
