import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Bell, 
  BellRing,
  X, 
  Smile, 
  Dog, 
  Sun,
  Coffee
} from 'lucide-react';
import { 
  MamaDailyMessage, 
  getMamaDailyMessage, 
  markMamaDailyReminderAsSeenToday, 
  requestBrowserNotificationPermission,
  sendMamaBrowserNotification 
} from '../utils/dailyReminder';
import { soundFX } from '../utils/audio';

interface MamaDailyLoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToTasks?: () => void;
  isManualOpen?: boolean;
}

export const MamaDailyLoveModal: React.FC<MamaDailyLoveModalProps> = ({
  isOpen,
  onClose,
  onGoToTasks,
  isManualOpen = false,
}) => {
  const [msg, setMsg] = useState<MamaDailyMessage>(getMamaDailyMessage());
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [isLovedAnimating, setIsLovedAnimating] = useState(false);

  useEffect(() => {
    setMsg(getMamaDailyMessage());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    markMamaDailyReminderAsSeenToday();
    soundFX.playPop();
    onClose();
  };

  const handleLoveClick = () => {
    setIsLovedAnimating(true);
    soundFX.playCelebration();
    markMamaDailyReminderAsSeenToday();
    setTimeout(() => {
      setIsLovedAnimating(false);
      onClose();
    }, 1200);
  };

  const handleGoTasksClick = () => {
    markMamaDailyReminderAsSeenToday();
    soundFX.playPop();
    onClose();
    if (onGoToTasks) {
      onGoToTasks();
    }
  };

  const handleEnablePush = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res !== 'unsupported') {
      setNotificationPermission(res);
      if (res === 'granted') {
        soundFX.playCelebration();
        sendMamaBrowserNotification(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="mama-daily-love-card"
        className="relative w-full max-w-md bg-gradient-to-b from-rose-50 via-white to-amber-50 rounded-3xl shadow-2xl border-2 border-rose-200 p-3.5 sm:p-4 text-center overflow-hidden"
      >
        {/* Close icon */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-rose-100/60 rounded-full transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compact Top Header with Avatar & Title */}
        <div className="flex items-center gap-2.5 text-left mb-2 pr-7">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center text-xl text-white shadow-xs shrink-0">
            👩‍👧‍👧
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.2 rounded-full">
              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              <span>Recordatorio de Mamá · 1 al día</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Fredoka',sans-serif] leading-tight mt-0.5 truncate">
              {msg.title}
            </h2>
          </div>
        </div>

        {/* Weekend vs School Day Banner */}
        <div className="mb-2">
          {msg.isWeekend ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-950 text-[11px] sm:text-xs font-black shadow-2xs">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Sábado y Domingo: ¡Sin tareas de la escuela! 🎉</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 border border-amber-300 rounded-xl text-amber-950 text-[11px] sm:text-xs font-black shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Día escolar: ¡A cumplir tareas con concentración! 📚</span>
            </div>
          )}
        </div>

        {/* Loving Message & Highlights in compact card */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border border-rose-100 shadow-2xs text-left mb-2.5">
          <p className="text-xs sm:text-sm text-slate-700 leading-snug font-medium mb-2">
            {msg.body}
          </p>

          <div className="border-t border-rose-100 pt-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Misiones de hoy:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
              {msg.checklistHighlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="font-semibold truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser notification permission banner if needed */}
        {typeof window !== 'undefined' && 'Notification' in window && notificationPermission !== 'granted' && (
          <div className="mb-2 p-1.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-left gap-2">
            <span className="text-[10px] text-purple-900 font-medium truncate flex items-center gap-1">
              <Bell className="w-3 h-3 text-purple-600 shrink-0" />
              ¿Recibir en tu pantalla?
            </span>
            <button
              onClick={handleEnablePush}
              className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-2 py-0.5 rounded-lg shrink-0 cursor-pointer"
            >
              Activar
            </button>
          </div>
        )}

        {/* Compact Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="mama-modal-love-btn"
            onClick={handleLoveClick}
            disabled={isLovedAnimating}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 fill-white text-white ${isLovedAnimating ? 'animate-ping' : ''}`} />
            <span>{isLovedAnimating ? '¡Amor enviado! 💕' : '¡Te amamos Mamá! 💕'}</span>
          </button>

          <button
            id="mama-modal-gotasks-btn"
            onClick={handleGoTasksClick}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mis misiones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
