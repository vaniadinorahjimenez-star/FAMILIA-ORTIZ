import React from 'react';
import { 
  CalendarDays, 
  CalendarRange, 
  Coins, 
  Sparkles, 
  HeartHandshake, 
  Volume2, 
  VolumeX, 
  Dog,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  ShieldAlert,
  MessageCircle
} from 'lucide-react';
import { ChildId } from '../types';
import { soundFX } from '../utils/audio';

export type ActiveTab = 
  | 'daily' 
  | 'monthly' 
  | 'rewards' 
  | 'bonuses' 
  | 'photos' 
  | 'fines' 
  | 'chat' 
  | 'notes';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedChild: ChildId | 'both';
  onChildChange: (child: ChildId | 'both') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onResetToday: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeFinesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedChild,
  onChildChange,
  currentDate,
  onDateChange,
  onResetToday,
  soundEnabled,
  onToggleSound,
  activeFinesCount = 0,
}) => {
  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
    soundFX.playPop();
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
    soundFX.playPop();
  };

  const formattedDateTitle = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentDate);

  const capitalizedDate = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm sticky top-0 z-40">
      {/* Top Banner with Brand, Child Filter, Sound */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-amber-200">
                <Dog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-['Fredoka',sans-serif] tracking-wide text-slate-800 flex items-center gap-2">
                  <span>Regina &amp; Romina</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                    Luna 🐶
                  </span>
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Calendario familiar de rutinas, gimnasia &amp; recompensas
                </p>
              </div>
            </div>

            {/* Sound Mute button mobile */}
            <button
              id="sound-toggle-btn-mobile"
              onClick={onToggleSound}
              className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
          </div>

          {/* Child Selector Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
              Viendo:
            </span>

            <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 shadow-inner">
              <button
                id="select-child-both-btn"
                onClick={() => {
                  onChildChange('both');
                  soundFX.playPop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedChild === 'both'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍👩‍👧‍👧 Ambas
              </button>

              <button
                id="select-child-romina-btn"
                onClick={() => {
                  onChildChange('romina');
                  soundFX.playPop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  selectedChild === 'romina'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 font-extrabold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-200" />
                Romina <span className="text-[11px] opacity-80">(8a)</span>
              </button>

              <button
                id="select-child-regina-btn"
                onClick={() => {
                  onChildChange('regina');
                  soundFX.playPop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  selectedChild === 'regina'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 font-extrabold'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-200" />
                Regina <span className="text-[11px] opacity-80">(10a)</span>
              </button>
            </div>

            {/* Sound Mute button desktop */}
            <button
              id="sound-toggle-btn-desktop"
              onClick={onToggleSound}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-50/80 transition-colors border border-slate-200/70"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

        </div>

        {/* Date Navigator (Visible primarily on Daily Tab) */}
        {activeTab === 'daily' && (
          <div className="mt-3 pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                id="prev-day-btn"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-amber-100/60 transition-colors border border-amber-200/60"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="font-['Fredoka',sans-serif]">{capitalizedDate}</span>
                {isToday() && (
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">
                    Hoy
                  </span>
                )}
              </div>

              <button
                id="next-day-btn"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-amber-100/60 transition-colors border border-amber-200/60"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday() && (
                <button
                  id="reset-today-btn"
                  onClick={onResetToday}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg transition-colors ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ir a Hoy
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Meta Semanal: <span className="font-bold text-emerald-700">$100 Pesos</span> por completar rutinas
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-amber-50/50 border-t border-amber-100 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 py-1.5">
          <button
            id="nav-tab-daily-btn"
            onClick={() => {
              onTabChange('daily');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-600" />
            <span>Día a Día</span>
          </button>

          <button
            id="nav-tab-monthly-btn"
            onClick={() => {
              onTabChange('monthly');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'monthly'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-purple-600" />
            <span>Mes Completo</span>
          </button>

          <button
            id="nav-tab-rewards-btn"
            onClick={() => {
              onTabChange('rewards');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Puntos &amp; $100 Pesos</span>
          </button>

          <button
            id="nav-tab-bonuses-btn"
            onClick={() => {
              onTabChange('bonuses');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'bonuses'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Bonos Sin Pantalla 🎡</span>
          </button>

          <button
            id="nav-tab-photos-btn"
            onClick={() => {
              onTabChange('photos');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'photos'
                ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Camera className="w-4 h-4 text-purple-600" />
            <span>Fotos &amp; Evidencias 📸</span>
          </button>

          <button
            id="nav-tab-fines-btn"
            onClick={() => {
              onTabChange('fines');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all relative ${
              activeTab === 'fines'
                ? 'bg-white text-slate-900 shadow-sm border border-amber-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Multas Nan 👮‍♀️</span>
            {activeFinesCount !== undefined && activeFinesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full">
                {activeFinesCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-chat-btn"
            onClick={() => {
              onTabChange('chat');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-pink-900 shadow-sm border border-pink-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-pink-500" />
            <span>Avisos a Mamá 💬</span>
          </button>

          <button
            id="nav-tab-notes-btn"
            onClick={() => {
              onTabChange('notes');
              soundFX.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
            <span>Muro Familiar 💌</span>
          </button>
        </div>
      </div>
    </header>
  );
};
