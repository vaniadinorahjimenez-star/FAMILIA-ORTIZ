import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous payload limits for photos/evidences
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent storage setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'family_cloud_db.json');

interface FamilyChatMessage {
  id: string;
  sender: 'Mamá' | 'Papá' | 'Regina' | 'Romina' | 'Nan';
  senderRole?: 'mama' | 'papa' | 'regina' | 'romina' | 'policia_nan';
  text: string;
  timestamp: string;
  isNoticeToMama?: boolean;
  reviewedByMama?: boolean;
  mamaComment?: string;
  mamaApprovedAt?: string;
  reactions?: Record<string, number>;
  imageDataUrl?: string;
  replyTo?: {
    id: string;
    sender: string;
    text: string;
  };
}

interface CloudDbState {
  familyChat: FamilyChatMessage[];
  completions: Record<string, boolean>;
  familyActivities: any[];
  familyNotes: any[];
  bonusLogs: any[];
  customTasks: any[];
  weeklyPayouts: Record<string, any>;
  taskEvidences: any[];
  fines: any[];
  extraPayments: any[];
  lastUpdated: string;
}

// Initial state seed
const initialSeedState: CloudDbState = {
  familyChat: [
    {
      id: 'chat-seed-1',
      sender: 'Mamá',
      senderRole: 'mama',
      text: '¡Hola mis niñas hermosas! Bienvenidos a su chat familiar en tiempo real. Aquí podemos avisarnos de tareas, mandarnos fotos y felicitaciones 💕',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'chat-seed-2',
      sender: 'Romina',
      senderRole: 'romina',
      text: '¡Hola mami! Ya saqué a pasear a Luna 🐾🌸',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'chat-seed-3',
      sender: 'Regina',
      senderRole: 'regina',
      text: '¡Hola a todos! Ya terminé mi tarea y voy a gimnasia 🤸‍♀️💜',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    }
  ],
  completions: {},
  familyActivities: [],
  familyNotes: [],
  bonusLogs: [],
  customTasks: [],
  weeklyPayouts: {},
  taskEvidences: [],
  fines: [],
  extraPayments: [],
  lastUpdated: new Date().toISOString(),
};

function loadDatabase(): CloudDbState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...initialSeedState,
        ...parsed,
        familyChat: Array.isArray(parsed.familyChat) && parsed.familyChat.length > 0 
          ? parsed.familyChat 
          : initialSeedState.familyChat,
      };
    }
  } catch (err) {
    console.warn('[Server] Could not load DB, using in-memory state:', err);
  }
  return { ...initialSeedState };
}

let dbState: CloudDbState = loadDatabase();

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to save DB to disk:', err);
  }
}

// Save initial DB if not exists
saveDatabase();

// Create HTTP server
const server = http.createServer(app);

// WebSocket server on /ws
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set<WebSocket>();

// SSE clients for /api/realtime/stream
const sseClients = new Set<express.Response>();

function broadcast(event: { type: string; [key: string]: any }) {
  const jsonStr = JSON.stringify(event);

  // 1. Send to WebSockets
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonStr);
      } catch {
        // ignore
      }
    }
  }

  // 2. Send to SSE clients
  for (const res of sseClients) {
    try {
      res.write(`data: ${jsonStr}\n\n`);
    } catch {
      // ignore
    }
  }
}

// WebSocket connection lifecycle
wss.on('connection', (ws) => {
  wsClients.add(ws);

  // Send current chat & state immediately on connect
  ws.send(JSON.stringify({
    type: 'init',
    familyChat: dbState.familyChat,
    lastUpdated: dbState.lastUpdated,
  }));

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }
      if (parsed.type === 'chat_message' && parsed.message) {
        addChatMessage(parsed.message);
      }
    } catch (e) {
      console.warn('[WS] Error processing message:', e);
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
  });

  ws.on('error', () => {
    wsClients.delete(ws);
  });
});

// SSE endpoint: /api/realtime/stream
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Initial event
  res.write(`data: ${JSON.stringify({
    type: 'init',
    familyChat: dbState.familyChat,
    lastUpdated: dbState.lastUpdated,
  })}\n\n`);

  // Periodic heartbeat every 20 seconds to prevent proxy / Safari drop
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', time: Date.now() })}\n\n`);
    } catch {
      clearInterval(heartbeatTimer);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    sseClients.delete(res);
  });
});

function addChatMessage(msg: FamilyChatMessage): FamilyChatMessage {
  // Ensure id and timestamp
  const completeMsg: FamilyChatMessage = {
    ...msg,
    id: msg.id || `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: msg.timestamp || new Date().toISOString(),
  };

  // Avoid duplicates
  const existingIdx = dbState.familyChat.findIndex((m) => m.id === completeMsg.id);
  if (existingIdx >= 0) {
    dbState.familyChat[existingIdx] = {
      ...dbState.familyChat[existingIdx],
      ...completeMsg,
    };
  } else {
    dbState.familyChat.push(completeMsg);
  }

  // Keep last 400 messages to prevent unbounded growth
  if (dbState.familyChat.length > 400) {
    dbState.familyChat = dbState.familyChat.slice(-400);
  }

  dbState.lastUpdated = new Date().toISOString();
  saveDatabase();

  // Broadcast to all devices instantly
  broadcast({
    type: 'chat_message',
    message: completeMsg,
    totalCount: dbState.familyChat.length,
  });

  return completeMsg;
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedWs: wsClients.size,
    connectedSse: sseClients.size,
    chatMessagesCount: dbState.familyChat.length,
    timestamp: new Date().toISOString(),
  });
});

// Chat GET: all messages
app.get('/api/chat', (req, res) => {
  const since = req.query.since as string;
  if (since) {
    const sinceTime = new Date(since).getTime();
    const filtered = dbState.familyChat.filter(
      (m) => new Date(m.timestamp).getTime() > sinceTime
    );
    res.json({ messages: filtered, lastUpdated: dbState.lastUpdated });
    return;
  }
  res.json({ messages: dbState.familyChat, lastUpdated: dbState.lastUpdated });
});

// Chat POST: send message
app.post('/api/chat', (req, res) => {
  const msg = req.body;
  if (!msg || (!msg.text && !msg.imageDataUrl)) {
    res.status(400).json({ error: 'Mensaje vacío' });
    return;
  }
  const saved = addChatMessage(msg);
  res.json({ success: true, message: saved });
});

// Chat DELETE message
app.delete('/api/chat/:id', (req, res) => {
  const { id } = req.params;
  const beforeLen = dbState.familyChat.length;
  dbState.familyChat = dbState.familyChat.filter((m) => m.id !== id);
  if (dbState.familyChat.length !== beforeLen) {
    dbState.lastUpdated = new Date().toISOString();
    saveDatabase();
    broadcast({ type: 'delete_message', id });
  }
  res.json({ success: true, id });
});

// Chat React
app.post('/api/chat/react', (req, res) => {
  const { messageId, emoji } = req.body;
  if (!messageId || !emoji) {
    res.status(400).json({ error: 'Faltan parámetros' });
    return;
  }
  let targetMsg: FamilyChatMessage | undefined;
  dbState.familyChat = dbState.familyChat.map((m) => {
    if (m.id === messageId) {
      const current = m.reactions?.[emoji] || 0;
      targetMsg = {
        ...m,
        reactions: {
          ...(m.reactions || {}),
          [emoji]: current + 1,
        },
      };
      return targetMsg;
    }
    return m;
  });

  if (targetMsg) {
    dbState.lastUpdated = new Date().toISOString();
    saveDatabase();
    broadcast({ type: 'update_message', message: targetMsg });
  }
  res.json({ success: true, message: targetMsg });
});

// Chat Approve Notice by Mamá
app.post('/api/chat/approve', (req, res) => {
  const { messageId, comment } = req.body;
  let targetMsg: FamilyChatMessage | undefined;
  dbState.familyChat = dbState.familyChat.map((m) => {
    if (m.id === messageId) {
      targetMsg = {
        ...m,
        reviewedByMama: true,
        mamaComment: comment,
        mamaApprovedAt: new Date().toISOString(),
      };
      return targetMsg;
    }
    return m;
  });

  if (targetMsg) {
    dbState.lastUpdated = new Date().toISOString();
    saveDatabase();
    broadcast({ type: 'update_message', message: targetMsg });
  }
  res.json({ success: true, message: targetMsg });
});

// Full Cloud Sync GET
app.get('/api/sync', (req, res) => {
  res.json(dbState);
});

// Full Cloud Sync POST (merges client state with server state)
app.post('/api/sync', (req, res) => {
  const payload = req.body;
  if (!payload) {
    res.status(400).json({ error: 'Payload vacío' });
    return;
  }

  // Merge completions
  if (payload.completions) {
    dbState.completions = { ...dbState.completions, ...payload.completions };
  }

  // Merge activities
  if (Array.isArray(payload.familyActivities)) {
    const map = new Map<string, any>();
    [...dbState.familyActivities, ...payload.familyActivities].forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    dbState.familyActivities = Array.from(map.values());
  }

  // Merge notes
  if (Array.isArray(payload.familyNotes)) {
    const map = new Map<string, any>();
    [...dbState.familyNotes, ...payload.familyNotes].forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    dbState.familyNotes = Array.from(map.values());
  }

  // Merge bonus logs
  if (Array.isArray(payload.bonusLogs)) {
    const map = new Map<string, any>();
    [...dbState.bonusLogs, ...payload.bonusLogs].forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    dbState.bonusLogs = Array.from(map.values());
  }

  // Merge custom tasks
  if (Array.isArray(payload.customTasks)) {
    const map = new Map<string, any>();
    [...dbState.customTasks, ...payload.customTasks].forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    dbState.customTasks = Array.from(map.values());
  }

  // Merge weekly payouts
  if (payload.weeklyPayouts) {
    dbState.weeklyPayouts = { ...dbState.weeklyPayouts, ...payload.weeklyPayouts };
  }

  // Merge task evidences
  if (Array.isArray(payload.taskEvidences)) {
    const map = new Map<string, any>();
    [...dbState.taskEvidences, ...payload.taskEvidences].forEach((item) => {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    dbState.taskEvidences = Array.from(map.values());
  }

  // Merge fines
  if (Array.isArray(payload.fines)) {
    const map = new Map<string, any>();
    [...dbState.fines, ...payload.fines].forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const status = item.status === 'perdonada' || existing.status === 'perdonada' ? 'perdonada' : item.status;
        map.set(item.id, { ...existing, ...item, status });
      }
    });
    dbState.fines = Array.from(map.values());
  }

  // Merge extra payments
  if (Array.isArray(payload.extraPayments)) {
    const map = new Map<string, any>();
    [...dbState.extraPayments, ...payload.extraPayments].forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const status = item.status === 'pagado' || existing.status === 'pagado' ? 'pagado' : item.status;
        map.set(item.id, { ...existing, ...item, status });
      }
    });
    dbState.extraPayments = Array.from(map.values());
  }

  // Merge family chat
  if (Array.isArray(payload.familyChat)) {
    const map = new Map<string, FamilyChatMessage>();
    [...dbState.familyChat, ...payload.familyChat].forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        map.set(item.id, {
          ...existing,
          ...item,
          reactions: { ...(existing.reactions || {}), ...(item.reactions || {}) },
          reviewedByMama: existing.reviewedByMama || item.reviewedByMama,
        });
      }
    });
    dbState.familyChat = Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  dbState.lastUpdated = new Date().toISOString();
  saveDatabase();

  // Notify all connected clients about sync update
  broadcast({
    type: 'sync_update',
    lastUpdated: dbState.lastUpdated,
    payload: dbState,
  });

  res.json(dbState);
});

// Vite middleware / Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rutinas Familia Jiménez] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
