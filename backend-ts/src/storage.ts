/**
 * JSON-based storage for conversations
 */

import fs from 'fs/promises';
import path from 'path';
import { DATA_DIR } from './config.js';

// TypeScript interfaces
export interface Message {
  role: 'user' | 'assistant';
  content?: string;
  stage1?: ModelResponse[];
  stage2?: RankingResponse[];
  stage3?: SynthesisResponse;
}

export interface ModelResponse {
  model: string;
  content: string | null;
}

export interface RankingResponse {
  model: string;
  evaluation: string;
  parsed_ranking: string[];
}

export interface SynthesisResponse {
  content: string | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  title: string;
  messages: Message[];
}

export interface ConversationMetadata {
  id: string;
  created_at: string;
  title: string;
  message_count: number;
}

/**
 * Ensure the data directory exists
 */
export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Get the file path for a conversation
 */
export function getConversationPath(conversationId: string): string {
  return path.join(DATA_DIR, `${conversationId}.json`);
}

/**
 * Create a new conversation
 */
export async function createConversation(conversationId: string): Promise<Conversation> {
  await ensureDataDir();

  const conversation: Conversation = {
    id: conversationId,
    created_at: new Date().toISOString(),
    title: "New Conversation",
    messages: []
  };

  // Save to file
  const filePath = getConversationPath(conversationId);
  await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));

  return conversation;
}

/**
 * Load a conversation from storage
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const filePath = getConversationPath(conversationId);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Conversation;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Save a conversation to storage
 */
export async function saveConversation(conversation: Conversation): Promise<void> {
  await ensureDataDir();

  const filePath = getConversationPath(conversation.id);
  await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
}

/**
 * List all conversations (metadata only)
 */
export async function listConversations(): Promise<ConversationMetadata[]> {
  await ensureDataDir();

  const conversations: ConversationMetadata[] = [];

  try {
    const files = await fs.readdir(DATA_DIR);

    for (const filename of files) {
      if (filename.endsWith('.json')) {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        const conversation = JSON.parse(data) as Conversation;

        // Return metadata only
        conversations.push({
          id: conversation.id,
          created_at: conversation.created_at,
          title: conversation.title || "New Conversation",
          message_count: conversation.messages.length
        });
      }
    }
  } catch (error) {
    // Directory doesn't exist yet, return empty array
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  // Sort by creation time, newest first
  conversations.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return conversations;
}

/**
 * Add a user message to a conversation
 */
export async function addUserMessage(conversationId: string, content: string): Promise<void> {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  conversation.messages.push({
    role: "user",
    content
  });

  await saveConversation(conversation);
}

/**
 * Add an assistant message with all 3 stages to a conversation
 */
export async function addAssistantMessage(
  conversationId: string,
  stage1: ModelResponse[],
  stage2: RankingResponse[],
  stage3: SynthesisResponse
): Promise<void> {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  conversation.messages.push({
    role: "assistant",
    stage1,
    stage2,
    stage3
  });

  await saveConversation(conversation);
}

/**
 * Update the title of a conversation
 */
export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  conversation.title = title;
  await saveConversation(conversation);
}
