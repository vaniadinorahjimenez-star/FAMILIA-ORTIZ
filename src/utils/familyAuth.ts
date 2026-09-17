import { FamilyUserId } from '../types';

// Contraseñas privadas de acceso por usuario (definidas por la administradora familiar)
const FAMILY_PASSWORDS: Record<string, string> = {
  regina: 'reginamamateama21',
  romina: 'rominamamateama21',
  papa: 'guapoleon21',
  mama: 'mamaleona21',
  nan: 'nancyleona21',
  nana: 'nancyleona21',
};

const STORAGE_AUTH_PREFIX = 'rr_auth_session_user_';
const STORAGE_CURRENT_AUTH = 'rr_current_authenticated_user_v1';

/**
 * Valida si la contraseña introducida coincide con la del usuario seleccionado.
 * La validación es exacta y sin espacios laterales.
 */
export function verifyFamilyUserPassword(userId: FamilyUserId, enteredPass: string): boolean {
  if (!userId || !enteredPass) return false;
  const cleanPass = enteredPass.trim();
  const targetPass = FAMILY_PASSWORDS[userId.toLowerCase()];
  if (!targetPass) return false;
  return cleanPass === targetPass;
}

/**
 * Verifica si el usuario actual ya se autenticó en la sesión activa del navegador.
 */
export function isUserSessionAuthenticated(userId: FamilyUserId): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const isAuthed = sessionStorage.getItem(STORAGE_AUTH_PREFIX + userId);
    const current = sessionStorage.getItem(STORAGE_CURRENT_AUTH);
    return isAuthed === 'true' && current === userId;
  } catch {
    return false;
  }
}

/**
 * Registra la sesión como autenticada tras validar la contraseña correctamente.
 */
export function setUserSessionAuthenticated(userId: FamilyUserId): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_AUTH_PREFIX + userId, 'true');
      sessionStorage.setItem(STORAGE_CURRENT_AUTH, userId);
    }
  } catch {
    // ignore
  }
}

/**
 * Cierra la sesión activa autenticada.
 */
export function clearUserSessionAuth(userId?: FamilyUserId): void {
  try {
    if (typeof window !== 'undefined') {
      if (userId) {
        sessionStorage.removeItem(STORAGE_AUTH_PREFIX + userId);
      } else {
        sessionStorage.removeItem(STORAGE_CURRENT_AUTH);
        ['mama', 'papa', 'nan', 'regina', 'romina'].forEach((u) => {
          sessionStorage.removeItem(STORAGE_AUTH_PREFIX + u);
        });
      }
    }
  } catch {
    // ignore
  }
}
