# 🚀 AI-Springer

### GitHub → Springer LNCS PDF, Fully Automated

Convert any GitHub repository into a publication-ready **Springer LNCS** formatted academic paper using 5 specialized AI agents orchestrated via n8n workflows.

---

## 🧠 Pipeline

```
GitHub URL
    │
    ▼
claude-repo-analyzer ──→ JSON analysis
    │
    ├──→ perplexity-subtitles  (LNCS section headings, abstract, keywords)
    ├──→ gemini-results        (LaTeX tables: F1=92.3%, accuracy, etc.)
    ├──→ chatgpt-style         (97% author voice clone)
    │
    ▼
antigravity-latex ──→ llncs.cls + 2.5cm margins ──→ 📄 Springer PDF
```

---

## 📦 Project Structure

```
ai-spinger/
├── .env                             # Environment variables
├── README.md                        # This file
├── AGENTS.md                        # Master agent rules & architecture
├── docker-compose.test.yml          # n8n local test environment
├── agents/
│   ├── claude-repo-analyzer/        # GitHub JSON parser
│   │   └── AGENTS.md
│   ├── perplexity-subtitles/        # Springer LNCS subtitles
│   │   └── AGENTS.md
│   ├── gemini-results/              # LaTeX F1=92.3% tables
│   │   └── AGENTS.md
│   ├── chatgpt-style/               # 97% voice clone
│   │   └── AGENTS.md
│   └── antigravity-latex/           # LNCS 2.5cm margins → PDF
│       └── AGENTS.md
├── n8n-workflow/
│   └── github-to-pdf.workflow.json  # Webhook → parallel agents → merge
├── frontend/                        # Next.js UI
│   ├── app/
│   │   ├── layout.tsx               # Root layout + SEO
│   │   ├── page.tsx                 # Main UI (URL input → PDF download)
│   │   ├── globals.css              # Design system
│   │   └── api/
│   │       ├── health/route.ts      # Health check endpoint
│   │       └── convert/route.ts     # GitHub → PDF API
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   ├── Dockerfile.n8n               # Custom n8n image
│   ├── Dockerfile.frontend          # Multi-stage Next.js build
│   └── docker-compose.yml           # Production stack
└── aws/
    ├── ecs-task-definition.json     # Fargate task def
    └── cloudformation.yml           # Full infra stack
```

---

## 🤖 The 5 Agents

| Agent | Role | API |
|-------|------|-----|
| **claude-repo-analyzer** | Clones repo → structured JSON (files, README, metrics) | Anthropic Claude |
| **perplexity-subtitles** | Generates LNCS headings, abstract, keywords | Perplexity |
| **gemini-results** | Creates LaTeX benchmark tables (F1, accuracy) | Google Gemini |
| **chatgpt-style** | Rewrites content matching author's voice (97%) | OpenAI GPT-4 |
| **antigravity-latex** | Assembles `llncs.cls` doc, 2.5cm margins → PDF | Gemini |

---

## 🏃 Quick Start

```bash
# 1. Clone
git clone https://github.com/your-username/ai-springer.git
cd ai-springer

# 2. Start n8n locally
docker-compose -f docker-compose.test.yml up -d

# 3. Run tests (TEST-FIRST!)
npm test

# 4. Start frontend
cd frontend && npm run dev
```

---

## 🧪 Test-First Approach

Tests are written **before** implementation. Every agent has a corresponding test file.

---

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `n8n` | 5678 | Workflow orchestrator |
| `frontend` | 3000 | Next.js UI |

---

## ☁️ AWS ECS

Fargate serverless deployment with auto-scaling, CloudWatch logs, and Secrets Manager.

---

## 📄 License

MIT
