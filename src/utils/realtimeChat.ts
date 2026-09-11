import { FamilyChatMessage } from '../types';

export type RealtimeEvent =
  | { type: 'init'; familyChat: FamilyChatMessage[]; lastUpdated: string }
  | { type: 'chat_message'; message: FamilyChatMessage; totalCount?: number }
  | { type: 'update_message'; message: FamilyChatMessage }
  | { type: 'delete_message'; id: string }
  | { type: 'sync_update'; lastUpdated: string; payload?: any };

type RealtimeListener = (event: RealtimeEvent) => void;

class RealtimeChatClient {
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private reconnectTimer: any = null;
  private pollTimer: any = null;
  private isConnecting = false;
  private lastKnownTimestamp: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    this.connectWebSocket();
    this.connectSSE();
    this.startBackgroundPolling();
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: RealtimeEvent) {
    if (event.type === 'chat_message' && event.message?.timestamp) {
      this.lastKnownTimestamp = event.message.timestamp;
    }
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.warn('[RealtimeClient] Listener error:', err);
      }
    }
  }

  /**
   * 1. Primary Channel: WebSockets
   */
  private connectWebSocket() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Realtime] WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          this.notify(data);
        } catch (e) {
          // ignore
        }
      };

      this.ws.onerror = () => {
        // Handled by onclose
      };

      this.ws.onclose = () => {
        this.ws = null;
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket();
          }, 3000);
        }
      };
    } catch (e) {
      console.warn('[Realtime] WS connection failed, falling back to SSE and Polling:', e);
    }
  }

  /**
   * 2. Secondary Channel: Server-Sent Events (SSE)
   * Highly resilient on iOS Safari / iPad when WebSockets sleep.
   */
  private connectSSE() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.sse) {
      try {
        this.sse.close();
      } catch {
        // ignore
      }
    }

    try {
      this.sse = new EventSource('/api/realtime/stream');

      this.sse.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'heartbeat') return;
          this.notify(parsed as RealtimeEvent);
        } catch {
          // ignore
        }
      };

      this.sse.onerror = () => {
        // Reconnection is automatic in native EventSource
      };
    } catch (e) {
      console.warn('[Realtime] SSE not available:', e);
    }
  }

  /**
   * 3. Safety Fallback: Polling every 3 seconds
   * Guarantees syncing even if mobile network temporarily cuts streams
   */
  private startBackgroundPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);

    this.pollTimer = setInterval(async () => {
      // Check if page is visible
      if (typeof document !== 'undefined' && document.hidden) return;

      try {
        const res = await fetch('/api/chat', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.messages)) {
            this.notify({
              type: 'init',
              familyChat: json.messages,
              lastUpdated: json.lastUpdated || new Date().toISOString(),
            });
          }
        }
      } catch {
        // silent fail on network drop
      }
    }, 3000);
  }

  /**
   * Send a message to server
   */
  public async sendMessage(msg: FamilyChatMessage): Promise<FamilyChatMessage> {
    // 1. Try immediate REST call to /api/chat
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(msg),
    });

    if (!res.ok) {
      throw new Error(`Error enviando mensaje (${res.status})`);
    }

    const json = await res.json();
    const savedMsg = json.message || msg;

    // Notify locally immediately
    this.notify({ type: 'chat_message', message: savedMsg });

    // Also send via WS if active
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'chat_message', message: savedMsg }));
      } catch {
        // ignore
      }
    }

    return savedMsg;
  }

  /**
   * Delete message
   */
  public async deleteMessage(id: string): Promise<void> {
    await fetch(`/api/chat/${id}`, { method: 'DELETE' });
    this.notify({ type: 'delete_message', id });
  }

  /**
   * React to message
   */
  public async reactToMessage(messageId: string, emoji: string): Promise<void> {
    const res = await fetch('/api/chat/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, emoji }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.message) {
        this.notify({ type: 'update_message', message: json.message });
      }
    }
  }

  /**
   * Approve notice by Mamá
   */
  public async approveNotice(messageId: string, comment?: string): Promise<void> {
    const res = await fetch('/api/chat/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, comment }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.message) {
        this.notify({ type: 'update_message', message: json.message });
      }
    }
  }

  /**
   * Fetch all messages initially
   */
  public async fetchAllMessages(): Promise<FamilyChatMessage[]> {
    const res = await fetch('/api/chat', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.messages || [];
  }
}

export const realtimeChat = new RealtimeChatClient();
