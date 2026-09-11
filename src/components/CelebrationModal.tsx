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
        className="relative w-full max-w-[340px] sm:max-w-[360px] max-h-[92vh] flex flex-col p-4 sm:p-5 bg-white rounded-3xl shadow-2xl border-3 border-amber-300 text-center overflow-hidden transform animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="celebration-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Luna French Poodle Centerpiece with Trophy */}
        <div className="flex justify-center items-center gap-2 mb-1">
          <div className="relative">
            <LunaFrenchPoodle size="sm" variant="default" showBark={true} />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs border border-white">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] text-slate-900 leading-tight">
          ¡100% COMPLETADO! 🎉
        </h3>

        <p className="text-sm font-bold text-purple-700 mt-0.5">
          ¡Felicidades, {childName}!
        </p>

        <p className="text-xs text-slate-600 my-2 leading-relaxed">
          Completaste todas tus rutinas de hoy. ¡Luna, Nan, Mamá y Papá están súper orgullosos!
        </p>

        <div className="flex items-center justify-center gap-2.5 p-2.5 mb-3 bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 rounded-2xl border border-amber-200">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400 flex-shrink-0" />
          <div className="text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Puntos acumulados hoy
            </span>
            <span className="text-sm sm:text-base font-black text-amber-800">
              +{pointsEarned} Puntos para tus $100 pesos
            </span>
          </div>
        </div>

        <button
          id="celebration-keep-going-btn"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
        >
          ¡Genial, continuar! 🚀
        </button>

        <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>¡Gran trabajo en familia!</span>
        </div>
      </div>
    </div>
  );
};
