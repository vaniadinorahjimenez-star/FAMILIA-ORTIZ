import { 
  FamilyActivity, 
  FamilyNote, 
  BonusLogEntry, 
  WeekPayoutStatus, 
  RoutineTask, 
  TaskEvidence, 
  FineRecord, 
  FamilyChatMessage,
  ExtraPaymentConcept 
} from '../types';
import { INSPIRING_FAMILY_ACTIVITIES } from './scheduleGenerator';

const STORAGE_KEYS = {
  COMPLETIONS: 'rr_completions_v1',
  FAMILY_ACTIVITIES: 'rr_family_activities_v1',
  FAMILY_NOTES: 'rr_family_notes_v1',
  BONUS_LOGS: 'rr_bonus_logs_v1',
  CUSTOM_TASKS: 'rr_custom_tasks_v1',
  WEEKLY_PAYOUTS: 'rr_weekly_payouts_v1',
  TASK_EVIDENCES: 'rr_task_evidences_v1',
  FINES: 'rr_fines_v1',
  FAMILY_CHAT: 'rr_family_chat_v1',
  EXTRA_PAYMENTS: 'rr_extra_payments_v1',
};

// Initial default notes for the Gratitude & Thoughts Wall
const DEFAULT_NOTES: FamilyNote[] = [
  {
    id: 'note-1',
    from: 'Mamá',
    to: 'Todos',
    message: '¡Estoy muy orgullosa de lo responsables que son! Me llena de amor ver cómo cuidan a Luna y cómo practican piano y duolingo con tanta alegría.',
    category: 'orgullo',
    color: 'amber',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    reactions: { heart: 4, star: 3, dog: 2, clap: 2, laugh: 0 },
  },
  {
    id: 'note-2',
    from: 'Papá',
    to: 'Regina',
    message: 'Regi, me encantó ver tu esfuerzo y flexibilidad en gimnasia. ¡Sigue dando lo mejor de ti en cada salto!',
    category: 'animo',
    color: 'purple',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    reactions: { heart: 3, star: 5, dog: 1, clap: 3, laugh: 0 },
  },
  {
    id: 'note-3',
    from: 'Papá',
    to: 'Romina',
    message: 'Romi, la canción nueva que tocaste en el piano sonó hermosísima. ¡Se nota cuánto practicas todos los días!',
    category: 'agradecimiento',
    color: 'rose',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    reactions: { heart: 4, star: 4, dog: 2, clap: 4, laugh: 0 },
  },
  {
    id: 'note-4',
    from: 'Regina',
    to: 'Romina',
    message: 'Gracias hermanita por ayudarme hoy a peinar a Luna. Eres la mejor compañera de juegos.',
    category: 'agradecimiento',
    color: 'sky',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reactions: { heart: 5, star: 2, dog: 4, clap: 2, laugh: 1 },
  },
  {
    id: 'note-5',
    from: 'Romina',
    to: 'Familia',
    message: '¡Me encanta cuando llega el jueves de familia y cenamos juntos con juegos! Luna también se pone feliz 🐶❤️',
    category: 'divertido',
    color: 'emerald',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    reactions: { heart: 6, star: 4, dog: 5, clap: 3, laugh: 3 },
  }
];

// Initial preloaded family activities for upcoming Thursdays
const DEFAULT_ACTIVITIES: FamilyActivity[] = [
  {
    id: 'act-thu-1',
    title: INSPIRING_FAMILY_ACTIVITIES[0].title, // Dominó
    description: INSPIRING_FAMILY_ACTIVITIES[0].description,
    date: '2026-09-10', // Thursday
    time: '18:30',
    suggestedBy: 'Mamá',
    completed: false,
    notes: 'Jugar torneo de dominó por parejas en la mesa de la sala.',
  },
  {
    id: 'act-thu-2',
    title: INSPIRING_FAMILY_ACTIVITIES[1].title, // Rompecabezas
    description: INSPIRING_FAMILY_ACTIVITIES[1].description,
    date: '2026-09-17', // Thursday
    time: '18:30',
    suggestedBy: 'Regina & Romina',
    completed: false,
    notes: 'Avanzar el rompecabezas de 500 piezas entre todos.',
  },
  {
    id: 'act-thu-3',
    title: INSPIRING_FAMILY_ACTIVITIES[2].title, // Preparar la cena juntos
    description: INSPIRING_FAMILY_ACTIVITIES[2].description,
    date: '2026-09-24', // Thursday
    time: '19:00',
    suggestedBy: 'Papá',
    completed: false,
    notes: 'Poner música alegre y cocinar juntos en equipo.',
  }
];

export function getStoredCompletions(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredCompletions(data: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(data));
  } catch {
    // safely ignore
  }
}

export function getStoredFamilyActivities(): FamilyActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILY_ACTIVITIES);
    return raw ? JSON.parse(raw) : DEFAULT_ACTIVITIES;
  } catch {
    return DEFAULT_ACTIVITIES;
  }
}

export function saveStoredFamilyActivities(activities: FamilyActivity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAMILY_ACTIVITIES, JSON.stringify(activities));
  } catch {
    // safely ignore
  }
}

export function getStoredFamilyNotes(): FamilyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILY_NOTES);
    return raw ? JSON.parse(raw) : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

export function saveStoredFamilyNotes(notes: FamilyNote[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAMILY_NOTES, JSON.stringify(notes));
  } catch {
    // safely ignore
  }
}

export function getStoredBonusLogs(): BonusLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BONUS_LOGS);
    if (!raw) {
      // Seed a couple of initial claimed bonuses for realism
      const seed: BonusLogEntry[] = [
        {
          id: 'seed-b-1',
          bonusId: 'bonus-read-book',
          childId: 'regina',
          date: '2026-09-08',
          title: 'Leer 30 minutos un libro o cuento',
          points: 15,
          pesosReward: 8,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'seed-b-2',
          bonusId: 'bonus-make-bed',
          childId: 'romina',
          date: '2026-09-08',
          title: 'Tender la cama con almohadas alineadas',
          points: 10,
          pesosReward: 5,
          timestamp: new Date().toISOString(),
        }
      ];
      localStorage.setItem(STORAGE_KEYS.BONUS_LOGS, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredBonusLogs(logs: BonusLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BONUS_LOGS, JSON.stringify(logs));
  } catch {
    // safely ignore
  }
}

export function getStoredCustomTasks(): RoutineTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCustomTasks(tasks: RoutineTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TASKS, JSON.stringify(tasks));
  } catch {
    // safely ignore
  }
}

export function getStoredWeeklyPayouts(): Record<string, WeekPayoutStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PAYOUTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredWeeklyPayouts(payouts: Record<string, WeekPayoutStatus>) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PAYOUTS, JSON.stringify(payouts));
  } catch {
    // safely ignore
  }
}

// ==========================================
// EVIDENCIAS FOTOGRÁFICAS DE ACTIVIDADES
// ==========================================

export function getStoredTaskEvidences(): TaskEvidence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASK_EVIDENCES);
    if (!raw) {
      const initialEvidences: TaskEvidence[] = [
        {
          id: 'ev-1',
          taskId: 'task-romina-luna-walk',
          taskTitle: 'Paseo matutino con Luna 🐶',
          childId: 'romina',
          date: '2026-09-08',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          imageDataUrl: '',
          caption: 'Luna estuvo súper contenta oliendo el pasto en el parque 🌿',
        },
        {
          id: 'ev-2',
          taskId: 'task-regina-duolingo-study',
          taskTitle: 'Lección de Duolingo 🦉',
          childId: 'regina',
          date: '2026-09-08',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
          imageDataUrl: '',
          caption: '¡Completé mi racha perfecta de lecciones de hoy! 🌟',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.TASK_EVIDENCES, JSON.stringify(initialEvidences));
      return initialEvidences;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTaskEvidences(evidences: TaskEvidence[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASK_EVIDENCES, JSON.stringify(evidences));
  } catch {
    // safely ignore
  }
}

// ==========================================
// MULTAS (POLICÍA NAN)
// ==========================================

export function getStoredFines(): FineRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINES);
    if (!raw) {
      const initialFines: FineRecord[] = [
        {
          id: 'fine-seed-1',
          childId: 'regina',
          reason: 'Ropa tirada en el suelo del cuarto',
          amount: 5,
          officer: 'Nan - Policía de las Multas 👮‍♀️',
          date: '2026-09-08',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          status: 'activa',
          notes: 'Se dejó la sudadera y calcetines en la alfombra al llegar de la escuela.',
        }
      ];
      localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(initialFines));
      return initialFines;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredFines(fines: FineRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
  } catch {
    // safely ignore
  }
}

// ==========================================
// AVISOS A MAMÁ (CHAT FAMILIAR)
// ==========================================

export function getStoredFamilyChat(): FamilyChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILY_CHAT);
    if (!raw) {
      const initialChat: FamilyChatMessage[] = [
        {
          id: 'chat-1',
          sender: 'Nan',
          senderRole: 'policia_nan',
          text: '🚨 ¡Atención Regina y Romina! Soy la oficial Nan 👮‍♀️. Si no sacan a pasear a Luna a su hora o dejan ropa tirada, habrá multa de $5 pesos descontados de su domingo.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          reactions: { '👮‍♀️': 3, '👀': 2 },
        },
        {
          id: 'chat-2',
          sender: 'Romina',
          senderRole: 'romina',
          text: '¡Mamá! Ya saqué a Luna a pasear al parque, hizo pipí y popó y ya tiene su correa guardada 🐶🌸',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          isNoticeToMama: true,
          reactions: { '❤️': 2, '👏': 2 },
        },
        {
          id: 'chat-3',
          sender: 'Mamá',
          senderRole: 'mama',
          text: '¡Excelente Romi, muchas gracias por avisarme mi amor! Te quiero mucho 💖',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          reactions: { '❤️': 3 },
        },
        {
          id: 'chat-4',
          sender: 'Regina',
          senderRole: 'regina',
          text: '¡Aviso a Mamá! Ya terminé mi duolingo y ya tengo mi leotardo listo para gimnasia 💜🤸‍♀️',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          isNoticeToMama: true,
          reactions: { '🌟': 3 },
        },
        {
          id: 'chat-5',
          sender: 'Papá',
          senderRole: 'papa',
          text: '¡Qué buen equipo hacen todas! Nos vemos al rato para cenar juntos en familia 👨‍👩‍👧‍👧',
          timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          reactions: { '❤️': 4 },
        },
      ];
      localStorage.setItem(STORAGE_KEYS.FAMILY_CHAT, JSON.stringify(initialChat));
      return initialChat;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredFamilyChat(messages: FamilyChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAMILY_CHAT, JSON.stringify(messages));
  } catch {
    // safely ignore
  }
}

// ==========================================
// OTROS CONCEPTOS DE PAGO MANUALES
// ==========================================

export function getStoredExtraPayments(): ExtraPaymentConcept[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXTRA_PAYMENTS);
    if (!raw) {
      const initialExtraPayments: ExtraPaymentConcept[] = [
        {
          id: 'pay-extra-seed-1',
          concept: 'Lavar y aspirar el coche con papá',
          amount: 35,
          childId: 'regina',
          date: '2026-09-08',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          category: 'auto',
          registeredBy: 'Papá',
          status: 'pagado',
          notes: 'Ayudó con la manguera y a secar los cristales con toalla.',
        },
        {
          id: 'pay-extra-seed-2',
          concept: 'Ayudar a desempacar y acomodar la despensa del súper',
          amount: 25,
          childId: 'romina',
          date: '2026-09-09',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
          category: 'mandado',
          registeredBy: 'Mamá',
          status: 'pendiente',
          notes: 'Acomodó las frutas y cajas en la alacena.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.EXTRA_PAYMENTS, JSON.stringify(initialExtraPayments));
      return initialExtraPayments;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredExtraPayments(payments: ExtraPaymentConcept[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXTRA_PAYMENTS, JSON.stringify(payments));
  } catch {
    // safely ignore
  }
}

