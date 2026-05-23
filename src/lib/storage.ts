// ── Types ──
export type Mode = "socratic" | "feynman" | null;
export type ModelId =
  | "deepseek-chat"
  | "deepseek-reasoner"
  | "deepseek-v4-flash"
  | "deepseek-v4-pro";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationMeta {
  id: string;
  title: string;
  mode: Mode;
  model: ModelId;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Conversation extends ConversationMeta {
  material: string;
  messages: Message[];
}

// ── Keys ──
const LIST_KEY = "learnroom-conversations";
const CURRENT_KEY = "learnroom-current";

// ── Helpers ──
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readAll(): Conversation[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function writeAll(convs: Conversation[]): void {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(convs));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ── Public API ──

export function listConversations(): ConversationMeta[] {
  return readAll()
    .map(({ id, title, mode, model, messageCount, createdAt, updatedAt }) => ({
      id,
      title,
      mode,
      model,
      messageCount,
      createdAt,
      updatedAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | null {
  return readAll().find((c) => c.id === id) ?? null;
}

export function saveConversation(conv: Conversation): void {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === conv.id);
  if (idx >= 0) {
    all[idx] = conv;
  } else {
    all.push(conv);
  }
  writeAll(all);
}

export function deleteConversation(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id));
  if (getCurrentId() === id) {
    clearCurrentId();
  }
}

export function getCurrentId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentId(id: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch {
    // ignore
  }
}

export function clearCurrentId(): void {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore
  }
}
