# BrandFlow - Multi-Agent AI Marketing Assistant

BrandFlow is an intelligent multi-agent marketing application built on the DigitalOcean Gradient platform.
It ingests a company's website, extracts its core Brand DNA into a Knowledge Base (RAG), and uses specialized AI agents (Brand Strategist, Copywriter, Visual Designer, and Creative Director) to orchestrate and generate fully-realized marketing campaigns (Social Media, Emails, and Visual Prompts).

## Architecture

The project consists of two main parts:
1. **Gradient Agents (`/brandflow`)**: A Python-based multi-agent backend built using LangChain and LangGraph, deployed as endpoints via the DigitalOcean Gradient ADK.
2. **Next.js Full-Stack App (`/brandflow-backend`)**: A React (Next.js 15) application providing the user-facing UI and PostgreSQL database integration to manage Brand DNAs and Campaign histories.

---

## 1. Setup the Gradient Agents (`/brandflow`)

The AI agents handle the extraction of Brand DNA and generation of the Campaign Packs.

### Prerequisites

- Python 3.10+
- DigitalOcean Gradient account with workspace access.

### Installation

1. Navigate to the agent directory:
   ```bash
   cd brandflow
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Environment Variables

Set the following environment variables to authenticate with your Gradient workspace:
```bash
export GRADIENT_ACCESS_TOKEN="your_gradient_access_token"
export GRADIENT_WORKSPACE_ID="your_gradient_workspace_id"
```

### Deployment

Deploy the agents to DigitalOcean Gradient using the Gradient ADK CLI (ensure you have a `.gradient/agent.yml` configured or deploy via standard CLI commands):
```bash
gradient agent deploy
```
This exposes the `@entrypoint` functions (`ingest_website`, `generate_brand_dna`, and `generate_campaign_pack`).

---

## 2. Setup the Next.js Application (`/brandflow-backend`)

The web application provides the visual interface and stores campaign history using a DigitalOcean Managed PostgreSQL database.

### Prerequisites

- Node.js 20+
- PostgreSQL database (e.g., DigitalOcean Managed Database)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd brandflow-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the `brandflow-backend` directory with the following variables:
```env
# Database configuration
DO_DB_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Gradient API configuration (from Phase 1 deployment)
GRADIENT_BASE_URL="https://agents.gradient.do/v1/projects/<YOUR_PROJECT_ID>"
GRADIENT_API_KEY="do_..."

# Optional prefix for Knowledge Bases
BRANDFLOW_KB_PREFIX="brandflow_kb_"
```

### Database Setup

Initialize the database schema using Prisma:
```bash
npx prisma db push
npx prisma generate
```

### Running the Application

Start the local development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to start using BrandFlow!

---

## Deployment (Next.js App)

To deploy the web application to the **DigitalOcean App Platform**:

1. Ensure the `app.yaml` file in `brandflow-backend` correctly points to your repository.
2. Deploy using the `doctl` CLI:
   ```bash
   doctl apps create brandflow-backend --spec app.yaml
   ```
