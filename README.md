# 🚀 AI-Springer (Universal Publication Engine)

### GitHub | PDF | Google Docs | ZIP → Springer LNCS PDF, Fully Automated

 Convert ANY research format (Computer Science Repositories, Medical Clinical Trial PDFs, Business Survey Google Docs) into a publication-ready **Springer LNCS** formatted academic paper using 6 specialized AI agents orchestrated via n8n workflows.

---

## 🩺 The "Universal" Input Pipeline

AI-Springer is no longer restricted to just software engineering.

```
[GitHub Repo] or [Medical PDF] or [Business Doc]
    │
    ▼
1. claude-document-analyzer ──→ Normalizes any format to structured JSON
    │
    ├──→ 2. perplexity-subtitles  (Domain-specific LNCS headings, abstract, keywords)
    ├──→ 3. perplexity-references (Dynamic real-world academic citations via Google Scholar/PubMed)
    ├──→ 4. chatgpt-style         (Domain-adapted academic rewriting + 97% voice clone)
    │
    ▼
5. antigravity-latex ──→ Compiles llncs.cls + 2.5cm margins ──→ 📄 Springer PDF
    │
    ▼
6. email-dispatcher ──→ Live SMTP Relay (Emails PDF to Authors/CCs)
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

## 🤖 The 6 Agents

| Agent | Role | Model / API |
|-------|------|-----|
| **claude-document-analyzer** | Extracts text/tables from Repos, PDFs, Docs to JSON | Llama-3 / Claude |
| **perplexity-subtitles** | Generates LNCS domain-specific headings, abstract | Groq / OpenAI |
| **perplexity-references** | Generates domain-accurate academic citations | Groq Llama-3 |
| **chatgpt-style** | Rewrites content matching formal academic tone | Groq / OpenAI |
| **antigravity-latex** | Assembles `llncs.cls` LaTeX doc → Compiles PDF | Local Node Compiler |
| **email-dispatcher** | Live SMTP delivery of final PDF to all Co-Authors | Nodemailer (Gmail) |

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
