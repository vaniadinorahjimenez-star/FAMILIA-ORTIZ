export type ChildId = 'regina' | 'romina';

export type TaskCategory = 
  | 'luna' 
  | 'gym' 
  | 'music_lang' 
  | 'hygiene' 
  | 'cleaning' 
  | 'family' 
  | 'custom'
  | 'bonus';

export interface RoutineTask {
  id: string;
  title: string;
  description: string;
  timeSlot: string; // e.g., "07:00 - 08:00", "15:00 - 16:00", "17:00", "20:30"
  timeCategory: 'morning' | 'afternoon' | 'evening';
  assignedTo: ChildId | 'both';
  category: TaskCategory;
  points: number;
  iconName: string;
  isEveryTwoDays?: boolean;
  requiredDays?: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  custom?: boolean;
}

export interface DayTaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: ChildId;
}

export interface FamilyActivity {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD (typically Thursdays)
  time?: string;
  suggestedBy?: string;
  completed: boolean;
  notes?: string;
}

export interface FamilyNote {
  id: string;
  from: string; // 'Mamá' | 'Papá' | 'Regina' | 'Romina' | 'Familia'
  to: string;   // 'Regina' | 'Romina' | 'Mamá' | 'Papá' | 'Todos'
  message: string;
  category: 'agradecimiento' | 'animo' | 'divertido' | 'orgullo';
  color: 'amber' | 'rose' | 'purple' | 'emerald' | 'sky';
  createdAt: string;
  reactions: {
    heart: number;
    star: number;
    dog: number;
    clap: number;
    laugh: number;
  };
}

export interface ScreenFreeBonus {
  id: string;
  title: string;
  description: string;
  points: number;
  pesosReward: number;
  iconName: string;
  category: string;
}

export interface BonusLogEntry {
  id: string;
  bonusId: string;
  childId: ChildId;
  date: string; // YYYY-MM-DD
  title: string;
  points: number;
  pesosReward: number;
  timestamp: string;
}

export interface WeekPayoutStatus {
  weekKey: string; // e.g. "2026-W37"
  paid: boolean;
  paidAt?: string;
}

export interface TaskEvidence {
  id: string;
  taskId?: string;
  taskTitle: string;
  childId: ChildId;
  date: string; // YYYY-MM-DD
  timestamp: string;
  imageDataUrl: string;
  caption?: string;
}

export interface FineRecord {
  id: string;
  childId: ChildId;
  reason: string; // e.g. "Ropa tirada en el piso", "No sacó a Luna a pasear", etc.
  amount: number; // typically 5 pesos MXN
  officer: string; // "Nan - Policía de las Multas 👮‍♀️"
  date: string; // YYYY-MM-DD
  timestamp: string;
  imageDataUrl?: string; // photo evidence taken by Nan
  status: 'activa' | 'perdonada' | 'descontada';
  notes?: string;
}

export type FamilyUserId = 'mama' | 'papa' | 'nan' | 'regina' | 'romina' | 'nana';

export interface FamilyUserProfile {
  id: FamilyUserId;
  name: string;
  role: 'mama' | 'papa' | 'regina' | 'romina' | 'policia_nan';
  avatarEmoji: string;
  badge: string;
  color: string;
  themeBg: string;
}

export interface FamilyChatMessage {
  id: string;
  sender: 'Mamá' | 'Papá' | 'Regina' | 'Romina' | 'Nan';
  senderRole: 'mama' | 'papa' | 'regina' | 'romina' | 'policia_nan';
  text: string;
  timestamp: string;
  isNoticeToMama?: boolean;
  imageDataUrl?: string;
  reactions?: Record<string, number>;
  replyTo?: {
    id: string;
    sender: string;
    text: string;
  };
  reviewedByMama?: boolean;
  mamaComment?: string;
  mamaApprovedAt?: string;
}

export interface ExtraPaymentConcept {
  id: string;
  concept: string; // e.g. "Lavar el coche con papá", "Ayudar a guardar la despensa"
  amount: number; // in MXN pesos
  childId: ChildId | 'both';
  date: string; // YYYY-MM-DD
  timestamp: string;
  category?: string;
  registeredBy: string; // e.g. 'Mamá', 'Papá', 'Nan'
  status: 'pendiente' | 'pagado';
  notes?: string;
}

export interface FamilyPhoto {
  id: string;
  title: string;
  description: string; // descripción de ese día
  date: string; // YYYY-MM-DD
  timestamp: string;
  imageDataUrl: string;
  uploadedBy: FamilyUserId;
  uploadedByName: string;
  category?: 'familia' | 'paseo_luna' | 'viaje' | 'logro' | 'recuerdo';
  reactions?: Record<string, number>;
}

export interface CloudSyncPayload {
  completions: Record<string, boolean>;
  familyActivities: FamilyActivity[];
  familyNotes: FamilyNote[];
  bonusLogs: BonusLogEntry[];
  customTasks: RoutineTask[];
  weeklyPayouts: Record<string, WeekPayoutStatus>;
  taskEvidences: TaskEvidence[];
  fines: FineRecord[];
  familyChat: FamilyChatMessage[];
  extraPayments?: ExtraPaymentConcept[];
  familyPhotos?: FamilyPhoto[];
  lastUpdated: string;
  updatedBy?: string;
}
