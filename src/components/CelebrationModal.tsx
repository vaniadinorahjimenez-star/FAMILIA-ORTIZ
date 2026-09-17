import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, X, Star, Heart } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { LunaFrenchPoodle } from './LunaFrenchPoodle';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  pointsEarned: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  childName,
  pointsEarned,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFX.playFanfare();
      setTimeout(() => {
        soundFX.playPuppyBark();
      }, 300);

      // Multi-burst celebration confetti
      const count = 120;
      const defaults = { origin: { y: 0.65 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 30,
        startVelocity: 50,
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ec4899', '#8b5cf6', '#eab308'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="celebration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="celebration-modal-card"
        className="relative w-full max-w-[340px] sm:max-w-[380px] flex flex-col p-3.5 sm:p-4 bg-white rounded-3xl shadow-2xl border-2 border-amber-300 text-center overflow-hidden transform animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="celebration-close-btn"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Luna French Poodle Centerpiece + Headline */}
        <div className="flex items-center justify-center gap-3 mb-2 pr-6">
          <div className="relative flex-shrink-0 scale-90">
            <LunaFrenchPoodle size="sm" variant="default" showBark={false} />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow-xs border border-white">
              <Trophy className="w-3 h-3" />
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-black font-['Fredoka',sans-serif] text-slate-900 leading-tight">
              ¡100% COMPLETADO! 🎉
            </h3>
            <p className="text-xs font-bold text-purple-700">
              ¡Felicidades, {childName}!
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mb-2 leading-snug">
          Completaste todas tus rutinas de hoy. ¡Luna, Nan, Mamá y Papá están súper orgullosos!
        </p>

        <div className="flex items-center justify-center gap-2 p-2 mb-2.5 bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 rounded-2xl border border-amber-200">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400 flex-shrink-0" />
          <div className="text-left">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Puntos acumulados hoy
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-800">
              +{pointsEarned} Puntos para tus $100 pesos
            </span>
          </div>
        </div>

        <button
          id="celebration-keep-going-btn"
          onClick={onClose}
          className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          ¡Genial, continuar! 🚀
        </button>

        <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
          <span>¡Gran trabajo en familia!</span>
        </div>
      </div>
    </div>
  );
};
