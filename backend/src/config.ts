/**
 * Configuration for the LLM Council
 *
 * This file defines which AI models participate in the council and which model acts as chairman.
 * You can use any provider supported by Vercel AI SDK v5:
 * - OpenAI (@ai-sdk/openai)
 * - Anthropic (@ai-sdk/anthropic)
 * - Google (@ai-sdk/google)
 * - Mistral (@ai-sdk/mistral)
 * - OpenRouter (@openrouter/ai-sdk-provider)
 * - And many more community providers
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize providers with API keys from environment variables
// Users only need to set keys for the providers they want to use

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google provider is imported directly, no need to create instance

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Model configuration interface
 */
export interface ModelConfig {
  name: string; // Display name (e.g., "GPT-4o")
  model: any;   // The actual AI SDK model instance (any provider)
}

/**
 * Council members - list of models that will provide individual responses
 *
 * Examples of how to configure different providers:
 *
 * OpenAI:
 *   { name: "GPT-4o", model: openai("gpt-4o") }
 *
 * Anthropic:
 *   { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") }
 *
 * Google:
 *   { name: "Gemini Pro", model: google("gemini-2.0-flash-exp") }
 *
 * OpenRouter (access to 300+ models):
 *   { name: "GPT-5.1", model: openrouter("openai/gpt-5.1") }
 *   { name: "Grok 4", model: openrouter("x-ai/grok-4") }
 */
export const COUNCIL_MODELS: ModelConfig[] = [
  { name: "GPT-4o", model: openai("gpt-4o") },
  { name: "Claude Sonnet 4.5", model: anthropic("claude-sonnet-4.5-20250107") },
  { name: "Gemini 2.0 Flash", model: google("gemini-2.0-flash-exp") },
  { name: "Mistral Large", model: openrouter("mistralai/mistral-large-2411") },
];

/**
 * Chairman model - synthesizes the final response
 * This can be the same as one of the council members or a different model
 */
export const CHAIRMAN_CONFIG: ModelConfig = {
  name: "Gemini 2.0 Flash",
  model: google("gemini-2.0-flash-exp")
};

/**
 * Title generation model - used for generating conversation titles
 * Use a fast, cheap model for this task
 */
export const TITLE_MODEL_CONFIG: ModelConfig = {
  name: "GPT-4o Mini",
  model: openai("gpt-4o-mini")
};

// Data directory for conversation storage
export const DATA_DIR = path.join(__dirname, '../data/conversations');

// Server port
export const PORT = process.env.PORT || 8001;
