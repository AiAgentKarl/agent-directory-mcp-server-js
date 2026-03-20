#!/usr/bin/env node

// Agent Directory MCP Server
// Service-Registry und Discovery für AI-Agents und Services

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

// Speicherpfad: ~/.agent-directory/
const DATA_DIR = path.join(os.homedir(), ".agent-directory");
const SERVICES_FILE = path.join(DATA_DIR, "services.json");
const RATINGS_FILE = path.join(DATA_DIR, "ratings.json");

// Datenverzeichnis erstellen falls nötig
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Services laden
function loadServices() {
  ensureDataDir();
  if (!fs.existsSync(SERVICES_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(SERVICES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Services speichern
function saveServices(services) {
  ensureDataDir();
  fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), "utf-8");
}

// Ratings laden
function loadRatings() {
  ensureDataDir();
  if (!fs.existsSync(RATINGS_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(RATINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Ratings speichern
function saveRatings(ratings) {
  ensureDataDir();
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2), "utf-8");
}

// Durchschnittliche Bewertung berechnen
function getAverageRating(name) {
  const ratings = loadRatings();
  const serviceRatings = ratings[name] || [];
  if (serviceRatings.length === 0) return null;
  const sum = serviceRatings.reduce((acc, r) => acc + r.score, 0);
  return {
    average: Math.round((sum / serviceRatings.length) * 100) / 100,
    count: serviceRatings.length,
  };
}

// MCP Server erstellen
const server = new McpServer({
  name: "agent-directory",
  version: "0.1.0",
});

// Tool: Service registrieren
server.tool(
  "register_service",
  "Register a new service or agent in the directory",
  {
    name: z.string().describe("Unique name of the service/agent"),
    description: z
      .string()
      .describe("What the service does"),
    capabilities: z
      .array(z.string())
      .describe("List of capabilities (e.g. ['search', 'translate', 'summarize'])"),
    endpoint: z
      .string()
      .optional()
      .describe("Service endpoint URL or connection info (optional)"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags/categories for discovery (optional)"),
  },
  async ({ name, description, capabilities, endpoint, tags }) => {
    const services = loadServices();

    if (services[name]) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${name}" already exists. Remove it first to re-register.`,
          },
        ],
      };
    }

    services[name] = {
      name,
      description,
      capabilities,
      endpoint: endpoint || null,
      tags: tags || [],
      registeredAt: new Date().toISOString(),
    };

    saveServices(services);

    return {
      content: [
        {
          type: "text",
          text: `Service "${name}" registered successfully.\n\nDetails:\n- Description: ${description}\n- Capabilities: ${capabilities.join(", ")}\n- Tags: ${(tags || []).join(", ") || "none"}\n- Endpoint: ${endpoint || "not specified"}`,
        },
      ],
    };
  }
);

// Tool: Services suchen
server.tool(
  "search_services",
  "Search for services by keyword, capability, or tag",
  {
    query: z
      .string()
      .optional()
      .describe("Search keyword (matches name and description)"),
    capability: z
      .string()
      .optional()
      .describe("Filter by specific capability"),
    tag: z.string().optional().describe("Filter by tag/category"),
  },
  async ({ query, capability, tag }) => {
    const services = loadServices();
    let results = Object.values(services);

    // Nach Keyword filtern (Name und Beschreibung)
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Nach Capability filtern
    if (capability) {
      const cap = capability.toLowerCase();
      results = results.filter((s) =>
        s.capabilities.some((c) => c.toLowerCase().includes(cap))
      );
    }

    // Nach Tag filtern
    if (tag) {
      const t = tag.toLowerCase();
      results = results.filter((s) =>
        (s.tags || []).some((st) => st.toLowerCase().includes(t))
      );
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No services found matching your criteria.",
          },
        ],
      };
    }

    // Ergebnisse mit Bewertungen anreichern
    const formatted = results.map((s) => {
      const rating = getAverageRating(s.name);
      const ratingStr = rating
        ? `${rating.average}/5 (${rating.count} ratings)`
        : "no ratings";
      return `**${s.name}** [${ratingStr}]\n  ${s.description}\n  Capabilities: ${s.capabilities.join(", ")}\n  Tags: ${(s.tags || []).join(", ") || "none"}`;
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} service(s):\n\n${formatted.join("\n\n")}`,
        },
      ],
    };
  }
);

// Tool: Service-Details abrufen
server.tool(
  "get_service",
  "Get detailed information about a specific service",
  {
    name: z.string().describe("Name of the service to look up"),
  },
  async ({ name }) => {
    const services = loadServices();
    const service = services[name];

    if (!service) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${name}" not found in the directory.`,
          },
        ],
      };
    }

    const rating = getAverageRating(name);
    const ratings = loadRatings();
    const serviceRatings = ratings[name] || [];

    // Letzte Bewertungen formatieren
    const recentRatings = serviceRatings
      .slice(-5)
      .reverse()
      .map(
        (r) =>
          `  - ${r.score}/5${r.comment ? `: "${r.comment}"` : ""} (${r.ratedAt})`
      )
      .join("\n");

    const ratingStr = rating
      ? `${rating.average}/5 (${rating.count} ratings)`
      : "No ratings yet";

    return {
      content: [
        {
          type: "text",
          text: `**${service.name}**\n\nDescription: ${service.description}\nCapabilities: ${service.capabilities.join(", ")}\nTags: ${(service.tags || []).join(", ") || "none"}\nEndpoint: ${service.endpoint || "not specified"}\nRegistered: ${service.registeredAt}\nRating: ${ratingStr}${recentRatings ? `\n\nRecent ratings:\n${recentRatings}` : ""}`,
        },
      ],
    };
  }
);

// Tool: Kategorien auflisten
server.tool(
  "list_categories",
  "List all unique tags/categories and their service counts",
  {},
  async () => {
    const services = loadServices();
    const allServices = Object.values(services);

    if (allServices.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No services registered yet. The directory is empty.",
          },
        ],
      };
    }

    // Alle Tags sammeln und zählen
    const tagCounts = {};
    for (const service of allServices) {
      for (const tag of service.tags || []) {
        const normalized = tag.toLowerCase();
        if (!tagCounts[normalized]) {
          tagCounts[normalized] = { display: tag, count: 0 };
        }
        tagCounts[normalized].count++;
      }
    }

    // Alle Capabilities sammeln
    const capCounts = {};
    for (const service of allServices) {
      for (const cap of service.capabilities) {
        const normalized = cap.toLowerCase();
        if (!capCounts[normalized]) {
          capCounts[normalized] = { display: cap, count: 0 };
        }
        capCounts[normalized].count++;
      }
    }

    const tagList = Object.values(tagCounts)
      .sort((a, b) => b.count - a.count)
      .map((t) => `  - ${t.display} (${t.count} services)`)
      .join("\n");

    const capList = Object.values(capCounts)
      .sort((a, b) => b.count - a.count)
      .map((c) => `  - ${c.display} (${c.count} services)`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Directory: ${allServices.length} total services\n\n**Tags/Categories:**\n${tagList || "  No tags defined"}\n\n**Capabilities:**\n${capList || "  No capabilities defined"}`,
        },
      ],
    };
  }
);

// Tool: Service bewerten
server.tool(
  "rate_service",
  "Rate a service (1-5 stars) with an optional comment",
  {
    name: z.string().describe("Name of the service to rate"),
    score: z
      .number()
      .min(1)
      .max(5)
      .describe("Rating score from 1 (poor) to 5 (excellent)"),
    comment: z
      .string()
      .optional()
      .describe("Optional review comment"),
  },
  async ({ name, score, comment }) => {
    const services = loadServices();

    if (!services[name]) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${name}" not found. Cannot rate a non-existent service.`,
          },
        ],
      };
    }

    const ratings = loadRatings();
    if (!ratings[name]) {
      ratings[name] = [];
    }

    ratings[name].push({
      score,
      comment: comment || null,
      ratedAt: new Date().toISOString(),
    });

    saveRatings(ratings);

    const avg = getAverageRating(name);

    return {
      content: [
        {
          type: "text",
          text: `Rated "${name}" with ${score}/5${comment ? ` — "${comment}"` : ""}.\n\nNew average: ${avg.average}/5 (${avg.count} total ratings)`,
        },
      ],
    };
  }
);

// Tool: Service entfernen
server.tool(
  "remove_service",
  "Remove a service from the directory",
  {
    name: z.string().describe("Name of the service to remove"),
  },
  async ({ name }) => {
    const services = loadServices();

    if (!services[name]) {
      return {
        content: [
          {
            type: "text",
            text: `Service "${name}" not found in the directory.`,
          },
        ],
      };
    }

    delete services[name];
    saveServices(services);

    // Auch Ratings entfernen
    const ratings = loadRatings();
    if (ratings[name]) {
      delete ratings[name];
      saveRatings(ratings);
    }

    return {
      content: [
        {
          type: "text",
          text: `Service "${name}" has been removed from the directory.`,
        },
      ],
    };
  }
);

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
