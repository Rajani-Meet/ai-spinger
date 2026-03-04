# AGENTS.md — AI-Springer: GitHub → Springer LNCS PDF

## Mission
Convert any GitHub repository into a publication-ready **Springer LNCS** formatted PDF paper.
Pipeline: `GitHub URL → 5 AI Agents (parallel via n8n) → LaTeX → Springer PDF`

---

## The 5 Agents

| # | Agent Folder | Role | What It Does |
|---|-------------|------|-------------|
| 1 | `agents/claude-repo-analyzer/` | **GitHub JSON Parser** | Clones repo, extracts README, code structure, metrics, dependencies → structured JSON analysis |
| 2 | `agents/perplexity-subtitles/` | **Springer LNCS Subtitles** | Generates section headings, abstract, keywords per LNCS template rules |
| 3 | `agents/gemini-results/` | **LaTeX Results Tables** | Produces benchmark tables (F1=92.3%, accuracy, etc.) from repo data, outputs LaTeX `\begin{table}` |
| 4 | `agents/chatgpt-style/` | **97% Voice Clone** | Rewrites content matching author's writing style, ensures academic tone consistency |
| 5 | `agents/antigravity-latex/` | **LNCS LaTeX Compiler** | Assembles final LaTeX document with `llncs.cls`, 2.5cm margins, compiles to PDF |

---

## Architecture

```
GitHub URL
    │
    ▼
┌─────────────────────────────────────────────────┐
│              n8n Workflow Engine                  │
│  Webhook trigger → Fan-out to parallel agents    │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────────┐   ┌─────────────────────┐ │
│  │ claude-repo-      │   │ perplexity-         │ │
│  │ analyzer          │──▶│ subtitles           │ │
│  │ (GitHub→JSON)     │   │ (LNCS headings)     │ │
│  └──────────────────┘   └─────────────────────┘ │
│           │                        │              │
│           ▼                        ▼              │
│  ┌──────────────────┐   ┌─────────────────────┐ │
│  │ gemini-results    │   │ chatgpt-style       │ │
│  │ (LaTeX tables)    │   │ (voice clone)       │ │
│  └──────────────────┘   └─────────────────────┘ │
│           │                        │              │
│           └────────┬───────────────┘              │
│                    ▼                              │
│        ┌─────────────────────┐                   │
│        │ antigravity-latex   │                   │
│        │ (LNCS compile→PDF) │                   │
│        └─────────────────────┘                   │
│                    │                              │
│                    ▼                              │
│              Springer PDF                         │
└─────────────────────────────────────────────────┘
```

---

## Agent Interface Contract

Every agent MUST implement:

```typescript
interface IAgent {
  id: string;
  name: string;
  version: string;
  execute(input: AgentInput): Promise<AgentOutput>;
  healthCheck(): Promise<HealthStatus>;
  getCapabilities(): AgentCapability[];
}
```

## Agent Folder Structure

```
agents/<agent-name>/
├── index.ts          # Entry point & exports
├── agent.ts          # Core agent class (extends BaseAgent)
├── prompts.ts        # LLM prompt templates
├── types.ts          # Agent-specific types
└── README.md         # Agent documentation
```

---

## Communication Rules

1. Agents communicate ONLY through **n8n webhook triggers**
2. All messages use the **AgentMessage** envelope format
3. Direct agent-to-agent calls are **FORBIDDEN**
4. Orchestration flow: `claude-repo-analyzer` runs first → feeds into parallel `perplexity-subtitles`, `gemini-results`, `chatgpt-style` → all merge into `antigravity-latex`

## Message Envelope

```typescript
interface AgentMessage {
  id: string;                    // UUID v4
  timestamp: string;             // ISO 8601
  source: string;                // Source agent ID
  target: string;                // Target agent ID
  type: 'request' | 'response' | 'error' | 'event';
  payload: Record<string, any>;
  metadata: {
    correlationId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    ttl: number;
  };
}
```

---

## TEST-FIRST Rules (Mandatory)

1. **Write tests BEFORE implementation** — no exceptions
2. Every agent: `tests/unit/agents/<agent-name>.test.ts`
3. Integration: `tests/integration/pipeline.test.ts`
4. E2E: `tests/e2e/github-to-pdf.test.ts`
5. Minimum **80% code coverage**

## Tech Stack

- **Runtime**: Node.js 20 + TypeScript (strict)
- **Testing**: Jest + Supertest
- **API**: Express.js
- **Workflows**: n8n (self-hosted, Docker)
- **Containers**: Docker + Docker Compose
- **Cloud**: AWS ECS Fargate
- **Frontend**: Next.js
- **LaTeX**: pdflatex + llncs.cls

## Docker Rules

- Multi-stage builds, non-root user
- Health check endpoints on every service
- `docker-compose.test.yml` for local n8n testing
- `Dockerfile.n8n` and `Dockerfile.frontend` in `docker/`

## AWS ECS Rules

- Fargate launch type (serverless)
- Service discovery via Cloud Map
- Secrets via AWS Secrets Manager
- CloudWatch logs, auto-scaling on CPU/memory
