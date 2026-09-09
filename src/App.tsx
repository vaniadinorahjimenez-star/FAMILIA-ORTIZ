/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChildId, 
  RoutineTask, 
  FamilyActivity, 
  FamilyNote, 
  ScreenFreeBonus, 
  BonusLogEntry,
  TaskEvidence,
  FineRecord,
  FamilyChatMessage
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
  saveStoredFamilyChat
} from './utils/storage';
import { soundFX } from './utils/audio';

import { Header, ActiveTab } from './components/Header';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';
import { RewardsPanel } from './components/RewardsPanel';
import { BonusCatalog } from './components/BonusCatalog';
import { FamilyNotesBoard } from './components/FamilyNotesBoard';
import { AddCustomTaskModal } from './components/AddCustomTaskModal';
import { FamilyActivitiesModal } from './components/FamilyActivitiesModal';
import { CelebrationModal } from './components/CelebrationModal';
import { RouletteModal } from './components/RouletteModal';
import { UploadEvidenceModal } from './components/UploadEvidenceModal';
import { TaskEvidencesView } from './components/TaskEvidencesView';
import { FinesPolicePanel } from './components/FinesPolicePanel';
import { FamilyChatView } from './components/FamilyChatView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [selectedChild, setSelectedChild] = useState<ChildId | 'both'>('both');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

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

    if (nextState) {
      soundFX.playCheck();

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
        setCelebrationState({
          isOpen: true,
          childName: childId === 'romina' ? 'Romina' : 'Regina',
          points: totalPointsToday,
        });
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
  };

  const handleDeleteFamilyActivity = (id: string) => {
    const updated = familyActivities.filter((a) => a.id !== id);
    setFamilyActivities(updated);
    saveStoredFamilyActivities(updated);
    soundFX.playPop();
  };

  const handleToggleFamilyActivityComplete = (id: string) => {
    const updated = familyActivities.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setFamilyActivities(updated);
    saveStoredFamilyActivities(updated);
    soundFX.playCheck();
  };

  // Family Notes Handlers
  const handleAddFamilyNote = (note: FamilyNote) => {
    const updated = [note, ...familyNotes];
    setFamilyNotes(updated);
    saveStoredFamilyNotes(updated);
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
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = familyNotes.filter((n) => n.id !== noteId);
    setFamilyNotes(updated);
    saveStoredFamilyNotes(updated);
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
    soundFX.playFanfare();
  };

  const handleRemoveBonusLog = (logId: string) => {
    const updated = bonusLogs.filter((b) => b.id !== logId);
    setBonusLogs(updated);
    saveStoredBonusLogs(updated);
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
  };

  // Photo Evidences Handlers
  const handleSaveEvidence = (evidence: TaskEvidence) => {
    const updated = [evidence, ...evidences];
    setEvidences(updated);
    saveStoredTaskEvidences(updated);
    soundFX.playFanfare();

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
    soundFX.playPop();
  };

  // Police Nan Fines Handlers
  const handleAddFine = (fine: FineRecord) => {
    const updated = [fine, ...fines];
    setFines(updated);
    saveStoredFines(updated);
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
    soundFX.playChime();
  };

  const handleDeleteFine = (fineId: string) => {
    const updated = fines.filter((f) => f.id !== fineId);
    setFines(updated);
    saveStoredFines(updated);
    soundFX.playPop();
  };

  // Family Chat Handlers
  const handleSendMessage = (msg: FamilyChatMessage) => {
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    saveStoredFamilyChat(updated);
  };

  const handleDeleteMessage = (id: string) => {
    const updated = chatMessages.filter((m) => m.id !== id);
    setChatMessages(updated);
    saveStoredFamilyChat(updated);
    soundFX.playPop();
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    const updated = chatMessages.map((m) => {
      if (m.id === messageId) {
        const currentCount = m.reactions?.[emoji] || 0;
        return {
          ...m,
          reactions: {
            ...(m.reactions || {}),
            [emoji]: currentCount + 1,
          },
        };
      }
      return m;
    });
    setChatMessages(updated);
    saveStoredFamilyChat(updated);
    soundFX.playPop();
  };

  // Active fines count
  const activeFinesCount = useMemo(() => {
    return fines.filter((f) => f.status === 'activa').length;
  }, [fines]);

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
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
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
    </div>
  );
}
