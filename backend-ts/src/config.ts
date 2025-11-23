/**
 * Configuration for the LLM Council
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenRouter API key
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

// Council members - list of OpenRouter model identifiers
export const COUNCIL_MODELS = [
  "openai/gpt-5.1",
  "google/gemini-3-pro-preview",
  "anthropic/claude-sonnet-4.5",
  "x-ai/grok-4",
];

// Chairman model - synthesizes final response
export const CHAIRMAN_MODEL = "google/gemini-3-pro-preview";

// Data directory for conversation storage
export const DATA_DIR = path.join(__dirname, '../data/conversations');

// Server port
export const PORT = process.env.PORT || 8001;
