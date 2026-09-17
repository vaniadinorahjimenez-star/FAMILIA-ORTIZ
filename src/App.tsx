/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ChildId, 
  RoutineTask, 
  FamilyActivity, 
  FamilyNote, 
  ScreenFreeBonus, 
  BonusLogEntry,
  TaskEvidence,
  FineRecord,
  FamilyChatMessage,
  FamilyUserId,
  CloudSyncPayload,
  ExtraPaymentConcept,
  FamilyPhoto
} from './types';
import { 
  generateDailySchedule, 
  isLunaDutyDay, 
  formatDateKey, 
  getWeekKey 
} from './utils/scheduleGenerator';
import { 
  getStoredCompletions, 
  saveStoredCompletions,
  getStoredFamilyActivities,
  saveStoredFamilyActivities,
  getStoredFamilyNotes,
  saveStoredFamilyNotes,
  getStoredBonusLogs,
  saveStoredBonusLogs,
  getStoredCustomTasks,
  saveStoredCustomTasks,
  getStoredWeeklyPayouts,
  saveStoredWeeklyPayouts,
  getStoredTaskEvidences,
  saveStoredTaskEvidences,
  getStoredFines,
  saveStoredFines,
  getStoredFamilyChat,
  saveStoredFamilyChat,
  getStoredExtraPayments,
  saveStoredExtraPayments,
  getStoredFamilyPhotos,
  saveStoredFamilyPhotos
} from './utils/storage';
import { idbGetAll, MEDIA_STORES } from './utils/indexedDBStorage';
import { soundFX } from './utils/audio';
import { 
  getStoredActiveUser, 
  saveStoredActiveUser, 
  hasUserExplicitlyChosenProfile, 
  FAMILY_USERS 
} from './utils/familyUsers';
import { 
  fetchCloudState, 
  pushCloudState, 
  mergeCloudData, 
  getStoredRoomId,
  subscribeToFamilySync
} from './utils/cloudSync';
import { realtimeChat, OnlineUser } from './utils/realtimeChat';
import { 
  subscribeToFirebaseChat, 
  sendFirebaseMessage, 
  deleteFirebaseMessage, 
  updateFirebaseReaction, 
  approveFirebaseNotice 
} from './utils/firebaseChat';

import { Header, ActiveTab } from './components/Header';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { RewardsPanel } from './components/RewardsPanel';
import { BonusCatalog } from './components/BonusCatalog';
import { FamilyNotesBoard } from './components/FamilyNotesBoard';
import { AddCustomTaskModal } from './components/AddCustomTaskModal';
import { FamilyActivitiesModal } from './components/FamilyActivitiesModal';
import { CelebrationModal } from './components/CelebrationModal';
import { TaskCheckCelebrationModal } from './components/TaskCheckCelebrationModal';
import { RouletteModal } from './components/RouletteModal';
import { UploadEvidenceModal } from './components/UploadEvidenceModal';
import { TaskEvidencesView } from './components/TaskEvidencesView';
import { FamilyPhotoAlbumView } from './components/FamilyPhotoAlbumView';
import { FinesPolicePanel } from './components/FinesPolicePanel';
import { FamilyChatView } from './components/FamilyChatView';
import { FamilySyncModal } from './components/FamilySyncModal';
import { FamilyDeviceConnectModal } from './components/FamilyDeviceConnectModal';
import { DeviceProfileModal } from './components/DeviceProfileModal';
import { MamaDailyLoveModal } from './components/MamaDailyLoveModal';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { 
  isUserSessionAuthenticated, 
  clearUserSessionAuth 
} from './utils/familyAuth';
import { 
  hasSeenMamaDailyReminderToday, 
  sendMamaBrowserNotification 
} from './utils/dailyReminder';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [selectedChild, setSelectedChild] = useState<ChildId | 'both'>('both');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Device View State: 'mobile' (para celulares) vs 'tablet' (para iPad/computadora)
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_device_view');
      if (saved === 'mobile' || saved === 'tablet') return saved;
      return window.innerWidth < 768 ? 'mobile' : 'tablet';
    }
    return 'tablet';
  });

  const handleToggleDeviceView = (mode: 'mobile' | 'tablet') => {
    setDeviceView(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('family_device_view', mode);
    }
    soundFX.playPop();
  };

  useEffect(() => {
    const handleResize = () => {
      const userSaved = localStorage.getItem('family_device_view');
      if (!userSaved) {
        setDeviceView(window.innerWidth < 768 ? 'mobile' : 'tablet');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active Family User on this device (Default: Mamá)
  const [activeUser, setActiveUser] = useState<FamilyUserId>(() => getStoredActiveUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const initial = getStoredActiveUser();
    return isUserSessionAuthenticated(initial);
  });
  const [targetAuthUser, setTargetAuthUser] = useState<FamilyUserId | null>(() => {
    const initial = getStoredActiveUser();
    return !isUserSessionAuthenticated(initial) ? initial : null;
  });
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    const initial = getStoredActiveUser();
    return !isUserSessionAuthenticated(initial);
  });

  // Cloud Sync state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Stored state
  const [completions, setCompletions] = useState<Record<string, boolean>>(() => getStoredCompletions());
  const [familyActivities, setFamilyActivities] = useState<FamilyActivity[]>(() => getStoredFamilyActivities());
  const [familyNotes, setFamilyNotes] = useState<FamilyNote[]>(() => getStoredFamilyNotes());
  const [bonusLogs, setBonusLogs] = useState<BonusLogEntry[]>(() => getStoredBonusLogs());
  const [customTasks, setCustomTasks] = useState<RoutineTask[]>(() => getStoredCustomTasks());
  const [weeklyPayouts, setWeeklyPayouts] = useState(() => getStoredWeeklyPayouts());
  const [evidences, setEvidences] = useState<TaskEvidence[]>(() => getStoredTaskEvidences());
  const [fines, setFines] = useState<FineRecord[]>(() => getStoredFines());
  const [chatMessages, setChatMessages] = useState<FamilyChatMessage[]>(() => getStoredFamilyChat());
  const [extraPayments, setExtraPayments] = useState<ExtraPaymentConcept[]>(() => getStoredExtraPayments());
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>(() => getStoredFamilyPhotos());
  const [photoSubTab, setPhotoSubTab] = useState<'album' | 'evidences'>('album');

  // Modal states
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [rouletteChild, setRouletteChild] = useState<ChildId>('romina');
  const [isUploadEvidenceOpen, setIsUploadEvidenceOpen] = useState(false);
  const [uploadEvidenceContext, setUploadEvidenceContext] = useState<{
    childId: ChildId;
    taskTitle?: string;
    taskId?: string;
  }>({
    childId: 'romina',
  });

  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    childName: string;
    points: number;
  }>({
    isOpen: false,
    childName: '',
    points: 0,
  });

  const [taskCelebration, setTaskCelebration] = useState<{
    isOpen: boolean;
    task: RoutineTask | null;
    childId: ChildId;
  }>({
    isOpen: false,
    task: null,
    childId: 'romina',
  });

  // Mama 1 Daily Love & Task Reminder Modal
  const [isMamaLoveModalOpen, setIsMamaLoveModalOpen] = useState(false);
  const [isManualMamaLoveOpen, setIsManualMamaLoveOpen] = useState(false);

  // 1 Notificación al día recordando que mamá las ama y necesitan hacer sus tareas
  useEffect(() => {
    if (!hasSeenMamaDailyReminderToday()) {
      const timer = setTimeout(() => {
        setIsMamaLoveModalOpen(true);
        sendMamaBrowserNotification();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle active user change requiring password validation
  const handleRequestUserChange = (newUser: FamilyUserId) => {
    if (newUser === activeUser && isAuthenticated) {
      return;
    }
    if (isUserSessionAuthenticated(newUser)) {
      setActiveUser(newUser);
      saveStoredActiveUser(newUser);
      setIsAuthenticated(true);
      return;
    }
    setTargetAuthUser(newUser);
    setIsProfileModalOpen(true);
  };

  const handleLockApp = () => {
    clearUserSessionAuth();
    setIsAuthenticated(false);
    setTargetAuthUser(activeUser);
    setIsProfileModalOpen(true);
    soundFX.playPop();
  };

  // Helper to construct current bundle
  const getCurrentPayload = useCallback((): CloudSyncPayload => ({
    completions,
    familyActivities,
    familyNotes,
    bonusLogs,
    customTasks,
    weeklyPayouts,
    taskEvidences: evidences,
    fines,
    familyChat: chatMessages,
    extraPayments,
    familyPhotos,
    lastUpdated: new Date().toISOString(),
    updatedBy: activeUser,
  }), [completions, familyActivities, familyNotes, bonusLogs, customTasks, weeklyPayouts, evidences, fines, chatMessages, extraPayments, familyPhotos, activeUser]);

  // Apply merged cloud data to state & storage
  const applyMergedPayload = useCallback((merged: CloudSyncPayload) => {
    if (merged.completions) {
      setCompletions(merged.completions);
      saveStoredCompletions(merged.completions);
    }
    if (merged.familyActivities) {
      setFamilyActivities(merged.familyActivities);
      saveStoredFamilyActivities(merged.familyActivities);
    }
    if (merged.familyNotes) {
      setFamilyNotes(merged.familyNotes);
      saveStoredFamilyNotes(merged.familyNotes);
    }
    if (merged.bonusLogs) {
      setBonusLogs(merged.bonusLogs);
      saveStoredBonusLogs(merged.bonusLogs);
    }
    if (merged.customTasks) {
      setCustomTasks(merged.customTasks);
      saveStoredCustomTasks(merged.customTasks);
    }
    if (merged.weeklyPayouts) {
      setWeeklyPayouts(merged.weeklyPayouts);
      saveStoredWeeklyPayouts(merged.weeklyPayouts);
    }
    if (merged.taskEvidences) {
      setEvidences(merged.taskEvidences);
      saveStoredTaskEvidences(merged.taskEvidences);
    }
    if (merged.fines) {
      setFines(merged.fines);
      saveStoredFines(merged.fines);
    }
    if (merged.familyChat) {
      setChatMessages(merged.familyChat);
      saveStoredFamilyChat(merged.familyChat);
    }
    if (merged.extraPayments) {
      setExtraPayments(merged.extraPayments);
      saveStoredExtraPayments(merged.extraPayments);
    }
    if (merged.familyPhotos) {
      setFamilyPhotos(merged.familyPhotos);
      saveStoredFamilyPhotos(merged.familyPhotos);
    }
    setLastSyncTime(new Date().toISOString());
  }, []);

  // Network and offline resilience manager
  const networkStatus = useNetworkStatus(async () => {
    // When reconnected, perform full automatic cloud sync in background
    try {
      const remote = await fetchCloudState();
      const current = getCurrentPayload();
      if (remote) {
        const merged = mergeCloudData(current, remote);
        applyMergedPayload(merged);
        await pushCloudState(merged);
      } else {
        await pushCloudState(current);
      }
      setLastSyncTime(new Date().toISOString());
      networkStatus.resetPendingChanges();
    } catch (e) {
      console.warn('Background auto-sync on reconnect error:', e);
    }
  });

  // Push local updates to cloud
  const pushToCloud = useCallback(async (payload?: CloudSyncPayload) => {
    try {
      const dataToPush = payload || getCurrentPayload();
      await pushCloudState(dataToPush);
      setLastSyncTime(new Date().toISOString());
      networkStatus.resetPendingChanges();
    } catch (err) {
      console.warn('Silent cloud sync push warning:', err);
    }
  }, [getCurrentPayload, networkStatus]);

  // Debounced push ref
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerDebouncedPush = useCallback((payload: CloudSyncPayload) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      pushToCloud(payload);
    }, 1200);
  }, [pushToCloud]);

  // Manual sync handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const remote = await fetchCloudState();
      const current = getCurrentPayload();
      if (remote) {
        const merged = mergeCloudData(current, remote);
        applyMergedPayload(merged);
        await pushCloudState(merged);
      } else {
        await pushCloudState(current);
        setLastSyncTime(new Date().toISOString());
      }
      networkStatus.resetPendingChanges();
    } catch (err) {
      console.warn('Manual sync failed:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial sync & Real-time WebSockets / SSE subscription
  useEffect(() => {
    // 1. Initial full state sync
    const initialSync = async () => {
      try {
        const remote = await fetchCloudState();
        if (remote) {
          const current = getCurrentPayload();
          const merged = mergeCloudData(current, remote);
          applyMergedPayload(merged);
        } else {
          pushToCloud();
        }
      } catch {
        // safely ignore on boot
      }
    };
    initialSync();

    // 2. Initial chat messages & family photos load from server
    realtimeChat.fetchAllMessages().then((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setChatMessages((prev) => {
          const map = new Map<string, FamilyChatMessage>();
          [...prev, ...remoteMsgs].forEach((m) => map.set(m.id, m));
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          saveStoredFamilyChat(sorted);
          return sorted;
        });
      }
    });

    realtimeChat.fetchFamilyPhotos().then((remotePhotos) => {
      if (remotePhotos && remotePhotos.length > 0) {
        setFamilyPhotos((prev) => {
          const map = new Map<string, FamilyPhoto>();
          [...prev, ...remotePhotos].forEach((p) => map.set(p.id, p));
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
          );
          saveStoredFamilyPhotos(sorted);
          return sorted;
        });
      }
    });

    // Hydrate any high-res photos stored in local IndexedDB
    idbGetAll<FamilyPhoto>(MEDIA_STORES.PHOTOS).then((idbPhotos) => {
      if (idbPhotos && idbPhotos.length > 0) {
        setFamilyPhotos((prev) => {
          const map = new Map<string, FamilyPhoto>();
          [...prev, ...idbPhotos].forEach((p) => map.set(p.id, p));
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
          );
          return sorted;
        });
      }
    }).catch(() => {});

    // 3. Real-time multi-device subscription (instant event delivery across iPad, celular, PC)
    const unsubscribe = realtimeChat.subscribe((event) => {
      if (event.type === 'chat_message') {
        setChatMessages((prev) => {
          const exists = prev.some((m) => m.id === event.message.id);
          const updated = exists 
            ? prev.map((m) => m.id === event.message.id ? event.message : m)
            : [...prev, event.message];
          saveStoredFamilyChat(updated);

          // Audio chime when a new message arrives from another user
          if (!exists && event.message.senderRole !== activeUser) {
            soundFX.playChime();
          }
          return updated;
        });
      } else if (event.type === 'update_message') {
        setChatMessages((prev) => {
          const updated = prev.map((m) => m.id === event.message.id ? event.message : m);
          saveStoredFamilyChat(updated);
          return updated;
        });
      } else if (event.type === 'delete_message') {
        setChatMessages((prev) => {
          const updated = prev.filter((m) => m.id !== event.id);
          saveStoredFamilyChat(updated);
          return updated;
        });
      } else if (event.type === 'photo_added') {
        setFamilyPhotos((prev) => {
          const exists = prev.some((p) => p.id === event.photo.id);
          const updated = exists
            ? prev.map((p) => p.id === event.photo.id ? event.photo : p)
            : [event.photo, ...prev];
          saveStoredFamilyPhotos(updated);
          if (!exists && event.photo.uploadedBy !== activeUser) {
            soundFX.playCelebration();
          }
          return updated;
        });
      } else if (event.type === 'photo_updated') {
        setFamilyPhotos((prev) => {
          const updated = prev.map((p) => p.id === event.photo.id ? event.photo : p);
          saveStoredFamilyPhotos(updated);
          return updated;
        });
      } else if (event.type === 'photo_deleted') {
        setFamilyPhotos((prev) => {
          const updated = prev.filter((p) => p.id !== event.id);
          saveStoredFamilyPhotos(updated);
          return updated;
        });
      } else if (event.type === 'init') {
        if (event.familyChat && Array.isArray(event.familyChat)) {
          setChatMessages((prev) => {
            const map = new Map<string, FamilyChatMessage>();
            [...prev, ...event.familyChat].forEach((m) => map.set(m.id, m));
            const sorted = Array.from(map.values()).sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            saveStoredFamilyChat(sorted);
            return sorted;
          });
        }
        if (event.familyPhotos && Array.isArray(event.familyPhotos)) {
          setFamilyPhotos((prev) => {
            const map = new Map<string, FamilyPhoto>();
            [...prev, ...event.familyPhotos!].forEach((p) => map.set(p.id, p));
            const sorted = Array.from(map.values()).sort(
              (a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
            );
            saveStoredFamilyPhotos(sorted);
            return sorted;
          });
        }
        if (event.onlineUsers && Array.isArray(event.onlineUsers)) {
          setOnlineUsers(event.onlineUsers);
        }
      } else if (event.type === 'presence_update' && Array.isArray(event.onlineUsers)) {
        setOnlineUsers(event.onlineUsers);
      } else if (event.type === 'sync_update' && event.payload) {
        applyMergedPayload(event.payload);
      }
    });

    // 4. Report initial presence
    const userProf = FAMILY_USERS.find((u) => u.id === activeUser);
    realtimeChat.sendPresence({
      userId: activeUser,
      name: userProf?.name || activeUser,
      avatarEmoji: userProf?.avatarEmoji || '🌸',
    });

    // 4b. Real-time Firebase Firestore Chat synchronization across all devices
    const unsubscribeFirebase = subscribeToFirebaseChat((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setChatMessages((prev) => {
          const map = new Map<string, FamilyChatMessage>();
          [...prev, ...remoteMsgs].forEach((m) => map.set(m.id, m));
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          saveStoredFamilyChat(sorted);
          return sorted;
        });
      }
    });

    // 4c. Real-time Firebase Firestore full Family State sync across all devices
    const unsubscribeFamilySync = subscribeToFamilySync(undefined, (remote) => {
      if (remote && remote.lastUpdated) {
        const current = getCurrentPayload();
        const merged = mergeCloudData(current, remote);
        applyMergedPayload(merged);
      }
    });

    // 5. Fast Background Polling every 4 seconds to ensure full consistency across tabs
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !isSyncing && networkStatus.isOnline) {
        try {
          const remote = await fetchCloudState();
          if (remote && remote.lastUpdated) {
            const current = getCurrentPayload();
            const merged = mergeCloudData(current, remote);
            applyMergedPayload(merged);
          }
        } catch {
          // silent background check
        }
      }
    }, 4000);

    return () => {
      unsubscribe();
      unsubscribeFirebase();
      unsubscribeFamilySync();
      clearInterval(interval);
    };
  }, [activeUser, applyMergedPayload]);

  // Export complete family backup JSON
  const handleExportBackup = () => {
    const payload = getCurrentPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `familia_jimenez_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundFX.playFanfare();
  };

  // Import family backup JSON
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as CloudSyncPayload;
        if (parsed) {
          applyMergedPayload(parsed);
          await pushCloudState(parsed);
          soundFX.playFanfare();
          alert('¡Respaldo familiar restaurado con éxito y sincronizado en la nube!');
        }
      } catch (err) {
        alert('El archivo no tiene un formato válido de respaldo familiar.');
      }
    };
    reader.readAsText(file);
  };

  // Sync sound setting
  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Generate routines for current day + any custom tasks added
  const dailyTasks = useMemo(() => {
    const baseSchedule = generateDailySchedule(currentDate);
    const dateKey = formatDateKey(currentDate);
    
    // Filter custom tasks that match today or apply generally
    const activeCustom = customTasks.filter((t) => {
      // In ID or property, match current date if saved with date
      return !t.id.includes('custom-date-') || t.id.includes(`custom-date-${dateKey}`);
    });

    return [...baseSchedule, ...activeCustom];
  }, [currentDate, customTasks]);

  const hasLunaDuty = useMemo(() => isLunaDutyDay(currentDate), [currentDate]);

  const todayDateStr = formatDateKey(currentDate);
  const todayFamilyActivity = useMemo(() => {
    return familyActivities.find((a) => a.date === todayDateStr);
  }, [familyActivities, todayDateStr]);

  // Check and toggle task completion
  const handleToggleTask = (taskId: string, childId: ChildId) => {
    const taskKey = `${taskId}_${childId}`;
    const nextState = !completions[taskKey];

    const updated = {
      ...completions,
      [taskKey]: nextState,
    };

    setCompletions(updated);
    saveStoredCompletions(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      completions: updated,
    });

    if (nextState) {
      soundFX.playCheck();

      // Trigger Luna celebration animation with motivational phrase for this task
      const currentTask = dailyTasks.find((t) => t.id === taskId);
      if (currentTask) {
        setTaskCelebration({
          isOpen: true,
          task: currentTask,
          childId,
        });
      }

      // Check if this action triggers 100% completion for this child on this day!
      const childTasks = dailyTasks.filter(
        (t) => t.assignedTo === childId || t.assignedTo === 'both'
      );
      
      const allDone = childTasks.every((t) => {
        const k = `${t.id}_${childId}`;
        return k === taskKey ? true : !!updated[k];
      });

      if (allDone && childTasks.length > 0) {
        const totalPointsToday = childTasks.reduce((acc, t) => acc + t.points, 0);
        setTimeout(() => {
          setCelebrationState({
            isOpen: true,
            childName: childId === 'romina' ? 'Romina' : 'Regina',
            points: totalPointsToday,
          });
        }, 1200);
      }
    } else {
      soundFX.playPop();
    }
  };

  // Add custom task
  const handleAddCustomTask = (newTask: RoutineTask) => {
    const dateKey = formatDateKey(currentDate);
    const taskWithDate = {
      ...newTask,
      id: `custom-date-${dateKey}-${Date.now()}`,
    };
    const updated = [...customTasks, taskWithDate];
    setCustomTasks(updated);
    saveStoredCustomTasks(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      customTasks: updated,
    });
    soundFX.playCheck();
  };

  // Family Activity Handlers
  const handleSaveFamilyActivity = (activity: FamilyActivity) => {
    const exists = familyActivities.some((a) => a.id === activity.id);
    let updated: FamilyActivity[];
    if (exists) {
      updated = familyActivities.map((a) => (a.id === activity.id ? activity : a));
    } else {
      updated = [activity, ...familyActivities];
    }
    setFamilyActivities(updated);
    saveStoredFamilyActivities(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyActivities: updated,
    });
  };

  const handleDeleteFamilyActivity = (id: string) => {
    const updated = familyActivities.filter((a) => a.id !== id);
    setFamilyActivities(updated);
    saveStoredFamilyActivities(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyActivities: updated,
    });
    soundFX.playPop();
  };

  const handleToggleFamilyActivityComplete = (id: string) => {
    const updated = familyActivities.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setFamilyActivities(updated);
    saveStoredFamilyActivities(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyActivities: updated,
    });
    soundFX.playCheck();
  };

  // Family Notes Handlers
  const handleAddFamilyNote = (note: FamilyNote) => {
    const updated = [note, ...familyNotes];
    setFamilyNotes(updated);
    saveStoredFamilyNotes(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyNotes: updated,
    });
  };

  const handleReactToNote = (noteId: string, reactionType: keyof FamilyNote['reactions']) => {
    const updated = familyNotes.map((n) => {
      if (n.id === noteId) {
        return {
          ...n,
          reactions: {
            ...n.reactions,
            [reactionType]: n.reactions[reactionType] + 1,
          },
        };
      }
      return n;
    });
    setFamilyNotes(updated);
    saveStoredFamilyNotes(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyNotes: updated,
    });
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = familyNotes.filter((n) => n.id !== noteId);
    setFamilyNotes(updated);
    saveStoredFamilyNotes(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      familyNotes: updated,
    });
    soundFX.playPop();
  };

  // Screen-free Bonus Handlers (Max 1 daily per child)
  const handleClaimBonus = (bonus: ScreenFreeBonus, childId: ChildId) => {
    const todayDateKey = formatDateKey(currentDate);
    const alreadyClaimed = bonusLogs.some(
      (b) => b.childId === childId && b.date === todayDateKey
    );
    if (alreadyClaimed) return;

    const entry: BonusLogEntry = {
      id: `b-log-${Date.now()}`,
      bonusId: bonus.id,
      childId,
      date: todayDateKey,
      title: bonus.title,
      points: bonus.points,
      pesosReward: bonus.pesosReward,
      timestamp: new Date().toISOString(),
    };

    const updated = [entry, ...bonusLogs];
    setBonusLogs(updated);
    saveStoredBonusLogs(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      bonusLogs: updated,
    });
    soundFX.playFanfare();
  };

  const handleRemoveBonusLog = (logId: string) => {
    const updated = bonusLogs.filter((b) => b.id !== logId);
    setBonusLogs(updated);
    saveStoredBonusLogs(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      bonusLogs: updated,
    });
    soundFX.playPop();
  };

  // Payout toggle handler
  const handleTogglePayout = (weekKey: string) => {
    const current = weeklyPayouts[weekKey]?.paid;
    const updated = {
      ...weeklyPayouts,
      [weekKey]: {
        weekKey,
        paid: !current,
        paidAt: !current ? new Date().toISOString() : undefined,
      },
    };
    setWeeklyPayouts(updated);
    saveStoredWeeklyPayouts(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      weeklyPayouts: updated,
    });
  };

  // Photo Evidences Handlers
  const handleSaveEvidence = (evidence: TaskEvidence) => {
    const updated = [evidence, ...evidences];
    setEvidences(updated);
    saveStoredTaskEvidences(updated);

    // Automatically check off task if associated with a task
    if (evidence.taskId) {
      const taskKey = `${evidence.taskId}_${evidence.childId}`;
      if (!completions[taskKey]) {
        const updatedCompletions = {
          ...completions,
          [taskKey]: true,
        };
        setCompletions(updatedCompletions);
        saveStoredCompletions(updatedCompletions);
      }
    }

    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      taskEvidences: updated,
    });
    soundFX.playFanfare();

    // Automatically send an alert in family chat as a Notice to Mom!
    const autoChatMessage: FamilyChatMessage = {
      id: `chat-auto-ev-${Date.now()}`,
      sender: evidence.childId === 'romina' ? 'Romina' : 'Regina',
      senderRole: evidence.childId,
      text: `📸 ¡Mamá, subí foto de evidencia para "${evidence.taskTitle}"! ¡Misión cumplida! ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageDataUrl: evidence.imageDataUrl,
      isNoticeToMama: true,
    };
    const updatedChat = [...chatMessages, autoChatMessage];
    setChatMessages(updatedChat);
    saveStoredFamilyChat(updatedChat);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    const updated = evidences.filter((e) => e.id !== evidenceId);
    setEvidences(updated);
    saveStoredTaskEvidences(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      taskEvidences: updated,
    });
    soundFX.playPop();
  };

  // Police Nan Fines Handlers
  const handleAddFine = (fine: FineRecord) => {
    const updated = [fine, ...fines];
    setFines(updated);
    saveStoredFines(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      fines: updated,
    });
    soundFX.playAlert();

    // Nan automatically publishes notice to the family chat!
    const victim = fine.childId === 'romina' ? 'Romina' : 'Regina';
    const nanChatMessage: FamilyChatMessage = {
      id: `chat-auto-fine-${Date.now()}`,
      sender: 'Nan',
      senderRole: 'policia_nan',
      text: `🚨 MULTA POLICIAL: Se ha emitido una multa de $${fine.amount} pesos a ${victim}. Motivo: "${fine.reason}". Recuerden colgar su ropa, pasear a Luna y cumplir horarios. 👮‍♀️`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageDataUrl: fine.imageDataUrl,
      isNoticeToMama: true,
    };
    const updatedChat = [...chatMessages, nanChatMessage];
    setChatMessages(updatedChat);
    saveStoredFamilyChat(updatedChat);
  };

  const handleForgiveFine = (fineId: string) => {
    const updated = fines.map((f) => {
      if (f.id === fineId) {
        return {
          ...f,
          status: (f.status === 'activa' ? 'perdonada' : 'activa') as 'activa' | 'perdonada',
        };
      }
      return f;
    });
    setFines(updated);
    saveStoredFines(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      fines: updated,
    });
    soundFX.playChime();
  };

  const handleDeleteFine = (fineId: string) => {
    const updated = fines.filter((f) => f.id !== fineId);
    setFines(updated);
    saveStoredFines(updated);
    networkStatus.recordLocalChange();
    triggerDebouncedPush({
      ...getCurrentPayload(),
      fines: updated,
    });
    soundFX.playPop();
  };

  // Family Chat Handlers (Real-time synced across all devices with Firebase Firestore)
  const handleSendMessage = async (msg: FamilyChatMessage) => {
    // 1. Optimistic update for sender's UI
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const updated = [...prev, msg];
      saveStoredFamilyChat(updated);
      return updated;
    });

    // 2. Real-time broadcast to Firebase Firestore (all tablets, phones, PCs)
    try {
      await sendFirebaseMessage(msg);
    } catch (err) {
      console.warn('[Chat] Firebase Firestore send error:', err);
    }

    // 3. Complementary broadcast via server fallback
    try {
      await realtimeChat.sendMessage(msg);
    } catch (err) {
      console.warn('[Chat] Realtime send error:', err);
    }

    // 4. Keep cloud backup state aligned
    triggerDebouncedPush(getCurrentPayload());
  };

  const handleDeleteMessage = async (id: string) => {
    setChatMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveStoredFamilyChat(updated);
      return updated;
    });
    try {
      await deleteFirebaseMessage(id);
    } catch (err) {
      console.warn('[Chat] Firebase Firestore delete error:', err);
    }
    try {
      await realtimeChat.deleteMessage(id);
    } catch (err) {
      console.warn('[Chat] Realtime delete error:', err);
    }
    soundFX.playPop();
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    let newCount = 1;
    setChatMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === messageId) {
          const currentCount = m.reactions?.[emoji] || 0;
          newCount = currentCount + 1;
          return {
            ...m,
            reactions: {
              ...(m.reactions || {}),
              [emoji]: newCount,
            },
          };
        }
        return m;
      });
      saveStoredFamilyChat(updated);
      return updated;
    });

    try {
      await updateFirebaseReaction(messageId, emoji, newCount - 1);
    } catch (err) {
      console.warn('[Chat] Firebase Firestore reaction error:', err);
    }

    try {
      await realtimeChat.reactToMessage(messageId, emoji);
    } catch (err) {
      console.warn('[Chat] Realtime react error:', err);
    }
    soundFX.playPop();
  };

  // Mamá notice approval handler
  const handleMamaApproveNotice = async (messageId: string, comment?: string) => {
    setChatMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            reviewedByMama: true,
            mamaComment: comment,
            mamaApprovedAt: new Date().toISOString(),
          };
        }
        return m;
      });
      saveStoredFamilyChat(updated);
      return updated;
    });

    try {
      await approveFirebaseNotice(messageId, comment);
    } catch (err) {
      console.warn('[Chat] Firebase Firestore approve notice error:', err);
    }

    try {
      await realtimeChat.approveNotice(messageId, comment);
    } catch (err) {
      console.warn('[Chat] Realtime approve error:', err);
    }
  };

  // Family Photo Album Handlers (con descripción del día)
  const handleAddFamilyPhoto = async (photo: FamilyPhoto) => {
    setFamilyPhotos((prev) => {
      const updated = [photo, ...prev.filter((p) => p.id !== photo.id)];
      saveStoredFamilyPhotos(updated);
      return updated;
    });

    try {
      await realtimeChat.sendFamilyPhoto(photo);
    } catch (err) {
      console.warn('[Photos] Realtime send photo error:', err);
    }

    triggerDebouncedPush(getCurrentPayload());
  };

  const handleDeleteFamilyPhoto = async (id: string) => {
    setFamilyPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveStoredFamilyPhotos(updated);
      return updated;
    });
    try {
      await realtimeChat.deleteFamilyPhoto(id);
    } catch (err) {
      console.warn('[Photos] Realtime delete photo error:', err);
    }
  };

  const handleReactFamilyPhoto = async (photoId: string, emoji: string) => {
    setFamilyPhotos((prev) => {
      const updated = prev.map((p) => {
        if (p.id === photoId) {
          const currentCount = p.reactions?.[emoji] || 0;
          return {
            ...p,
            reactions: {
              ...(p.reactions || {}),
              [emoji]: currentCount + 1,
            },
          };
        }
        return p;
      });
      saveStoredFamilyPhotos(updated);
      return updated;
    });
    try {
      await realtimeChat.reactFamilyPhoto(photoId, emoji);
    } catch (err) {
      console.warn('[Photos] Realtime react photo error:', err);
    }
  };

  const handleSharePhotoToChat = (photo: FamilyPhoto) => {
    const senderName = FAMILY_USERS.find((u) => u.id === activeUser)?.name || 'Mamá';
    const text = `📸 Recuerdo del día: "${photo.title}" (${photo.date})\n"${photo.description}"`;
    handleSendMessage({
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: senderName as any,
      senderRole: activeUser,
      text,
      timestamp: new Date().toISOString(),
      imageDataUrl: photo.imageDataUrl,
    });
    setActiveTab('chat');
    soundFX.playCelebration();
  };

  // Active fines count
  const activeFinesCount = useMemo(() => {
    return fines.filter((f) => f.status === 'activa').length;
  }, [fines]);

  // Extra manual payment handlers
  const handleAddExtraPayment = (payment: Omit<ExtraPaymentConcept, 'id' | 'timestamp'>) => {
    const newPayment: ExtraPaymentConcept = {
      ...payment,
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newPayment, ...extraPayments];
    setExtraPayments(updated);
    saveStoredExtraPayments(updated);
    triggerDebouncedPush({
      ...getCurrentPayload(),
      extraPayments: updated,
    });
  };

  const handleToggleExtraPaymentStatus = (id: string) => {
    const updated = extraPayments.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === 'pendiente' ? 'pagado' : 'pendiente';
        return {
          ...p,
          status: nextStatus,
          paidAt: nextStatus === 'pagado' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });
    setExtraPayments(updated);
    saveStoredExtraPayments(updated);
    triggerDebouncedPush({
      ...getCurrentPayload(),
      extraPayments: updated,
    });
  };

  const handleDeleteExtraPayment = (id: string) => {
    const updated = extraPayments.filter((p) => p.id !== id);
    setExtraPayments(updated);
    saveStoredExtraPayments(updated);
    triggerDebouncedPush({
      ...getCurrentPayload(),
      extraPayments: updated,
    });
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedChild={selectedChild}
        onChildChange={setSelectedChild}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onResetToday={() => {
          setCurrentDate(new Date());
          soundFX.playPop();
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeFinesCount={activeFinesCount}
        activeUser={activeUser}
        onUserChange={handleRequestUserChange}
        onLockApp={handleLockApp}
        isSyncing={isSyncing}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        lastSyncTime={lastSyncTime}
        isOnline={networkStatus.isOnline}
        pendingChangesCount={networkStatus.pendingChangesCount}
        onOpenMamaLoveReminder={() => {
          setIsManualMamaLoveOpen(true);
          setIsMamaLoveModalOpen(true);
          soundFX.playCelebration();
        }}
        deviceView={deviceView}
        onToggleDeviceView={handleToggleDeviceView}
      />

      {/* Network & Offline Resilience Indicator Bar */}
      <NetworkStatusIndicator
        isOnline={networkStatus.isOnline}
        isReconnecting={networkStatus.isReconnecting}
        justReconnected={networkStatus.justReconnected}
        pendingChangesCount={networkStatus.pendingChangesCount}
        onCheckConnection={networkStatus.checkConnectionNow}
        onForceSync={handleManualSync}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Content Area: Optimized width & padding for mobile vs tablet */}
      <main 
        className={deviceView === 'mobile' ? 'max-w-lg mx-auto px-2 sm:px-3 pt-2 sm:pt-3' : 'max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12'}
        style={deviceView === 'mobile' ? { paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 16px))' } : undefined}
      >
        {activeTab === 'daily' && (
          <DailyView
            currentDate={currentDate}
            tasks={dailyTasks}
            completions={completions}
            onToggleTask={handleToggleTask}
            selectedChild={selectedChild}
            onOpenAddCustomModal={() => setIsAddCustomOpen(true)}
            onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
            todayFamilyActivity={todayFamilyActivity}
            hasLunaDuty={hasLunaDuty}
            bonusLogs={bonusLogs}
            onOpenRoulette={() => {
              setRouletteChild(selectedChild === 'both' ? 'romina' : selectedChild);
              setIsRouletteOpen(true);
            }}
            onOpenUploadEvidence={(task, childId) => {
              setUploadEvidenceContext({
                childId: childId || (selectedChild === 'both' ? 'romina' : selectedChild),
                taskTitle: task?.title,
                taskId: task?.id,
              });
              setIsUploadEvidenceOpen(true);
            }}
            activeFinesCount={activeFinesCount}
            onNavigateToFines={() => setActiveTab('fines')}
            onNavigateToEvidences={() => setActiveTab('photos')}
            activeUser={activeUser}
            onShareToChat={(text) => {
              const senderName = 
                activeUser === 'regina' ? 'Regina' : 
                activeUser === 'romina' ? 'Romina' : 
                activeUser === 'papa' ? 'Papá' : 
                activeUser === 'policia_nan' ? 'Nan' : 'Mamá';
              handleSendMessage({
                id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                sender: senderName as any,
                senderRole: activeUser as any,
                text,
                timestamp: new Date().toISOString(),
              });
            }}
            isOnline={networkStatus.isOnline}
            pendingChangesCount={networkStatus.pendingChangesCount}
            deviceView={deviceView}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyView
            currentDate={currentDate}
            onSelectDate={(newDate) => {
              setCurrentDate(newDate);
              setActiveTab('daily');
            }}
            familyActivities={familyActivities}
            onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
            selectedChild={selectedChild}
            completions={completions}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsPanel
            currentDate={currentDate}
            completions={completions}
            bonusLogs={bonusLogs}
            fines={fines}
            selectedChild={selectedChild}
            weeklyPayouts={weeklyPayouts}
            onTogglePayout={handleTogglePayout}
            onNavigateToFines={() => setActiveTab('fines')}
            extraPayments={extraPayments}
            onAddExtraPayment={handleAddExtraPayment}
            onToggleExtraPaymentStatus={handleToggleExtraPaymentStatus}
            onDeleteExtraPayment={handleDeleteExtraPayment}
            activeUser={activeUser}
            customTasks={customTasks}
          />
        )}

        {activeTab === 'bonuses' && (
          <BonusCatalog
            bonusLogs={bonusLogs}
            onClaimBonus={handleClaimBonus}
            onRemoveBonusLog={handleRemoveBonusLog}
            selectedChild={selectedChild}
            currentDate={currentDate}
          />
        )}

        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Sub-tab switcher */}
            <div className="flex items-center justify-center p-1.5 bg-slate-100/90 rounded-2xl max-w-md mx-auto border border-slate-200 shadow-xs">
              <button
                id="subtab-album-btn"
                onClick={() => {
                  setPhotoSubTab('album');
                  soundFX.playPop();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  photoSubTab === 'album'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📸 Álbum Familiar ({familyPhotos.length})</span>
              </button>

              <button
                id="subtab-evidences-btn"
                onClick={() => {
                  setPhotoSubTab('evidences');
                  soundFX.playPop();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  photoSubTab === 'evidences'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📋 Evidencias de Misiones ({evidences.length})</span>
              </button>
            </div>

            {photoSubTab === 'album' ? (
              <FamilyPhotoAlbumView
                photos={familyPhotos}
                onAddPhoto={handleAddFamilyPhoto}
                onDeletePhoto={handleDeleteFamilyPhoto}
                onReactPhoto={handleReactFamilyPhoto}
                onShareToChat={handleSharePhotoToChat}
                activeUser={activeUser}
              />
            ) : (
              <TaskEvidencesView
                evidences={evidences}
                onOpenUploadModal={(cid) => {
                  setUploadEvidenceContext({
                    childId: cid || (selectedChild === 'both' ? 'romina' : selectedChild),
                  });
                  setIsUploadEvidenceOpen(true);
                }}
                onDeleteEvidence={handleDeleteEvidence}
                selectedChild={selectedChild}
              />
            )}
          </div>
        )}

        {activeTab === 'fines' && (
          <FinesPolicePanel
            fines={fines}
            onAddFine={handleAddFine}
            onForgiveFine={handleForgiveFine}
            onDeleteFine={handleDeleteFine}
            currentDate={currentDate}
            selectedChild={selectedChild}
          />
        )}

        {activeTab === 'chat' && (
          <FamilyChatView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onAddReaction={handleAddReaction}
            onMamaApproveNotice={handleMamaApproveNotice}
            activeUser={activeUser}
            onSwitchUser={handleRequestUserChange}
            onlineUsers={onlineUsers}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            deviceView={deviceView}
          />
        )}

        {activeTab === 'notes' && (
          <FamilyNotesBoard
            notes={familyNotes}
            onAddNote={handleAddFamilyNote}
            onReactToNote={handleReactToNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </main>

      {/* Modals */}
      <FamilySyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onManualSync={handleManualSync}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        activeUser={activeUser}
        isOnline={networkStatus.isOnline}
        pendingChangesCount={networkStatus.pendingChangesCount}
        onCheckConnection={networkStatus.checkConnectionNow}
      />

      <AddCustomTaskModal
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        onAddTask={handleAddCustomTask}
        selectedChild={selectedChild}
      />

      <FamilyActivitiesModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        activities={familyActivities}
        onSaveActivity={handleSaveFamilyActivity}
        onDeleteActivity={handleDeleteFamilyActivity}
        onToggleComplete={handleToggleFamilyActivityComplete}
      />

      <CelebrationModal
        isOpen={celebrationState.isOpen}
        onClose={() => setCelebrationState((prev) => ({ ...prev, isOpen: false }))}
        childName={celebrationState.childName}
        pointsEarned={celebrationState.points}
      />

      <TaskCheckCelebrationModal
        isOpen={taskCelebration.isOpen}
        onClose={() => setTaskCelebration((prev) => ({ ...prev, isOpen: false }))}
        task={taskCelebration.task}
        childId={taskCelebration.childId}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        onClaimBonus={handleClaimBonus}
        selectedChild={rouletteChild}
        onSelectChild={setRouletteChild}
        hasClaimedToday={(cid) => {
          const key = formatDateKey(currentDate);
          return bonusLogs.some((b) => b.childId === cid && b.date === key);
        }}
      />

      <UploadEvidenceModal
        isOpen={isUploadEvidenceOpen}
        onClose={() => setIsUploadEvidenceOpen(false)}
        onSaveEvidence={handleSaveEvidence}
        initialChildId={uploadEvidenceContext.childId}
        initialTaskTitle={uploadEvidenceContext.taskTitle}
        initialTaskId={uploadEvidenceContext.taskId}
        currentDate={currentDate}
      />

      <FamilyDeviceConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        isOnline={networkStatus.isOnline}
      />

      <DeviceProfileModal
        isOpen={isProfileModalOpen}
        targetUser={targetAuthUser}
        allowClose={isAuthenticated}
        onSuccess={(userId) => {
          setActiveUser(userId);
          saveStoredActiveUser(userId);
          setIsAuthenticated(true);
          setTargetAuthUser(null);
          setIsProfileModalOpen(false);
        }}
        onClose={() => {
          if (isAuthenticated) {
            setTargetAuthUser(null);
            setIsProfileModalOpen(false);
          }
        }}
      />

      {/* Mama Daily Love & Task Reminder Modal */}
      <MamaDailyLoveModal
        isOpen={isMamaLoveModalOpen}
        onClose={() => setIsMamaLoveModalOpen(false)}
        isManualOpen={isManualMamaLoveOpen}
        onGoToTasks={() => {
          setActiveTab('daily');
        }}
      />

      {/* Persistent Mobile Bottom Navigation (Solo en Celular o pantallas móviles) */}
      {deviceView === 'mobile' && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeFinesCount={activeFinesCount}
          onOpenMamaLoveReminder={() => {
            setIsManualMamaLoveOpen(true);
            setIsMamaLoveModalOpen(true);
            soundFX.playCelebration();
          }}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onToggleDeviceView={handleToggleDeviceView}
          deviceView={deviceView}
        />
      )}
    </div>
  );
}
