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
const STORAGE_USER_CHOSEN_FLAG = 'rr_has_chosen_device_profile_v1';

export function hasUserExplicitlyChosenProfile(): boolean {
  try {
    return localStorage.getItem(STORAGE_USER_CHOSEN_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function getStoredActiveUser(): FamilyUserId {
  try {
    if (typeof window !== 'undefined') {
      // 1. Check URL search params: ?user=romina
      const params = new URLSearchParams(window.location.search);
      const queryUser = params.get('user')?.toLowerCase() as FamilyUserId;
      if (queryUser && FAMILY_USERS.some((u) => u.id === queryUser || (queryUser as string) === 'nana')) {
        const normalized = queryUser === 'nana' ? 'nan' : queryUser;
        localStorage.setItem(STORAGE_ACTIVE_USER, normalized);
        localStorage.setItem(STORAGE_USER_CHOSEN_FLAG, 'true');
        return normalized;
      }

      // 2. Check URL hash: #user=regina
      const hash = window.location.hash;
      const hashMatch = hash.match(/user=([a-zA-Z0-9_-]+)/i);
      if (hashMatch && hashMatch[1]) {
        const hUser = hashMatch[1].toLowerCase() as FamilyUserId;
        if (FAMILY_USERS.some((u) => u.id === hUser || (hUser as string) === 'nana')) {
          const normalized = hUser === 'nana' ? 'nan' : hUser;
          localStorage.setItem(STORAGE_ACTIVE_USER, normalized);
          localStorage.setItem(STORAGE_USER_CHOSEN_FLAG, 'true');
          return normalized;
        }
      }
    }

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
    localStorage.setItem(STORAGE_USER_CHOSEN_FLAG, 'true');
  } catch {
    // ignore
  }
}

/**
 * Generate a direct link for a specific family member (e.g. ?user=romina)
 */
export function generateUserDirectLink(userId: FamilyUserId): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('user', userId);
  return url.toString();
}
