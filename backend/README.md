# LLM Council Backend

TypeScript backend for LLM Council using **Vercel AI SDK v5** with **multi-provider support**.

## Features

- ✅ **Multi-Provider Support** - Use any AI SDK v5 provider (OpenAI, Anthropic, Google, Mistral, OpenRouter, etc.)
- ✅ **No Vendor Lock-in** - Mix and match models from different providers
- ✅ **TypeScript** - Full type safety
- ✅ **Vercel AI SDK v5** - Modern, unified AI interface
- ✅ **Express.js** - Fast HTTP endpoints
- ✅ **Server-Sent Events (SSE)** - Real-time streaming responses
- ✅ **3-Stage Council Process** - Anonymous peer review system

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Create `.env` file:
```bash
cp .env.example .env
```

### 3. Add API keys for providers you want to use:

Edit `.env` and add keys for your chosen providers:

```env
# Only add keys for providers you're using
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

### 4. Configure your council models:

Edit `src/config.ts` to choose which models participate in the council:

```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-4o", model: openai("gpt-4o") },
  { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") },
  { name: "Gemini 2.0 Flash", model: google("gemini-2.0-flash-exp") },
  { name: "Mistral Large", model: openrouter("mistralai/mistral-large-2411") },
];
```

You can use:
- **OpenAI** - `openai("gpt-4o")`, `openai("gpt-4o-mini")`
- **Anthropic** - `anthropic("claude-sonnet-4.5-20250107")`, `anthropic("claude-opus-4-20250514")`
- **Google** - `google("gemini-2.0-flash-exp")`, `google("gemini-pro")`
- **OpenRouter** - `openrouter("openai/gpt-5.1")`, `openrouter("x-ai/grok-4")`
- **Mistral** - `mistral("mistral-large-latest")`
- And more!

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production

Build and run:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /` - Health check
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations/:id/message` - Send message (non-streaming)
- `POST /api/conversations/:id/message/stream` - Send message (streaming with SSE)

## Architecture

```
src/
├── config.ts       # Model configuration (EDIT THIS to change models)
├── storage.ts      # JSON-based conversation storage
├── models.ts       # Provider-agnostic model querying
├── council.ts      # 3-stage council orchestration
└── main.ts         # Express server and API endpoints
```

## Supported Providers

Thanks to Vercel AI SDK v5, you can use:

| Provider | Package | Example Models |
|----------|---------|----------------|
| OpenAI | `@ai-sdk/openai` | gpt-4o, gpt-4o-mini |
| Anthropic | `@ai-sdk/anthropic` | claude-sonnet-4.5, claude-opus-4 |
| Google | `@ai-sdk/google` | gemini-2.0-flash-exp, gemini-pro |
| Mistral | `@ai-sdk/mistral` | mistral-large-latest |
| OpenRouter | `@openrouter/ai-sdk-provider` | 300+ models from all providers |

[See full provider list](https://sdk.vercel.ai/providers)

## Configuration Examples

### Use only OpenAI models:
```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-4o", model: openai("gpt-4o") },
  { name: "GPT-4o Mini", model: openai("gpt-4o-mini") },
  { name: "GPT-4 Turbo", model: openai("gpt-4-turbo") },
];
```

### Use only Anthropic models:
```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") },
  { name: "Claude Opus 4", model: anthropic("claude-opus-4-20250514") },
  { name: "Claude Haiku 4", model: anthropic("claude-haiku-4-20250107") },
];
```

### Mix providers (recommended for diversity):
```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-4o", model: openai("gpt-4o") },
  { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") },
  { name: "Gemini 2.0 Flash", model: google("gemini-2.0-flash-exp") },
];
```

### Use OpenRouter for everything (most flexibility):
```typescript
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-5.1", model: openrouter("openai/gpt-5.1") },
  { name: "Claude 3 Opus", model: openrouter("anthropic/claude-3-opus") },
  { name: "Grok 4", model: openrouter("x-ai/grok-4") },
  { name: "Llama 3.3 70B", model: openrouter("meta-llama/llama-3.3-70b-instruct") },
];
```

## How It Works

1. **Stage 1**: Each council model responds to the user's question independently
2. **Stage 2**: Each model evaluates all responses anonymously (Response A, B, C...) and ranks them
3. **Stage 3**: The chairman model synthesizes all responses and rankings into a final answer

The anonymization in Stage 2 prevents models from favoring responses from specific providers or their own responses.

## Development Tips

- Edit `src/config.ts` to change council composition
- Add new providers by installing their AI SDK package
- The system gracefully handles model failures (continues with successful responses)
- Parallel execution for optimal performance
- All API keys are optional - only set what you use

## License

ISC
