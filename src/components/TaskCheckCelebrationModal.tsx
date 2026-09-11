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
        className="relative w-full max-w-[340px] sm:max-w-[360px] max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden transform animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header Banner */}
        <div className={`bg-gradient-to-r ${info.themeGradient} px-4 py-2.5 text-white relative flex-shrink-0`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide">
            <span>{info.animationEmoji}</span>
            <span>{info.badgeLabel}</span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5 drop-shadow-xs">
            ¡Actividad Completada! 🎉
          </h2>
          <p className="text-[11px] text-white/90 font-medium truncate">
            {childName} {childEmoji} sumó +{task.points} pts
          </p>
        </div>

        {/* Luna French Poodle Centerpiece with Animated Activity Variant */}
        <div className="py-2 px-4 flex justify-center items-center bg-gradient-to-b from-amber-50/50 to-white flex-shrink-0">
          <div className="p-1 rounded-2xl bg-white shadow-sm border border-amber-100 ring-2 ring-pink-100">
            <LunaFrenchPoodle 
              size="sm" 
              variant={info.lunaVariant}
              showBark={true} 
            />
          </div>
        </div>

        {/* Compact Card Body */}
        <div className="p-3 sm:p-4 pt-1 space-y-2 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Motivational Phrase Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 shadow-2xs">
            <h3 className="text-sm sm:text-base font-black text-amber-950 font-['Fredoka',sans-serif] leading-tight">
              {info.motivationalPhrase}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-1 leading-snug line-clamp-2">
              {info.subPhrase}
            </p>
          </div>

          {/* Activity summary row */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2 text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {task.title}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                <span className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                  +{task.points} Puntos ganados
                </span>
              </div>
            </div>
          </div>

          {/* Luna Note */}
          <div className="bg-pink-50/90 border border-pink-200 rounded-xl p-2 flex items-center gap-2 text-left">
            <span className="text-base flex-shrink-0">🐩</span>
            <p className="text-[10px] sm:text-[11px] text-pink-950 font-medium leading-tight line-clamp-2">
              <strong className="font-bold">Luna: </strong>
              {info.lunaReaction}
            </p>
          </div>

          {/* Immediate Action Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>¡Continuar! ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
