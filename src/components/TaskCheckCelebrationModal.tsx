import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X, CheckCircle2, Star } from 'lucide-react';
import { RoutineTask, ChildId } from '../types';
import { LunaFrenchPoodle } from './LunaFrenchPoodle';
import { getActivityCelebrationInfo } from '../utils/taskMotivationalPhrases';
import { soundFX } from '../utils/audio';

interface TaskCheckCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: RoutineTask | null;
  childId: ChildId;
}

export const TaskCheckCelebrationModal: React.FC<TaskCheckCelebrationModalProps> = ({
  isOpen,
  onClose,
  task,
  childId,
}) => {
  useEffect(() => {
    if (isOpen && task) {
      soundFX.playPuppyBark();
      setTimeout(() => {
        soundFX.playChime();
      }, 220);

      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const childName = childId === 'romina' ? 'Romina' : 'Regina';
  const childEmoji = childId === 'romina' ? '🌸' : '💜';
  const info = getActivityCelebrationInfo(task, childId);

  return (
    <div
      id="task-check-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Compact Card that fits in one single screen without scrolling */}
      <div
        id="task-check-modal-card"
        className="relative w-full max-w-[360px] sm:max-w-[420px] flex flex-col bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden transform animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header Banner */}
        <div className={`bg-gradient-to-r ${info.themeGradient} px-3 py-1.5 text-white relative flex-shrink-0 flex items-center justify-between`}>
          <div className="flex items-center gap-1.5 text-left">
            <span className="text-base">{info.animationEmoji}</span>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight drop-shadow-xs leading-tight">
                ¡Actividad Completada! 🎉
              </h2>
              <p className="text-[10px] text-white/90 font-medium leading-none">
                {childName} {childEmoji} sumó +{task.points} pts ({info.badgeLabel})
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Compact Body: Side by Side on all devices */}
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* Luna French Poodle (Col 4) */}
            <div className="col-span-4 flex justify-center items-center">
              <div className="p-1 rounded-2xl bg-white shadow-2xs border border-amber-100 ring-1 ring-pink-100 scale-90">
                <LunaFrenchPoodle 
                  size="sm" 
                  variant={info.lunaVariant}
                  showBark={false} 
                />
              </div>
            </div>

            {/* Motivational phrase & reaction (Col 8) */}
            <div className="col-span-8 text-left space-y-1">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                <h3 className="text-xs font-black text-amber-950 font-['Fredoka',sans-serif] leading-tight">
                  {info.motivationalPhrase}
                </h3>
                <p className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug line-clamp-2">
                  {info.subPhrase}
                </p>
              </div>

              <div className="bg-pink-50/90 border border-pink-200 rounded-lg p-1.5 flex items-center gap-1.5">
                <span className="text-xs flex-shrink-0">🐩</span>
                <p className="text-[10px] text-pink-950 font-medium leading-tight truncate">
                  <strong>Luna: </strong>{info.lunaReaction}
                </p>
              </div>
            </div>
          </div>

          {/* Activity summary + Continue in one row */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex items-center gap-1.5 text-left min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 truncate">
                  {task.title}
                </p>
                <p className="text-[9px] text-emerald-700 font-bold leading-none">
                  +{task.points} Puntos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="py-2 px-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-black text-xs shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>¡Continuar! ✨</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
