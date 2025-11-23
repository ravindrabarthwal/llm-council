/**
 * Model query utilities using Vercel AI SDK v5
 *
 * This module is provider-agnostic - it works with any AI SDK provider
 */

import { generateText, type CoreMessage } from 'ai';
import type { ModelConfig } from './config.js';

export interface ModelResponse {
  content: string | null;
}

export type Message = CoreMessage;

/**
 * Query a single model using Vercel AI SDK
 */
export async function queryModel(
  modelConfig: ModelConfig,
  messages: Message[],
  timeout: number = 120000
): Promise<ModelResponse | null> {
  try {
    const result = await generateText({
      model: modelConfig.model,
      messages,
      abortSignal: AbortSignal.timeout(timeout),
    });

    return {
      content: result.text,
    };
  } catch (error) {
    console.error(`Error querying model ${modelConfig.name}:`, error);
    return null;
  }
}

/**
 * Query multiple models in parallel
 */
export async function queryModelsParallel(
  modelConfigs: ModelConfig[],
  messages: Message[]
): Promise<Map<string, ModelResponse | null>> {
  // Create tasks for all models
  const tasks = modelConfigs.map(config => queryModel(config, messages));

  // Wait for all to complete
  const responses = await Promise.all(tasks);

  // Map model names to their responses
  const result = new Map<string, ModelResponse | null>();
  modelConfigs.forEach((config, index) => {
    result.set(config.name, responses[index]);
  });

  return result;
}
