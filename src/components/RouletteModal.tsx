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
    const radius = width / 2 - 8;

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
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Slice label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + ((segmentAngle / 2) * Math.PI) / 180);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px "Fredoka", sans-serif';

      // Trim title for wheel display
      const shortText = item.title.length > 17 ? item.title.slice(0, 15) + '…' : item.title;
      ctx.fillText(shortText, radius - 12, 4);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
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
    const fullSpins = 5 + Math.floor(Math.random() * 3);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      {/* Fitted single-screen card for iPad & tablets: horizontal 2-col on sm/md */}
      <div 
        id="roulette-modal-card"
        className="w-full max-w-lg md:max-w-2xl bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-3 border-amber-300 relative max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 z-20 cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Compact Header for all screen sizes */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600" />
            ¡La Suerte Decide!
          </span>
          <h3 className="text-base sm:text-lg font-black font-['Fredoka',sans-serif] text-slate-900 truncate">
            Ruleta de Bonos Sin Pantallas 🎡
          </h3>
        </div>

        {/* 2-Column Responsive Body for iPad (fits without any scroll) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Left Column (Wheel + Spin button) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            {/* Roulette Wheel Stage */}
            <div className="relative inline-flex items-center justify-center my-1">
              {/* Top Indicator Arrow */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[18px] border-t-amber-500 drop-shadow-sm" />

              {/* Canvas Wheel */}
              <div className="p-1.5 rounded-full bg-gradient-to-tr from-amber-200 via-yellow-100 to-rose-200 shadow-lg border-2 border-white">
                <canvas
                  ref={canvasRef}
                  width={210}
                  height={210}
                  className="rounded-full transition-transform duration-[3500ms] cubic-bezier(0.15, 0.95, 0.35, 1.0)"
                  style={{
                    transform: `rotate(${rotationDegrees}deg)`,
                    transitionTimingFunction: 'cubic-bezier(0.15, 0.95, 0.35, 1.0)',
                  }}
                />
              </div>
            </div>

            {/* Spin Button */}
            <button
              id="spin-wheel-btn"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full max-w-[240px] mt-2 py-2 px-4 rounded-xl font-bold font-['Fredoka',sans-serif] text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSpinning
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white active:scale-98'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? '¡Girando...!' : '¡Girar la Ruleta! 🎡'}</span>
            </button>
          </div>

          {/* Right Column (Child Selector, Status & Result Card) */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-2 text-left">
            {/* Child Selector */}
            <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                ¿Quién gira?:
              </span>
              <div className="inline-flex gap-1">
                <button
                  onClick={() => onSelectChild('romina')}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChild === 'romina'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌸 Romina
                </button>
                <button
                  onClick={() => onSelectChild('regina')}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChild === 'regina'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💜 Regina
                </button>
              </div>
            </div>

            {/* 1 Bonus Daily Notice */}
            {alreadyDoneToday && (
              <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="leading-tight">
                  <strong>{selectedChild === 'romina' ? 'Romina' : 'Regina'}</strong> ya reclamó su bono de hoy. ¡Gira por diversión!
                </span>
              </div>
            )}

            {/* Result Card or Placeholder */}
            {selectedBonus ? (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-amber-300 animate-in zoom-in-95">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    ¡Premio! 🎉
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-emerald-700">
                    <Coins className="w-3.5 h-3.5" />
                    +${selectedBonus.pesosReward} MXN ({selectedBonus.points} pts)
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 leading-snug">
                  {selectedBonus.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight line-clamp-2">
                  {selectedBonus.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center gap-1.5">
                  <button
                    id="claim-roulette-bonus-btn"
                    onClick={handleClaim}
                    disabled={alreadyDoneToday}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer ${
                      alreadyDoneToday
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : selectedChild === 'romina'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {alreadyDoneToday ? 'Límite alcanzado' : `¡Aceptar para ${selectedChild === 'romina' ? 'Romina' : 'Regina'}!`}
                    </span>
                  </button>

                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                    title="Girar de nuevo"
                  >
                    🔄
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center py-4">
                <p className="text-xs font-bold text-slate-700">
                  ¡Haz clic en "Girar la Ruleta"! 🎯
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Obtén retos de manualidades, dibujo, cartas a Nan o paseos especiales con Luna para sumar pesos a tu meta.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
