import { FamilyUserId, FamilyUserProfile } from '../types';

export const FAMILY_USERS: FamilyUserProfile[] = [
  {
    id: 'mama',
    name: 'Mamá',
    role: 'mama',
    avatarEmoji: '👩',
    badge: 'Mamá Jefa del Hogar 🌸',
    color: 'pink',
    themeBg: 'bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100',
  },
  {
    id: 'papa',
    name: 'Papá',
    role: 'papa',
    avatarEmoji: '👨',
    badge: 'Papá Compañero 👔',
    color: 'blue',
    themeBg: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
  },
  {
    id: 'nan',
    name: 'Nan',
    role: 'policia_nan',
    avatarEmoji: '👮‍♀️',
    badge: 'Nan - Policía de Multas 🚨',
    color: 'amber',
    themeBg: 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100',
  },
  {
    id: 'regina',
    name: 'Regina',
    role: 'regina',
    avatarEmoji: '💜',
    badge: 'Regina (10 años) 🤸‍♀️',
    color: 'purple',
    themeBg: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
  },
  {
    id: 'romina',
    name: 'Romina',
    role: 'romina',
    avatarEmoji: '🌸',
    badge: 'Romina (8 años) 🎹',
    color: 'rose',
    themeBg: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100',
  },
];

const STORAGE_ACTIVE_USER = 'rr_active_family_user_v1';

export function getStoredActiveUser(): FamilyUserId {
  try {
    const saved = localStorage.getItem(STORAGE_ACTIVE_USER) as FamilyUserId;
    if (saved === 'nana') return 'nan';
    if (saved && FAMILY_USERS.some((u) => u.id === saved)) {
      return saved;
    }
    return 'mama'; // Default to Mamá
  } catch {
    return 'mama';
  }
}

export function saveStoredActiveUser(userId: FamilyUserId) {
  try {
    localStorage.setItem(STORAGE_ACTIVE_USER, userId);
  } catch {
    // ignore
  }
}
