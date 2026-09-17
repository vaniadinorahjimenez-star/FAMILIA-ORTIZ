import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Fallback curated facts for offline or instant delivery
interface FunFactPayload {
  title: string;
  fact: string;
  category: 'dogs' | 'science';
  didYouKnow: string;
  encouragement: string;
  emoji: string;
  source: 'gemini' | 'curated';
}

const CURATED_FACTS: FunFactPayload[] = [
  {
    title: '¡Super olfato perruno! 🐾👃',
    fact: 'El sentido del olfato de perritas como Luna es hasta 100,000 veces más potente que el de los humanos. ¡Pueden oler una gota de agua azucarada en una piscina olímpica!',
    category: 'dogs',
    didYouKnow: 'La nariz de cada perro tiene un patrón único, ¡como la huella dactilar de un humano!',
    encouragement: '¡Romina y Regina, con ese mismo superpoder van a terminar sus tareas hoy!',
    emoji: '🐶',
    source: 'curated',
  },
  {
    title: '¡Los poodles son genios peludos! 🐩✨',
    fact: 'Los Poodles (como Luna) son considerados la segunda raza de perros más inteligente de todo el planeta. ¡Pueden aprender trucos nuevos en menos de 5 repeticiones!',
    category: 'dogs',
    didYouKnow: 'El pelaje rizado de los poodles nunca deja de crecer y casi no suelta pelo, por eso son hipoalergénicos.',
    encouragement: '¡Luna está súper orgullosa de ver cómo aprenden cada día en sus rutinas!',
    emoji: '🐩',
    source: 'curated',
  },
  {
    title: '¿Los perros sueñan? 💤🐶',
    fact: 'Cuando ves a Luna mover sus patitas o hacer ruiditos dormida, ¡está en fase REM soñando! Los científicos descubrieron que los perros sueñan con correr, jugar con sus humanas favoritas y comer premios.',
    category: 'dogs',
    didYouKnow: 'Los cachorros y perros pequeños sueñan más seguido que los perros gigantes.',
    encouragement: '¡A cumplir las metas del día para tener los sueños más felices esta noche!',
    emoji: '🐾',
    source: 'curated',
  },
  {
    title: '¡Orejas con 18 supermúsculos! 🐕👂',
    fact: 'Los perros tienen más de 18 músculos en cada oreja. Por eso pueden moverlas en todas direcciones como antenas de radar para escuchar sonidos que nosotros ni imaginamos.',
    category: 'dogs',
    didYouKnow: 'Pueden escuchar sonidos a cuatro veces más distancia que los humanos.',
    encouragement: '¡Atentas como radar para ganar todos los puntos de hoy!',
    emoji: '👂',
    source: 'curated',
  },
  {
    title: '¡Lluvia de diamantes en el espacio! 💎🪐',
    fact: 'En planetas gigantes como Neptuno y Saturno, la presión y temperatura son tan intensas que el carbono se comprime en el aire y ¡llueven diamantes reales del cielo!',
    category: 'science',
    didYouKnow: '¡En Júpiter y Saturno podrían formarse hasta 1,000 toneladas de diamantes al año!',
    encouragement: '¡El universo está lleno de magia científica! ¡A brillar en sus tareas, chicas!',
    emoji: '🪐',
    source: 'curated',
  },
  {
    title: '¡El corazón de un colibrí! 💓🌸',
    fact: 'El corazón de un pequeño colibrí puede latir hasta 1,260 veces por minuto mientras vuela y aletea 80 veces por segundo. ¡Es el motor biológico más rápido!',
    category: 'science',
    didYouKnow: 'Los colibríes son las únicas aves capaces de volar hacia atrás y de cabeza.',
    encouragement: '¡Con esa misma energía y velocidad van a terminar gimnasia y piano hoy!',
    emoji: '✨',
    source: 'curated',
  },
  {
    title: '¡Los pulpos tienen tres corazones! 🐙💙',
    fact: 'Los pulpos tienen tres corazones y su sangre es de color azul porque usan cobre para transportar oxígeno. Además, dos tercios de sus neuronas están en sus tentáculos.',
    category: 'science',
    didYouKnow: '¡Si un pulpo pierde un tentáculo, puede regenerarlo por completo!',
    encouragement: '¡Regina y Romina son súper inteligentes y curiosas como los científicos!',
    emoji: '🐙',
    source: 'curated',
  },
  {
    title: '¡La Luna se aleja de la Tierra! 🌕🚀',
    fact: 'Cada año, la Luna se aleja aproximadamente 3.8 centímetros de la Tierra (más o menos la velocidad a la que crecen tus uñas). ¡Hace millones de años se veía gigantesca en el cielo!',
    category: 'science',
    didYouKnow: 'En la Luna no hay viento, por lo que las pisadas de los astronautas durarán millones de años.',
    encouragement: '¡Paso a pasito, cada tarea completada las acerca a la meta de la semana!',
    emoji: '🚀',
    source: 'curated',
  },
  {
    title: '¿Por qué bostezan los perros? 🐶🥱',
    fact: 'Cuando un perro bosteza no siempre tiene sueño; muchas veces lo hace para calmarse a sí mismo o para decirte "estoy tranquilo contigo". Además, ¡el bostezo humano también es contagioso para ellos!',
    category: 'dogs',
    didYouKnow: 'Si finges un bostezo frente a un perrito que te quiere mucho, ¡probablemente él también bostezará!',
    encouragement: '¡Luna les manda un lengüetazo lleno de cariño para motivarlas hoy!',
    emoji: '🐕',
    source: 'curated',
  },
  {
    title: '¡El ADN de los plátanos y humanos! 🍌🧬',
    fact: '¡Los seres humanos compartimos aproximadamente el 50% de nuestro ADN con los plátanos! Esto demuestra que todas las formas de vida en la Tierra estamos conectadas por la evolución.',
    category: 'science',
    didYouKnow: '¡Con los chimpancés compartimos casi el 99% de nuestro código genético!',
    encouragement: '¡A comer una fruta rica y recargar pilas para las actividades!',
    emoji: '🔬',
    source: 'curated',
  }
];

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
  familyPhotos: any[];
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
  familyPhotos: [
    {
      id: 'photo-seed-1',
      title: 'Tarde de parque con Lunita 🐩🌳',
      description: 'Fuimos al parque a correr con Luna. Romina le lanzó la pelota y Regina le enseñó a dar la patita. ¡Un día súper divertido en familia!',
      date: '2026-09-15',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      imageDataUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
      uploadedBy: 'mama',
      uploadedByName: 'Mamá 👩',
      category: 'paseo_luna',
      reactions: { '❤️': 4, '🐾': 3, '🌟': 2 },
    },
    {
      id: 'photo-seed-2',
      title: 'Tardes de piano y estudio 🎹🎶',
      description: 'Regina practicó su escala favorita y Romina se aprendió una canción nueva. Mamá y Papá estuvieron aplaudiendo al final del recitalito casero.',
      date: '2026-09-16',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      imageDataUrl: 'https://images.unsplash.com/photo-1520523839898-507127054976?w=800&auto=format&fit=crop&q=80',
      uploadedBy: 'regina',
      uploadedByName: 'Regina 💜',
      category: 'logro',
      reactions: { '👏': 5, '❤️': 3 },
    }
  ],
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

// Online family presence tracking
interface OnlineUser {
  userId: string;
  name: string;
  avatarEmoji: string;
  lastSeen: number;
}
const onlineUsers = new Map<string, OnlineUser>();

function getActiveOnlineUsers(): OnlineUser[] {
  const cutoff = Date.now() - 35000;
  for (const [id, user] of onlineUsers.entries()) {
    if (user.lastSeen < cutoff) {
      onlineUsers.delete(id);
    }
  }
  return Array.from(onlineUsers.values());
}

function updatePresence(user: { userId: string; name?: string; avatarEmoji?: string }) {
  if (!user || !user.userId) return;
  onlineUsers.set(user.userId, {
    userId: user.userId,
    name: user.name || user.userId,
    avatarEmoji: user.avatarEmoji || '🌸',
    lastSeen: Date.now(),
  });
  const active = getActiveOnlineUsers();
  broadcast({
    type: 'presence_update',
    onlineUsers: active,
  });
}

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
    onlineUsers: getActiveOnlineUsers(),
  }));

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }
      if (parsed.type === 'presence') {
        updatePresence(parsed);
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
    onlineUsers: getActiveOnlineUsers(),
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

// Fun Fact of the Day API (Gemini-powered with curated fallback)
app.get('/api/fun-fact', async (req, res) => {
  const requestedTopic = ((req.query.topic as string) || 'any').toLowerCase();
  const child = ((req.query.child as string) || 'both').toLowerCase();
  
  const chosenCategory: 'dogs' | 'science' = 
    requestedTopic === 'dogs' 
      ? 'dogs' 
      : requestedTopic === 'science' 
        ? 'science' 
        : Math.random() > 0.5 ? 'dogs' : 'science';

  const ai = getGeminiClient();

  if (ai) {
    try {
      const topicDescription = chosenCategory === 'dogs'
        ? 'perritos, cachorros, sentidos caninos o razas inteligentes como la French Poodle (como Luna, una perrita blanca con orejitas negras)'
        : 'la ciencia, el espacio exterior, animales asombrosos, inventos curiosos, el cuerpo humano o la naturaleza';

      const prompt = `Eres un asistente educativo y cariñoso para dos niñas mexicanas: Regina (10 años, hace gimnasia y le gusta aprender) y Romina (8 años, ama a su perrita Luna French Poodle y el piano).
Genera UN dato curioso súper fascinante, entretenido y motivador sobre ${topicDescription}.
Debe ser 100% verídico, fácil de entender para niñas de 8 a 10 años, alegre y positivo.
Responde ÚNICAMENTE un objeto JSON válido con este formato exacto, sin formato markdown adicional:
{
  "title": "Título llamativo y divertido con emojis",
  "fact": "El dato curioso explicado en 2 o 3 oraciones sencillas y fascinantes.",
  "category": "${chosenCategory}",
  "didYouKnow": "¿Sabías que...? frase corta y sorprendente",
  "encouragement": "Una frase corta y dulce de ánimo para Regina y Romina para completar sus tareas del día",
  "emoji": "Un emoji representativo (como 🐶, 🐩, 🚀, 🪐, 🔬, 🧬, 🐾, 🐬, 🌋)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.85,
        },
      });

      const responseText = response.text?.trim() || '';
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.fact && parsed.title) {
        res.json({
          success: true,
          title: parsed.title,
          fact: parsed.fact,
          category: parsed.category || chosenCategory,
          didYouKnow: parsed.didYouKnow || '¡La ciencia y la naturaleza son increíbles!',
          encouragement: parsed.encouragement || '¡A conquistar las tareas de hoy con una sonrisa!',
          emoji: parsed.emoji || (chosenCategory === 'dogs' ? '🐶' : '🔬'),
          source: 'gemini',
        });
        return;
      }
    } catch (err: any) {
      console.warn('[Gemini Fun Fact] Falling back to curated fact:', err?.message || err);
    }
  }

  // Fallback to curated high-quality facts
  const matchingFacts = CURATED_FACTS.filter((f) => 
    requestedTopic === 'any' ? true : f.category === chosenCategory
  );
  const pool = matchingFacts.length > 0 ? matchingFacts : CURATED_FACTS;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  res.json({
    success: true,
    ...picked,
    source: 'curated',
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

// Presence endpoint for active online members
app.post('/api/presence', (req, res) => {
  const { userId, name, avatarEmoji } = req.body;
  if (userId) {
    updatePresence({ userId, name, avatarEmoji });
  }
  res.json({ success: true, onlineUsers: getActiveOnlineUsers() });
});

app.get('/api/presence', (req, res) => {
  res.json({ onlineUsers: getActiveOnlineUsers() });
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

  // Merge family photos
  if (Array.isArray(payload.familyPhotos)) {
    const map = new Map<string, any>();
    [...(dbState.familyPhotos || []), ...payload.familyPhotos].forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        map.set(item.id, {
          ...existing,
          ...item,
          reactions: { ...(existing.reactions || {}), ...(item.reactions || {}) },
        });
      }
    });
    dbState.familyPhotos = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
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

// Dedicated Family Photos REST Endpoints
app.get('/api/photos', (req, res) => {
  res.json({
    photos: dbState.familyPhotos || [],
    lastUpdated: dbState.lastUpdated,
  });
});

app.post('/api/photos', (req, res) => {
  const photo = req.body;
  if (!photo || !photo.imageDataUrl) {
    res.status(400).json({ error: 'Se requiere imagen' });
    return;
  }

  const completePhoto = {
    ...photo,
    id: photo.id || `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: photo.date || new Date().toISOString().split('T')[0],
    timestamp: photo.timestamp || new Date().toISOString(),
    reactions: photo.reactions || {},
  };

  if (!dbState.familyPhotos) {
    dbState.familyPhotos = [];
  }

  const existingIdx = dbState.familyPhotos.findIndex((p) => p.id === completePhoto.id);
  if (existingIdx >= 0) {
    dbState.familyPhotos[existingIdx] = completePhoto;
  } else {
    dbState.familyPhotos.unshift(completePhoto);
  }

  dbState.lastUpdated = new Date().toISOString();
  saveDatabase();

  // Broadcast to all connected clients
  broadcast({
    type: 'photo_added',
    photo: completePhoto,
    totalCount: dbState.familyPhotos.length,
  });

  res.json({ success: true, photo: completePhoto });
});

app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  if (!dbState.familyPhotos) {
    dbState.familyPhotos = [];
  }
  const beforeCount = dbState.familyPhotos.length;
  dbState.familyPhotos = dbState.familyPhotos.filter((p) => p.id !== id);

  if (dbState.familyPhotos.length !== beforeCount) {
    dbState.lastUpdated = new Date().toISOString();
    saveDatabase();
    broadcast({ type: 'photo_deleted', id });
  }

  res.json({ success: true, id });
});

app.post('/api/photos/react', (req, res) => {
  const { photoId, emoji } = req.body;
  if (!photoId || !emoji || !dbState.familyPhotos) {
    res.status(400).json({ error: 'Parámetros incompletos' });
    return;
  }

  let targetPhoto: any;
  dbState.familyPhotos = dbState.familyPhotos.map((p) => {
    if (p.id === photoId) {
      const current = p.reactions?.[emoji] || 0;
      targetPhoto = {
        ...p,
        reactions: {
          ...(p.reactions || {}),
          [emoji]: current + 1,
        },
      };
      return targetPhoto;
    }
    return p;
  });

  if (targetPhoto) {
    dbState.lastUpdated = new Date().toISOString();
    saveDatabase();
    broadcast({ type: 'photo_updated', photo: targetPhoto });
  }

  res.json({ success: true, photo: targetPhoto });
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
