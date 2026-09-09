import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCw, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import { ScreenFreeBonus, ChildId } from '../types';
import { SCREEN_FREE_BONUSES } from '../utils/scheduleGenerator';
import { soundFX } from '../utils/audio';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBonus: (bonus: ScreenFreeBonus, childId: ChildId) => void;
  selectedChild: ChildId;
  onSelectChild: (childId: ChildId) => void;
  hasClaimedToday: (childId: ChildId) => boolean;
}

const WHEEL_COLORS = [
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
];

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  onClaimBonus,
  selectedChild,
  onSelectChild,
  hasClaimedToday,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<ScreenFreeBonus | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Take the first 8 items for a clean, legible wheel
  const wheelItems = SCREEN_FREE_BONUSES.slice(0, 8);
  const segmentAngle = 360 / wheelItems.length;

  const alreadyDoneToday = hasClaimedToday(selectedChild);

  // Draw wheel on canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    wheelItems.forEach((item, index) => {
      const startAngle = ((index * segmentAngle - 90) * Math.PI) / 180;
      const endAngle = (((index + 1) * segmentAngle - 90) * Math.PI) / 180;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Slice label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + ((segmentAngle / 2) * Math.PI) / 180);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Fredoka", sans-serif';

      // Trim title for wheel display
      const shortText = item.title.length > 20 ? item.title.slice(0, 18) + '…' : item.title;
      ctx.fillText(shortText, radius - 18, 4);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
  }, [isOpen, segmentAngle, wheelItems]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedBonus(null);

    // Play tick interval
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundFX.playTick();
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 120);

    // Pick random index
    const randomIndex = Math.floor(Math.random() * wheelItems.length);
    const chosen = wheelItems[randomIndex];

    // Compute final degrees
    // The top pointer points at angle -90deg (or 0 at top).
    // Segment i occupies [i * seg, (i+1) * seg]
    // To land segment randomIndex at top, the wheel must rotate so segment center aligns with top pointer.
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const targetSegmentCenter = randomIndex * segmentAngle + segmentAngle / 2;
    const targetOffset = 360 - targetSegmentCenter;
    const finalDegrees = rotationDegrees + fullSpins * 360 + targetOffset - (rotationDegrees % 360);

    setRotationDegrees(finalDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedBonus(chosen);
      soundFX.playFanfare();
      clearInterval(tickInterval);
    }, 3600);
  };

  const handleClaim = () => {
    if (!selectedBonus || alreadyDoneToday) return;
    onClaimBonus(selectedBonus, selectedChild);
    onClose();
  };

  return (
    <div 
      id="roulette-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div 
        id="roulette-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 text-center relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>¡La Suerte Decide!</span>
        </div>

        <h3 className="text-2xl font-bold font-['Fredoka',sans-serif] text-slate-900 mb-1">
          Ruleta de Bonos Sin Pantallas 🎡
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Gira la ruleta y diviértete con una actividad sorpresa fuera de las pantallas.
        </p>

        {/* Child Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase">¿Quién gira?:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => onSelectChild('romina')}
              disabled={isSpinning}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedChild === 'romina'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌸 Romina (8a)
            </button>
            <button
              onClick={() => onSelectChild('regina')}
              disabled={isSpinning}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedChild === 'regina'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💜 Regina (10a)
            </button>
          </div>
        </div>

        {/* 1 Bonus Daily Notice */}
        {alreadyDoneToday && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>{selectedChild === 'romina' ? 'Romina' : 'Regina'}</strong> ya cumplió su bono de hoy (máx. 1 diario). ¡Puedes girar por diversión o para mañana!
            </span>
          </div>
        )}

        {/* Roulette Wheel Stage */}
        <div className="relative inline-flex items-center justify-center my-2">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-500 drop-shadow-md" />

          {/* Canvas Wheel */}
          <div className="p-2 rounded-full bg-gradient-to-tr from-amber-200 via-yellow-100 to-rose-200 shadow-xl border-4 border-white">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-full transition-transform duration-[3500ms] cubic-bezier(0.15, 0.95, 0.35, 1.0)"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.15, 0.95, 0.35, 1.0)',
              }}
            />
          </div>
        </div>

        {/* Spin Button */}
        <div className="mt-4">
          <button
            id="spin-wheel-btn"
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-3 px-6 rounded-2xl font-bold font-['Fredoka',sans-serif] text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? '¡Girando con emoción...!' : '¡Girar la Ruleta de la Suerte! 🎡'}</span>
          </button>
        </div>

        {/* Result Reveal Card */}
        {selectedBonus && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-amber-300 text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                ¡Reto Seleccionado! 🎉
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <Coins className="w-3.5 h-3.5" />
                +${selectedBonus.pesosReward} MXN ({selectedBonus.points} pts)
              </div>
            </div>

            <h4 className="text-base font-bold text-slate-800 leading-snug">
              {selectedBonus.title}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedBonus.description}
            </p>

            <div className="mt-4 pt-3 border-t border-amber-200 flex flex-col sm:flex-row gap-2">
              <button
                id="claim-roulette-bonus-btn"
                onClick={handleClaim}
                disabled={alreadyDoneToday}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow ${
                  alreadyDoneToday
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : selectedChild === 'romina'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {alreadyDoneToday
                    ? 'Límite diario alcanzado hoy'
                    : `¡Acepto el reto para ${selectedChild === 'romina' ? 'Romina' : 'Regina'}!`}
                </span>
              </button>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Girar de nuevo 🔄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
