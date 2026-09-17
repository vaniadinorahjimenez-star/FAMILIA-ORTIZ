/**
 * Utilidad para el recordatorio diario de Mamá:
 * 1 notificación al día recordando que Mamá las ama y necesitan hacer sus tareas.
 * Nota: Los sábados y domingos no hay tareas de la escuela.
 */

export interface MamaDailyMessage {
  dateKey: string;
  isWeekend: boolean;
  title: string;
  subtitle: string;
  body: string;
  checklistHighlights: string[];
}

const STORAGE_KEY = 'mama_daily_love_notification_date';

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMamaDailyMessage(date: Date = new Date()): MamaDailyMessage {
  const day = date.getDay(); // 0 = Domingo, 6 = Sábado
  const isWeekend = day === 0 || day === 6;
  const dateKey = getTodayKey();

  if (isWeekend) {
    return {
      dateKey,
      isWeekend: true,
      title: '¡Mamá las ama con todo su corazón! 💕✨',
      subtitle: '¡Feliz fin de semana en familia!',
      body: 'Mis niñas hermosas Regina y Romina: Recuerden siempre lo mucho que las amo y lo orgullosa que estoy de ustedes. Los sábados y domingos NO hay tareas de la escuela 🏖️, pero recuerden hacer sus misiones de casa: asear su cuarto, cepillarse muy bien sus dientes y consentir mucho a nuestra perrita Luna 🐶💕 ¡A disfrutar el día!',
      checklistHighlights: [
        '🎉 ¡Sin tareas de la escuela hoy fin de semana!',
        '🪥 Cepillado de dientes matutino y nocturno',
        '🐶 Paseos y apapachos para Luna',
        '🧹 Mantener su cuarto y camas ordenadas',
        '💖 Recordar que Mamá las ama infinito',
      ],
    };
  }

  return {
    dateKey,
    isWeekend: false,
    title: '¡Mamá las ama con todo el corazón! 💕👩‍👧‍👧',
    subtitle: 'Recordatorio diario de cariño y responsabilidad',
    body: 'Mis amores Regina y Romina: Recuerden que Mamá las ama con toda su alma 💕. Hoy es un día para brillar: hagan sus tareas de la escuela con muchas ganas y concentración 📚✏️, practiquen sus lecciones y cumplan con sus misiones y con Luna. ¡Ustedes pueden lograr todo lo que se propongan!',
    checklistHighlights: [
      '📚 Concentración total para hacer sus tareas escolares',
      '🪥 Sonrisas limpias con cepillado de dientes',
      '🐶 Cuidar, alimentar y pasear a Luna con amor',
      '🤸‍♀️ Preparar mochilas de escuela y gimnasia',
      '💖 ¡Mamá siempre las lleva en su corazón!',
    ],
  };
}

/**
 * Verifica si hoy ya se envió o mostró la notificación diaria
 */
export function hasSeenMamaDailyReminderToday(): boolean {
  try {
    const lastDate = localStorage.getItem(STORAGE_KEY);
    return lastDate === getTodayKey();
  } catch {
    return false;
  }
}

/**
 * Marca como vista la notificación de hoy
 */
export function markMamaDailyReminderAsSeenToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getTodayKey());
  } catch {
    // ignore
  }
}

/**
 * Solicita permiso de notificaciones del navegador si están soportadas
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Envía la notificación nativa al dispositivo/sistema operativo
 */
export function sendMamaBrowserNotification(force = false): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const todayKey = getTodayKey();
  if (!force && hasSeenMamaDailyReminderToday()) {
    return false;
  }

  try {
    const msg = getMamaDailyMessage();
    const options: any = {
      body: msg.isWeekend
        ? '¡Mamá las ama mucho! 💕 Hoy no hay tareas de la escuela, pero recuerden sus misiones familiares y a Luna 🐶.'
        : '¡Mamá las ama con todo su corazón! 💕 Recuerden hacer sus tareas de la escuela y cumplir sus misiones de hoy ✨.',
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-192.png',
      tag: `mama-daily-reminder-${todayKey}`,
      renotify: force,
    };
    const notification = new Notification(msg.title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Error al disparar notificación nativa:', err);
    return false;
  }
}
