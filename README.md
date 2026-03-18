<p align="center">
  <img src="https://img.shields.io/badge/DigitalOcean-Gradient%20AI-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white" alt="DigitalOcean Gradient AI" />
  <img src="https://img.shields.io/badge/LangGraph-Multi--Agent-4B32C3?style=for-the-badge&logo=python&logoColor=white" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

# 🚀 BrandFlow — AI Marketing Department in a Click

> **Paste your website URL → Get a complete, on-brand marketing campaign in seconds.**

BrandFlow is a production-ready, multi-agent AI marketing platform built **entirely** on the **DigitalOcean Gradient™ AI** full-stack ecosystem. It ingests any company website, extracts its core **Brand DNA** using Retrieval-Augmented Generation (RAG), and orchestrates a team of specialized AI agents to produce fully-realized, on-brand marketing campaigns — social media posts, email drafts, and AI-generated visual assets — all without a single human marketer.

---

## 📺 Demo Video

> 🎬 **[Watch the 3-Minute Demo on YouTube →](#)**
<!-- Replace # with your actual YouTube video URL -->

---

## 🎯 The Problem

Marketing teams spend **weeks** creating campaigns that align with their brand identity. Freelancers and small businesses often can't afford a marketing department. Even with AI tools, the output is generic — it doesn't *sound* like the brand.

## 💡 The Solution

BrandFlow automates the entire creative marketing workflow:

1. **Paste a website URL** — BrandFlow crawls and indexes the site into a DigitalOcean Knowledge Base.
2. **Extract Brand DNA** — An AI strategist analyzes the indexed content via RAG to identify tone, values, audience, key messages, and visual style.
3. **Generate Campaigns** — A team of specialized AI agents (Copywriter, Visual Designer) produces channel-ready content, reviewed by a Creative Director agent.
4. **Get Production Assets** — Receive X/Twitter posts, LinkedIn posts, email drafts, and AI-generated images — all consistent with the brand.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DigitalOcean Cloud Ecosystem                     │
│                                                                     │
│  ┌──────────────────────┐       ┌───────────────────────────────┐  │
│  │  DO App Platform     │       │  DO Gradient™ AI Agent (ADK)  │  │
│  │  (Next.js 15 App)    │──────▶│  Python + LangGraph           │  │
│  │                      │       │                               │  │
│  │  • React Frontend    │       │  ┌─────────────────────────┐  │  │
│  │  • API Routes        │       │  │  🎯 Brand Strategist    │  │  │
│  │  • Prisma ORM        │       │  │  (Llama 3.3 70B)        │  │  │
│  └──────┬───────────────┘       │  └────────────┬────────────┘  │  │
│         │                       │               │               │  │
│         │                       │  ┌────────────▼────────────┐  │  │
│  ┌──────▼───────────────┐       │  │  🎬 Creative Director   │  │  │
│  │  DO Managed          │       │  │  (Qwen3 32B)            │  │  │
│  │  PostgreSQL           │       │  │  Orchestrates + Reviews │  │  │
│  │  (Brand & Campaign   │       │  └──┬──────────────────┬───┘  │  │
│  │   History)            │       │     │                  │      │  │
│  └──────────────────────┘       │  ┌──▼─────────┐ ┌──────▼───┐  │  │
│                                 │  │ ✍️ Copy-   │ │ 🎨 Visual│  │  │
│  ┌──────────────────────┐       │  │  writer    │ │ Designer │  │  │
│  │  DO Knowledge Bases  │       │  │ (Llama3 8B)│ │(Qwen3 32B│  │  │
│  │  (KBaaS / RAG)       │◀──────│  └────────────┘ │+Flux img)│  │  │
│  │  Web Crawler +       │       │                  └──────────┘  │  │
│  │  Embedding Index     │       └───────────────────────────────┘  │
│  └──────────────────────┘                                          │
│                                 ┌───────────────────────────────┐  │
│                                 │  DO GPU Inference API         │  │
│                                 │  (fal-ai/flux/schnell)        │  │
│                                 │  Async Image Generation       │  │
│                                 └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🌊 DigitalOcean Gradient™ AI — Full-Stack Usage

BrandFlow leverages **every layer** of the DigitalOcean Gradient™ AI platform to deliver a production-ready experience:

### 1. Gradient ADK (Agent Development Kit)
- **What**: The Python-based agent runtime that powers BrandFlow's AI backend.
- **How**: The `@entrypoint` decorator from `gradient_adk` exposes `main.py` as a deployable agent endpoint. The ADK handles authentication, request routing, and lifecycle management — zero boilerplate server code needed.
- **Files**: [`brandflow/main.py`](brandflow/main.py), [`.gradient/agent.yml`](brandflow/.gradient/agent.yml)

### 2. Gradient LLM Inference (ChatGradient)
- **What**: Managed, GPU-backed LLM inference via `langchain-gradient`.
- **How**: BrandFlow uses **three different Gradient-hosted models**, each chosen for a specific role:

  | Agent | Model | Why |
  |-------|-------|-----|
  | **Brand Strategist** | `llama3.3-70b-instruct` | Deep reasoning needed for nuanced brand analysis from RAG context |
  | **Copywriter** | `llama3-8b-instruct` | Fast, creative generation for social/email copy |
  | **Creative Director** | `alibaba-qwen3-32b` | Strong structured-output capability for assembling & reviewing the final pack |
  | **Reviewer** | `llama3-8b-instruct` | Quick approval/rejection decisions |

- **Key Feature**: `ChatGradient.with_structured_output(PydanticSchema)` — forces LLM output into Pydantic-validated JSON schemas, ensuring type-safe agent communication.

### 3. Knowledge Bases (KBaaS) — RAG Pipeline
- **What**: DigitalOcean's managed Knowledge Base service with built-in web crawler, chunking, and vector embeddings.
- **How**:
  1. **Ingest**: BrandFlow calls the DO API to create a Knowledge Base with a `web_crawler_data_source`, using section-based chunking and the `all-mini-lm-l6-v2` embedding model.
  2. **Index**: The platform automatically crawls the target website, chunks the content, and builds a vector index.
  3. **Retrieve**: The Brand Strategist agent queries the KB via the `kbaas.do-ai.run` Retrieve API, using hybrid search (`alpha: 0.5`) to pull the top-10 most relevant brand-context chunks.
- **Files**: [`brandflow/tools/ingestor.py`](brandflow/tools/ingestor.py), [`brandflow/tools/knowledge_base.py`](brandflow/tools/knowledge_base.py)

### 4. GPU Inference API — AI Image Generation
- **What**: Async GPU inference for text-to-image generation.
- **How**: The Visual Designer agent calls the `inference.do-ai.run` async-invoke API with the `fal-ai/flux/schnell` model. It submits a prompt, polls for completion, and retrieves the generated image URL. BrandFlow generates **multiple image variants** per campaign.
- **Files**: [`brandflow/agents/visual_designer.py`](brandflow/agents/visual_designer.py)

### 5. DigitalOcean App Platform
- **What**: PaaS for deploying the Next.js web application.
- **How**: The `app.yaml` spec defines the service configuration, automatically building and running the Next.js app with environment variables for database and Gradient API connectivity.
- **Files**: [`brandflow-backend/app.yaml`](brandflow-backend/app.yaml)

### 6. DigitalOcean Managed PostgreSQL
- **What**: Fully managed database for persistent storage.
- **How**: Stores Brand records (website URL, KB ID, raw + edited Brand DNA) and Campaign history (goal, offer, full campaign pack JSON). Connected via Prisma ORM.
- **Files**: [`brandflow-backend/prisma/schema.prisma`](brandflow-backend/prisma/schema.prisma)

---

## 🤖 Multi-Agent Workflow (LangGraph)

BrandFlow uses **LangGraph** to orchestrate a team of specialized agents in a stateful, graph-based workflow with **parallel execution** and a **feedback review loop**:

```
                    ┌─────────┐
                    │  START  │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │ (parallel)          │
        ┌─────▼─────┐        ┌─────▼──────────┐
        │ Copywriter │        │ Visual Designer │
        │  Agent     │        │  Agent          │
        └─────┬──────┘        └─────┬───────────┘
              │                     │
              └──────────┬──────────┘
                         │
                  ┌──────▼──────┐
                  │  Creative   │
                  │  Director   │
                  │  REVIEWER   │
                  └──────┬──────┘
                         │
                   ┌─────┴─────┐
                   │ Approved? │
                   └─────┬─────┘
                    No ╱   ╲ Yes
                      ╱     ╲
            ┌────────╱─┐   ┌─╲────────────┐
            │ REFINE   │   │  ASSEMBLE    │
            │ (loop    │   │  Final Pack  │
            │  back)   │   └──────┬───────┘
            └──────────┘         │
                              ┌──▼──┐
                              │ END │
                              └─────┘
```

**Key Design Decisions:**
- **Parallel Execution**: Copywriter and Visual Designer run simultaneously, cutting generation time in half.
- **Review Loop**: The Creative Director reviews all output against the Brand DNA. If rejected, both agents regenerate with specific feedback — ensuring brand consistency.
- **Structured Output**: Every agent uses Pydantic schemas via `with_structured_output()`, guaranteeing type-safe data flow between nodes.
- **Stateful Memory**: LangGraph's `MemorySaver` checkpointer enables conversation-style thread persistence.

---

## 📦 Project Structure

```
brand-flow/
├── brandflow/                    # 🤖 Gradient AI Agents (Python)
│   ├── .gradient/
│   │   └── agent.yml             # Gradient ADK deployment config
│   ├── agents/
│   │   ├── strategist.py         # Brand DNA extraction (Llama 3.3 70B + RAG)
│   │   ├── copywriter.py         # Multi-channel copy generation (Llama3 8B)
│   │   └── visual_designer.py    # Image prompt + generation (Qwen3 32B + Flux)
│   ├── tools/
│   │   ├── ingestor.py           # DO Knowledge Base creation (Web Crawler API)
│   │   ├── knowledge_base.py     # DO KBaaS Retrieve API (RAG queries)
│   │   └── scraper.py            # Fallback web scraper
│   ├── main.py                   # LangGraph orchestrator + ADK entrypoint
│   ├── prompts.py                # System prompts for all agents
│   ├── schemas.py                # Pydantic schemas (BrandDNA, CampaignPack, etc.)
│   └── requirements.txt
│
├── brandflow-backend/            # 🖥️ Next.js Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page — website URL input
│   │   │   ├── brand/[brandId]/  # Brand DNA viewer + editor
│   │   │   ├── campaign/        # Campaign generation + history
│   │   │   └── api/             # Next.js API routes
│   │   │       ├── brand/       # Onboard, fetch, update Brand DNA
│   │   │       └── campaign/    # Generate + list campaigns
│   │   ├── components/
│   │   │   ├── BrandDnaEditor.tsx      # Editable Brand DNA UI
│   │   │   ├── CampaignForm.tsx        # Campaign input form
│   │   │   └── CampaignPackPreview.tsx # Tabbed campaign asset viewer
│   │   └── lib/
│   │       ├── gradient-client.ts # Gradient Agent API client
│   │       ├── schemas.ts         # Zod schemas + snake_case transforms
│   │       └── api.ts            # Frontend API helpers
│   ├── prisma/
│   │   └── schema.prisma         # Brand + Campaign database schema
│   ├── app.yaml                  # DO App Platform deployment spec
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- [DigitalOcean account](https://cloud.digitalocean.com/registrations/new) with Gradient™ AI access
- PostgreSQL database (DigitalOcean Managed Database recommended)

### 1. Deploy the Gradient Agent

```bash
cd brandflow

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GRADIENT_ACCESS_TOKEN="your_do_api_token"
export GRADIENT_WORKSPACE_ID="your_gradient_project_id"
export DIGITALOCEAN_INFERENCE_KEY="your_do_inference_api_key"

# Deploy to DigitalOcean Gradient
gradient agent deploy
```

### 2. Set Up the Web Application

```bash
cd brandflow-backend

# Install dependencies
npm install

# Configure environment
cat > .env << EOF
DO_DB_URL="postgresql://user:password@host:port/dbname?sslmode=require"
GRADIENT_BASE_URL="https://agents.gradient.do/v1/projects/<YOUR_PROJECT_ID>"
GRADIENT_API_KEY="do_..."
EOF

# Initialize database
npx prisma db push
npx prisma generate

# Run locally
npm run dev
```

### 3. Deploy to DigitalOcean App Platform

```bash
doctl apps create --spec brandflow-backend/app.yaml
```

Visit `http://localhost:3000` (local) or your App Platform URL to start using BrandFlow!

---

## 🎮 How It Works (User Flow)

| Step | Action | What Happens Under the Hood |
|------|--------|-----------------------------|
| 1️⃣ | Paste your website URL | DO Web Crawler creates a Knowledge Base, crawls the site, and builds a vector index |
| 2️⃣ | Wait for Brand DNA | Strategist agent queries the KB via RAG and extracts tone, audience, values, messages, and visual style |
| 3️⃣ | Review & Edit DNA | AI-extracted Brand DNA is editable — tweak tone, add proof points, refine messaging |
| 4️⃣ | Define Campaign | Enter your campaign goal, offer, and target audience |
| 5️⃣ | Generate Campaign Pack | LangGraph orchestrates parallel copy + visual generation, reviewed by Creative Director |
| 6️⃣ | Get Assets | Receive 3 X/Twitter posts, 1 LinkedIn post, email draft, and AI-generated images |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Agent Runtime** | DigitalOcean Gradient ADK | Agent deployment & lifecycle |
| **LLM Inference** | DO Gradient (Llama 3.3 70B, Llama3 8B, Qwen3 32B) | Text generation & structured output |
| **Image Generation** | DO GPU Inference (Flux Schnell) | On-brand visual asset creation |
| **RAG / Knowledge** | DO Knowledge Bases (KBaaS) | Website crawling, chunking, vector retrieval |
| **Agent Orchestration** | LangGraph + LangChain | Multi-agent graph with parallel execution & review loops |
| **Frontend** | Next.js 15 + React 19 | Server-rendered web application |
| **Styling** | Tailwind CSS 4 + Radix UI | Modern, polished UI components |
| **Database** | DO Managed PostgreSQL + Prisma | Persistent brand & campaign storage |
| **Deployment** | DO App Platform | Production hosting |
| **Validation** | Pydantic (Python) + Zod (TypeScript) | End-to-end type safety |

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for the <strong>DigitalOcean Gradient™ AI Hackathon</strong>
  <br/>
  <a href="https://www.digitalocean.com/products/gradient">DigitalOcean Gradient™ AI</a> · <a href="https://mlh.io">Major League Hacking</a>
</p>
