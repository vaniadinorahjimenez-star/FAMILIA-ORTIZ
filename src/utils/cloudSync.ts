import { 
  CloudSyncPayload, 
  RoutineTask, 
  FamilyActivity, 
  FamilyNote, 
  BonusLogEntry, 
  WeekPayoutStatus, 
  TaskEvidence, 
  FineRecord, 
  FamilyChatMessage,
  ExtraPaymentConcept 
} from '../types';

const SYNC_KEYS = {
  ROOM_ID: 'rr_family_sync_room_id_v1',
  REMOTE_OBJECT_ID: 'rr_family_remote_object_id_v1',
  LAST_SYNC_TIME: 'rr_family_last_sync_time_v1',
  AUTO_SYNC_ENABLED: 'rr_family_auto_sync_enabled_v1',
};

// Default public relay object pre-created for Familia Jimenez (Regina & Romina)
export const DEFAULT_FAMILY_ROOM = 'FAMILIA-JIMENEZ-REGINA-ROMINA';
export const DEFAULT_REMOTE_OBJECT_ID = 'ff808181a067127101a08e793e796faa';
const API_BASE = 'https://api.restful-api.dev/objects';

export function getStoredRoomId(): string {
  try {
    // Check URL hash first: e.g. #room=XYZ or ?room=XYZ
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const hashMatch = hash.match(/room=([a-zA-Z0-9_-]+)/);
      if (hashMatch && hashMatch[1]) {
        localStorage.setItem(SYNC_KEYS.ROOM_ID, hashMatch[1]);
        return hashMatch[1];
      }
      const params = new URLSearchParams(window.location.search);
      const queryRoom = params.get('room');
      if (queryRoom) {
        localStorage.setItem(SYNC_KEYS.ROOM_ID, queryRoom);
        return queryRoom;
      }
    }
    const saved = localStorage.getItem(SYNC_KEYS.ROOM_ID);
    return saved || DEFAULT_FAMILY_ROOM;
  } catch {
    return DEFAULT_FAMILY_ROOM;
  }
}

export function saveStoredRoomId(roomId: string) {
  try {
    localStorage.setItem(SYNC_KEYS.ROOM_ID, roomId.trim());
  } catch {
    // ignore
  }
}

export function getStoredRemoteObjectId(): string {
  try {
    const saved = localStorage.getItem(SYNC_KEYS.REMOTE_OBJECT_ID);
    return saved || DEFAULT_REMOTE_OBJECT_ID;
  } catch {
    return DEFAULT_REMOTE_OBJECT_ID;
  }
}

export function saveStoredRemoteObjectId(id: string) {
  try {
    localStorage.setItem(SYNC_KEYS.REMOTE_OBJECT_ID, id);
  } catch {
    // ignore
  }
}

/**
 * Fetch current state from the cloud room
 */
export async function fetchCloudState(remoteId = getStoredRemoteObjectId()): Promise<CloudSyncPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/${remoteId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Error en servidor de sincronización (${res.status})`);
    }

    const json = await res.json();
    if (json && json.data && json.data.lastUpdated) {
      return json.data as CloudSyncPayload;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching cloud state:', err);
    return null;
  }
}

/**
 * Push current state to the cloud room
 */
export async function pushCloudState(
  payload: CloudSyncPayload,
  remoteId = getStoredRemoteObjectId(),
  roomName = getStoredRoomId()
): Promise<string> {
  try {
    // If we have an existing remote object ID, try PUT
    if (remoteId) {
      const putRes = await fetch(`${API_BASE}/${remoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Room_${roomName}`,
          data: payload,
        }),
      });

      if (putRes.ok) {
        const json = await putRes.json();
        return json.id || remoteId;
      }
    }

    // Otherwise, create a new cloud object
    const postRes = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Room_${roomName}`,
        data: payload,
      }),
    });

    if (!postRes.ok) {
      throw new Error(`No se pudo sincronizar en la nube (${postRes.status})`);
    }

    const created = await postRes.json();
    if (created && created.id) {
      saveStoredRemoteObjectId(created.id);
      return created.id;
    }
    return remoteId;
  } catch (err) {
    console.error('Error pushing cloud state:', err);
    throw err;
  }
}

/**
 * Merges local and remote data cleanly without losing records
 */
export function mergeCloudData(
  local: CloudSyncPayload,
  remote: CloudSyncPayload
): CloudSyncPayload {
  // 1. Completions: union
  const mergedCompletions = { ...local.completions, ...remote.completions };

  // 2. Chat messages: merge by id
  const chatMap = new Map<string, FamilyChatMessage>();
  [...(local.familyChat || []), ...(remote.familyChat || [])].forEach((msg) => {
    const existing = chatMap.get(msg.id);
    if (!existing) {
      chatMap.set(msg.id, msg);
    } else {
      // Merge reactions and mama approval
      const mergedReactions: Record<string, number> = { ...(existing.reactions || {}) };
      if (msg.reactions) {
        Object.entries(msg.reactions).forEach(([k, v]) => {
          mergedReactions[k] = Math.max(mergedReactions[k] || 0, v);
        });
      }
      chatMap.set(msg.id, {
        ...existing,
        ...msg,
        reactions: mergedReactions,
        reviewedByMama: existing.reviewedByMama || msg.reviewedByMama,
        mamaComment: msg.mamaComment || existing.mamaComment,
        mamaApprovedAt: msg.mamaApprovedAt || existing.mamaApprovedAt,
      });
    }
  });
  const mergedChat = Array.from(chatMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 3. Fines: merge by id
  const finesMap = new Map<string, FineRecord>();
  [...(local.fines || []), ...(remote.fines || [])].forEach((fine) => {
    const existing = finesMap.get(fine.id);
    if (!existing) {
      finesMap.set(fine.id, fine);
    } else {
      // If either pardoned, it is pardoned
      const status = fine.status === 'perdonada' || existing.status === 'perdonada' 
        ? 'perdonada' 
        : fine.status;
      finesMap.set(fine.id, {
        ...existing,
        ...fine,
        status,
      });
    }
  });
  const mergedFines = Array.from(finesMap.values());

  // 4. Task evidences: merge by id
  const evMap = new Map<string, TaskEvidence>();
  [...(local.taskEvidences || []), ...(remote.taskEvidences || [])].forEach((ev) => {
    if (!evMap.has(ev.id)) {
      evMap.set(ev.id, ev);
    }
  });
  const mergedEvidences = Array.from(evMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // 5. Family notes: merge by id with max reactions
  const notesMap = new Map<string, FamilyNote>();
  [...(local.familyNotes || []), ...(remote.familyNotes || [])].forEach((note) => {
    const existing = notesMap.get(note.id);
    if (!existing) {
      notesMap.set(note.id, note);
    } else {
      notesMap.set(note.id, {
        ...existing,
        ...note,
        reactions: {
          heart: Math.max(existing.reactions?.heart || 0, note.reactions?.heart || 0),
          star: Math.max(existing.reactions?.star || 0, note.reactions?.star || 0),
          dog: Math.max(existing.reactions?.dog || 0, note.reactions?.dog || 0),
          clap: Math.max(existing.reactions?.clap || 0, note.reactions?.clap || 0),
          laugh: Math.max(existing.reactions?.laugh || 0, note.reactions?.laugh || 0),
        },
      });
    }
  });
  const mergedNotes = Array.from(notesMap.values());

  // 6. Bonus logs: merge by id
  const bonusMap = new Map<string, BonusLogEntry>();
  [...(local.bonusLogs || []), ...(remote.bonusLogs || [])].forEach((b) => {
    if (!bonusMap.has(b.id)) {
      bonusMap.set(b.id, b);
    }
  });
  const mergedBonusLogs = Array.from(bonusMap.values());

  // 7. Custom tasks
  const customTaskMap = new Map<string, RoutineTask>();
  [...(local.customTasks || []), ...(remote.customTasks || [])].forEach((t) => {
    if (!customTaskMap.has(t.id)) {
      customTaskMap.set(t.id, t);
    }
  });
  const mergedCustomTasks = Array.from(customTaskMap.values());

  // 8. Weekly payouts
  const mergedPayouts = { ...local.weeklyPayouts, ...remote.weeklyPayouts };

  // 9. Family activities
  const actMap = new Map<string, FamilyActivity>();
  [...(local.familyActivities || []), ...(remote.familyActivities || [])].forEach((a) => {
    actMap.set(a.id, a);
  });
  const mergedActivities = Array.from(actMap.values());

  // 10. Extra manual payment concepts
  const extraPaymentsMap = new Map<string, ExtraPaymentConcept>();
  [...(local.extraPayments || []), ...(remote.extraPayments || [])].forEach((p) => {
    const existing = extraPaymentsMap.get(p.id);
    if (!existing) {
      extraPaymentsMap.set(p.id, p);
    } else {
      // If either marked as paid, it is paid
      const status = p.status === 'pagado' || existing.status === 'pagado' ? 'pagado' : p.status;
      extraPaymentsMap.set(p.id, {
        ...existing,
        ...p,
        status,
      });
    }
  });
  const mergedExtraPayments = Array.from(extraPaymentsMap.values()).sort(
    (a, b) => new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
  );

  return {
    completions: mergedCompletions,
    familyActivities: mergedActivities,
    familyNotes: mergedNotes,
    bonusLogs: mergedBonusLogs,
    customTasks: mergedCustomTasks,
    weeklyPayouts: mergedPayouts,
    taskEvidences: mergedEvidences,
    fines: mergedFines,
    familyChat: mergedChat,
    extraPayments: mergedExtraPayments,
    lastUpdated: new Date().toISOString(),
    updatedBy: local.updatedBy || remote.updatedBy,
  };
}

/**
 * Generate a shareable link that encodes room ID for family devices / browsers
 */
export function generateShareableRoomLink(roomId = getStoredRoomId()): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.hash = `room=${encodeURIComponent(roomId)}`;
  return url.toString();
}
