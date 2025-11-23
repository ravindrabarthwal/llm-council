/**
 * OpenRouter API client using Vercel AI SDK v5
 */

import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { OPENROUTER_API_KEY } from './config.js';

// Create OpenRouter provider instance
const openrouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

export interface ModelResponse {
  content: string | null;
  reasoning_details?: any;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Query a single model via OpenRouter using Vercel AI SDK
 */
export async function queryModel(
  model: string,
  messages: Message[],
  timeout: number = 120000
): Promise<ModelResponse | null> {
  try {
    // Extract model name from "provider/model" format
    // OpenRouter models are in format like "openai/gpt-4o" or "google/gemini-2.5-flash"
    const modelName = model;

    const result = await generateText({
      model: openrouter(modelName),
      messages,
      abortSignal: AbortSignal.timeout(timeout),
    });

    return {
      content: result.text,
    };
  } catch (error) {
    console.error(`Error querying model ${model}:`, error);
    return null;
  }
}

/**
 * Query multiple models in parallel
 */
export async function queryModelsParallel(
  models: string[],
  messages: Message[]
): Promise<Record<string, ModelResponse | null>> {
  // Create tasks for all models
  const tasks = models.map(model => queryModel(model, messages));

  // Wait for all to complete
  const responses = await Promise.all(tasks);

  // Map models to their responses
  const result: Record<string, ModelResponse | null> = {};
  models.forEach((model, index) => {
    result[model] = responses[index];
  });

  return result;
}
