import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, X, Star, Heart } from 'lucide-react';
import { soundFX } from '../utils/audio';

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

      // Launch multi-burst celebration confetti
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ec4899', '#8b5cf6', '#eab308'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#06b6d4', '#f97316', '#a855f7'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="celebration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        id="celebration-modal-card"
        className="relative w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-4 border-amber-300 text-center overflow-hidden transform animate-in zoom-in-95 duration-300"
      >
        {/* Background decorative bursts */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-100 rounded-full blur-xl pointer-events-none" />

        <button
          id="celebration-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 rounded-3xl shadow-lg ring-4 ring-amber-100 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-800" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-pulse" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif] text-slate-900 mb-2">
          ¡100% COMPLETADO! 🎉
        </h3>

        <p className="text-lg font-semibold text-purple-700 mb-3">
          ¡Felicidades, {childName}!
        </p>

        <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
          Has completado todas tus rutinas obligatorias del día. Cuidaste a Luna, cumpliste tus metas y sumaste puntos valiosos.
        </p>

        <div className="flex items-center justify-center gap-3 p-4 mb-6 bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 rounded-2xl border border-amber-200/80">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          <div className="text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Puntos acumulados hoy
            </span>
            <span className="text-xl font-extrabold text-amber-700">
              +{pointsEarned} Puntos para tus $100 pesos
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="celebration-keep-going-btn"
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            ¡Genial, continuar! 🚀
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>¡Mamá y Papá están muy orgullosos de ti!</span>
        </div>
      </div>
    </div>
  );
};
