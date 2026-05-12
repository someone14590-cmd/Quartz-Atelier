export type ChatMessage = {
  id: string;
  session_id: string;
  name: string;
  email: string;
  message: string;
  sender: "visitor" | "admin";
  status: "new" | "read";
  created_at: string;
};

type ChatMode = "visitor" | "admin";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const SESSION_KEY = "quartz_chat_session";
const CHAT_API = "/api/chat-messages";
const CHAT_MARK_READ_API = "/api/chat-mark-read";
const POLL_INTERVAL_MS = 6000;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const parseResponse = async <T,>(response: Response) => {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload || !payload.ok) {
    const message = payload?.error ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload.data as T;
};

export const getChatSessionId = () => {
  if (!canUseStorage()) return "";
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SESSION_KEY, id);
  return id;
};

export const fetchChatMessages = async (mode: ChatMode, sessionId?: string) => {
  const params = new URLSearchParams({ mode });
  if (sessionId) {
    params.set("sessionId", sessionId);
  }

  try {
    const response = await fetch(`${CHAT_API}?${params.toString()}`);
    const data = await parseResponse<ChatMessage[]>(response);
    return data ?? [];
  } catch (error) {
    console.error(error);
    return [] as ChatMessage[];
  }
};

export const subscribeToChatMessages = (_mode: ChatMode, onChange: () => void, _sessionId?: string) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const intervalId = window.setInterval(() => onChange(), POLL_INTERVAL_MS);
  return () => window.clearInterval(intervalId);
};

export const sendChatMessage = async (args: {
  sessionId: string;
  name: string;
  email: string;
  message: string;
  sender: "visitor" | "admin";
}) => {
  try {
    const response = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    await parseResponse(response);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const markVisitorMessagesRead = async (sessionId?: string) => {
  try {
    const response = await fetch(CHAT_MARK_READ_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    await parseResponse(response);
  } catch (error) {
    console.error(error);
  }
};
