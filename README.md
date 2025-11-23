# LLM Council

![llmcouncil](header.jpg)

The idea of this repo is that instead of asking a question to your favorite LLM provider (e.g. OpenAI GPT-4o, Google Gemini 2.0, Anthropic Claude Sonnet 4.5, etc.), you can group them into your "LLM Council". This repo is a simple, local web app that essentially looks like ChatGPT except it sends your query to multiple LLMs, it then asks them to review and rank each other's work, and finally a Chairman LLM produces the final response.

In a bit more detail, here is what happens when you submit a query:

1. **Stage 1: First opinions**. The user query is given to all LLMs individually, and the responses are collected. The individual responses are shown in a "tab view", so that the user can inspect them all one by one.
2. **Stage 2: Review**. Each individual LLM is given the responses of the other LLMs. Under the hood, the LLM identities are anonymized so that the LLM can't play favorites when judging their outputs. The LLM is asked to rank them in accuracy and insight.
3. **Stage 3: Final response**. The designated Chairman of the LLM Council takes all of the model's responses and compiles them into a single final answer that is presented to the user.

## Vibe Code Alert

This project was 99% vibe coded as a fun Saturday hack because I wanted to explore and evaluate a number of LLMs side by side in the process of [reading books together with LLMs](https://x.com/karpathy/status/1990577951671509438). It's nice and useful to see multiple responses side by side, and also the cross-opinions of all LLMs on each other's outputs. I'm not going to support it in any way, it's provided here as is for other people's inspiration and I don't intend to improve it. Code is ephemeral now and libraries are over, ask your LLM to change it in whatever way you like.

## Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 2. Configure API Keys

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add API keys for the providers you want to use:

```env
# Only add keys for providers you're using
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

### 3. Configure Models (Optional)

Edit `backend/src/config.ts` to customize the council:

```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-4o", model: openai("gpt-4o") },
  { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") },
  { name: "Gemini 2.0 Flash", model: google("gemini-2.0-flash-exp") },
  { name: "Mistral Large", model: openrouter("mistralai/mistral-large-2411") },
];

export const CHAIRMAN_CONFIG: ModelConfig = {
  name: "Gemini 2.0 Flash",
  model: google("gemini-2.0-flash-exp")
};
```

**You can mix and match models from any provider!** No vendor lock-in.

## Running the Application

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Tech Stack

- **Backend:** TypeScript with Vercel AI SDK v5, Express.js, multi-provider support
- **Frontend:** React + Vite, react-markdown for rendering
- **Storage:** JSON files in `data/conversations/`
- **AI Providers:** OpenAI, Anthropic, Google, Mistral, OpenRouter, and more

## Features

- ✅ **Multi-Provider Support** - Use models from OpenAI, Anthropic, Google, Mistral, OpenRouter, etc.
- ✅ **No Vendor Lock-in** - Mix and match models from different providers
- ✅ **TypeScript** - Full type safety
- ✅ **Anonymous Peer Review** - Models evaluate each other's responses without knowing who wrote them
- ✅ **Real-time Streaming** - Server-Sent Events for progressive updates
- ✅ **Modern Stack** - Vercel AI SDK v5, Express.js, React

## Supported Providers

Thanks to Vercel AI SDK v5, you can use:

- **OpenAI** - gpt-4o, gpt-4o-mini, etc.
- **Anthropic** - claude-sonnet-4.5, claude-opus-4, etc.
- **Google** - gemini-2.0-flash-exp, gemini-pro, etc.
- **Mistral** - mistral-large-latest, etc.
- **OpenRouter** - 300+ models from all providers

[See full provider list](https://sdk.vercel.ai/providers)
