import { WS_URL } from "@/api/client";

export interface WSMessage {
  type: "joined" | "secure_msg" | "delivered" | "event" | "error";
  room?: string;
  sender?: number;
  blob_hex?: string;
  to?: number;
  payload?: any;
  message?: string;
}

export function createSocket() {
  let ws: WebSocket | null = null;
  const listeners = new Map<string, Set<(msg: WSMessage) => void>>();
  let reconnectTimeout: NodeJS.Timeout | null = null;

  function connect() {
    try {
      ws = new WebSocket(`${WS_URL}/ws`);
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as WSMessage;
          const set = listeners.get(data.type);
          set?.forEach((cb) => cb(data));
          
          // Also trigger 'any' listeners
          const anySet = listeners.get("any");
          anySet?.forEach((cb) => cb(data));
        } catch (err) {
          console.error("Failed to parse WS message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => {
        console.log("WebSocket closed, reconnecting...");
        reconnectTimeout = setTimeout(connect, 2000);
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      reconnectTimeout = setTimeout(connect, 2000);
    }
  }

  function on(type: string, cb: (msg: WSMessage) => void) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(cb);
    return () => listeners.get(type)!.delete(cb);
  }

  function send(msg: any) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      console.warn("WebSocket not ready, message not sent:", msg);
    }
  }

  function join(room: string) {
    send({ action: "join", room });
  }

  function close() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    ws?.close();
  }

  connect();
  return { on, send, join, close };
}
