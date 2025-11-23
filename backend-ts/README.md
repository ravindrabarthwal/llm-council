# LLM Council Backend - TypeScript Edition

This is the TypeScript implementation of the LLM Council backend, using **Vercel AI SDK v5** with the **OpenRouter provider**.

## Features

- ✅ TypeScript for type safety
- ✅ Vercel AI SDK v5 integration
- ✅ OpenRouter provider for access to 300+ LLM models
- ✅ Express.js for HTTP endpoints
- ✅ Server-Sent Events (SSE) for streaming responses
- ✅ Full 3-stage council deliberation process

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your OpenRouter API key to `.env`:**
   ```
   OPENROUTER_API_KEY=your_key_here
   PORT=8001
   ```

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
├── config.ts       # Configuration (API keys, models, etc.)
├── storage.ts      # JSON-based conversation storage
├── openrouter.ts   # Vercel AI SDK integration with OpenRouter
├── council.ts      # 3-stage council logic
└── main.ts         # Express server and endpoints
```

## Key Differences from Python Version

- Uses Vercel AI SDK v5's `generateText()` instead of raw HTTP calls
- Express.js instead of FastAPI
- TypeScript types for all data structures
- Async/await throughout (Promise-based instead of asyncio)
- ES modules instead of CommonJS

## Configuration

Edit `src/config.ts` to change:
- Council models
- Chairman model
- Data directory
- Server port
