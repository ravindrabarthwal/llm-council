/**
 * Express backend for LLM Council
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { PORT } from './config.js';
import * as storage from './storage.js';
import {
  runFullCouncil,
  generateConversationTitle,
  stage1CollectResponses,
  stage2CollectRankings,
  stage3SynthesizeFinal,
  calculateAggregateRankings
} from './council.js';

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Request body types
interface SendMessageRequest {
  content: string;
}

/**
 * Health check endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ status: "ok", service: "LLM Council API" });
});

/**
 * List all conversations (metadata only)
 */
app.get('/api/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversations = await storage.listConversations();
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new conversation
 */
app.post('/api/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = randomUUID();
    const conversation = await storage.createConversation(conversationId);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific conversation with all its messages
 */
app.get('/api/conversations/:conversation_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversation_id } = req.params;
    const conversation = await storage.getConversation(conversation_id);

    if (!conversation) {
      res.status(404).json({ detail: "Conversation not found" });
      return;
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

/**
 * Send a message and run the 3-stage council process
 * Returns the complete response with all stages
 */
app.post('/api/conversations/:conversation_id/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversation_id } = req.params;
    const { content } = req.body as SendMessageRequest;

    // Check if conversation exists
    const conversation = await storage.getConversation(conversation_id);
    if (!conversation) {
      res.status(404).json({ detail: "Conversation not found" });
      return;
    }

    // Check if this is the first message
    const isFirstMessage = conversation.messages.length === 0;

    // Add user message
    await storage.addUserMessage(conversation_id, content);

    // If this is the first message, generate a title
    if (isFirstMessage) {
      const title = await generateConversationTitle(content);
      await storage.updateConversationTitle(conversation_id, title);
    }

    // Run the 3-stage council process
    const result = await runFullCouncil(content);

    // Add assistant message with all stages
    await storage.addAssistantMessage(
      conversation_id,
      result.stage1,
      result.stage2,
      result.stage3
    );

    // Return the complete response with metadata
    res.json({
      stage1: result.stage1,
      stage2: result.stage2,
      stage3: result.stage3,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send a message and stream the 3-stage council process
 * Returns Server-Sent Events as each stage completes
 */
app.post('/api/conversations/:conversation_id/message/stream', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversation_id } = req.params;
    const { content } = req.body as SendMessageRequest;

    // Check if conversation exists
    const conversation = await storage.getConversation(conversation_id);
    if (!conversation) {
      res.status(404).json({ detail: "Conversation not found" });
      return;
    }

    // Check if this is the first message
    const isFirstMessage = conversation.messages.length === 0;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Add user message
      await storage.addUserMessage(conversation_id, content);

      // Start title generation in parallel (don't await yet)
      let titlePromise: Promise<string> | null = null;
      if (isFirstMessage) {
        titlePromise = generateConversationTitle(content);
      }

      // Stage 1: Collect responses
      res.write(`data: ${JSON.stringify({ type: 'stage1_start' })}\n\n`);
      const stage1Results = await stage1CollectResponses(content);
      res.write(`data: ${JSON.stringify({ type: 'stage1_complete', data: stage1Results })}\n\n`);

      // Stage 2: Collect rankings
      res.write(`data: ${JSON.stringify({ type: 'stage2_start' })}\n\n`);
      const { rankings: stage2Results, labelToModel } = await stage2CollectRankings(content, stage1Results);
      const aggregateRankings = calculateAggregateRankings(stage2Results, labelToModel);
      res.write(`data: ${JSON.stringify({
        type: 'stage2_complete',
        data: stage2Results,
        metadata: { label_to_model: labelToModel, aggregate_rankings: aggregateRankings }
      })}\n\n`);

      // Stage 3: Synthesize final answer
      res.write(`data: ${JSON.stringify({ type: 'stage3_start' })}\n\n`);
      const stage3Result = await stage3SynthesizeFinal(content, stage1Results, stage2Results);
      res.write(`data: ${JSON.stringify({ type: 'stage3_complete', data: stage3Result })}\n\n`);

      // Wait for title generation if it was started
      if (titlePromise) {
        const title = await titlePromise;
        await storage.updateConversationTitle(conversation_id, title);
        res.write(`data: ${JSON.stringify({ type: 'title_complete', data: { title } })}\n\n`);
      }

      // Save complete assistant message
      await storage.addAssistantMessage(
        conversation_id,
        stage1Results,
        stage2Results,
        stage3Result
      );

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      res.end();

    } catch (error) {
      // Send error event
      res.write(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`);
      res.end();
    }
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    detail: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LLM Council API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
