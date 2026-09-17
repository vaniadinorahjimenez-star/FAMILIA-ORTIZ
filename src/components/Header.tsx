import React, { useState } from 'react';
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
  MessageCircle,
  Cloud,
  RefreshCw,
  UserCheck,
  ChevronDown,
  WifiOff,
  Wifi,
  Heart,
  Smartphone,
  Tablet,
  Lock
} from 'lucide-react';
import { ChildId, FamilyUserId } from '../types';
import { soundFX } from '../utils/audio';
import { FAMILY_USERS } from '../utils/familyUsers';

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
  activeUser?: FamilyUserId;
  onUserChange?: (user: FamilyUserId) => void;
  isSyncing?: boolean;
  onOpenSyncModal?: () => void;
  lastSyncTime?: string | null;
  isOnline?: boolean;
  pendingChangesCount?: number;
  onOpenMamaLoveReminder?: () => void;
  deviceView?: 'mobile' | 'tablet';
  onToggleDeviceView?: (mode: 'mobile' | 'tablet') => void;
  onLockApp?: () => void;
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
  activeUser = 'mama',
  onUserChange,
  isSyncing = false,
  onOpenSyncModal,
  lastSyncTime,
  isOnline = true,
  pendingChangesCount = 0,
  onOpenMamaLoveReminder,
  deviceView = 'tablet',
  onToggleDeviceView,
  onLockApp,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentUserObj = FAMILY_USERS.find((u) => u.id === activeUser) || FAMILY_USERS[0];
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

  // 1. DEDICATED MOBILE VIEW (Diseñada específicamente para celulares)
  if (deviceView === 'mobile') {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs sticky top-0 z-40">
        <div className="px-3 py-2 space-y-2 max-w-lg mx-auto">
          {/* Row 1: Brand + Quick Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-xs shrink-0">
                <Dog className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-sm text-slate-800 font-['Fredoka',sans-serif] truncate">
                    Regina &amp; Romina
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-300 shrink-0">
                    Luna 🐶
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Rutinas, Gimnasia &amp; Familia
                </p>
              </div>
            </div>

            {/* Right Tools: Mode Switcher, Cloud, Sound, User Profile */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Toggle to Tablet view */}
              {onToggleDeviceView && (
                <button
                  id="mobile-view-toggle-btn"
                  onClick={() => {
                    onToggleDeviceView('tablet');
                    soundFX.playPop();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs cursor-pointer"
                  title="Cambiar a Vista Tablet"
                >
                  <Smartphone className="w-3 h-3 text-amber-700" />
                  <span className="hidden min-[360px]:inline">Celular</span>
                </button>
              )}

              {/* Cloud Sync indicator */}
              {onOpenSyncModal && (
                <button
                  onClick={onOpenSyncModal}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    !isOnline 
                      ? 'bg-amber-50 border-amber-300 text-amber-700' 
                      : isSyncing 
                      ? 'bg-sky-50 border-sky-300 text-sky-700' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                  title={!isOnline ? 'Sin red (Local)' : isSyncing ? 'Sincronizando' : 'Nube conectada'}
                >
                  {!isOnline ? (
                    <WifiOff className="w-3.5 h-3.5" />
                  ) : (
                    <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  )}
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* User Avatar dropdown */}
              {onUserChange && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold shadow-2xs ${currentUserObj.themeBg}`}
                    title="Cambiar usuario"
                  >
                    <span className="text-xs leading-none">{currentUserObj.avatarEmoji}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                        ¿Quién usa este cel?
                      </div>
                      <div className="space-y-1">
                        {FAMILY_USERS.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onUserChange(user.id);
                              setShowUserDropdown(false);
                              soundFX.playPop();
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                              activeUser === user.id
                                ? 'bg-slate-900 text-white'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{user.avatarEmoji}</span>
                            <span className="flex-1 truncate">{user.name}</span>
                            {activeUser === user.id && (
                              <span className="text-[9px] bg-emerald-500 text-white px-1 py-0.2 rounded font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {onLockApp && (
                        <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                          <button
                            id="mobile-lock-app-btn"
                            onClick={() => {
                              setShowUserDropdown(false);
                              onLockApp();
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Lock className="w-3 h-3 text-rose-500" />
                            <span>Bloquear pantalla</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Child Selector Segmented Pills (Thumb-friendly full-width) */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-inner">
            <button
              id="mobile-select-both-btn"
              onClick={() => {
                onChildChange('both');
                soundFX.playPop();
              }}
              className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                selectedChild === 'both'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👨‍👩‍👧‍👧 Ambas
            </button>

            <button
              id="mobile-select-romina-btn"
              onClick={() => {
                onChildChange('romina');
                soundFX.playPop();
              }}
              className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 ${
                selectedChild === 'romina'
                  ? 'bg-rose-500 text-white shadow-xs font-black'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>🌸 Romina</span>
            </button>

            <button
              id="mobile-select-regina-btn"
              onClick={() => {
                onChildChange('regina');
                soundFX.playPop();
              }}
              className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 ${
                selectedChild === 'regina'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>💜 Regina</span>
            </button>
          </div>

          {/* Row 3: Compact Date Switcher on Daily Tab */}
          {activeTab === 'daily' && (
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 flex-1">
                <button
                  onClick={handlePrevDay}
                  className="p-1 rounded-lg text-slate-600 hover:bg-amber-100 border border-slate-200"
                  title="Día anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex-1 text-center py-1 px-1.5 bg-amber-50/80 rounded-lg border border-amber-200 font-bold text-slate-800 text-xs truncate flex items-center justify-center gap-1">
                  <span className="truncate">{capitalizedDate}</span>
                  {isToday() && (
                    <span className="text-[9px] bg-emerald-500 text-white px-1 py-0.2 rounded font-black shrink-0">
                      HOY
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextDay}
                  className="p-1 rounded-lg text-slate-600 hover:bg-amber-100 border border-slate-200"
                  title="Día siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!isToday() && (
                  <button
                    onClick={onResetToday}
                    className="px-1.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-lg border border-amber-300 shrink-0"
                  >
                    Hoy
                  </button>
                )}
              </div>

              <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                🎯 Meta: $100
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // 2. DEDICATED TABLET VIEW (Diseñada para iPad y pantallas medianas/grandes)
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

            {/* Device View Mode Switcher (Tablet -> Mobile) */}
            {onToggleDeviceView && (
              <button
                id="tablet-view-toggle-btn"
                onClick={() => {
                  onToggleDeviceView('mobile');
                  soundFX.playPop();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Cambiar a Vista Celular"
              >
                <Tablet className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Vista Tablet</span>
                <span className="md:hidden">Tablet</span>
              </button>
            )}

            {/* Sound Mute button desktop */}
            <button
              id="sound-toggle-btn-desktop"
              onClick={onToggleSound}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-50/80 transition-colors border border-slate-200/70"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Cloud / Network Sync Button */}
            {onOpenSyncModal && (
              <button
                id="header-network-sync-btn"
                onClick={onOpenSyncModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                  !isOnline
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                    : isSyncing
                    ? 'border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800'
                    : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
                title={
                  !isOnline
                    ? 'Modo sin red (Offline). Los avances se guardan en este dispositivo y se subirán al volver la red.'
                    : isSyncing
                    ? 'Sincronizando tareas en segundo plano...'
                    : 'Conectado a la nube familiar'
                }
              >
                {!isOnline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span className="hidden md:inline">Sin red</span>
                    <span className="md:hidden">Local</span>
                    {pendingChangesCount > 0 ? (
                      <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                        {pendingChangesCount}
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </>
                ) : (
                  <>
                    <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-sky-600 animate-bounce' : 'text-emerald-600'}`} />
                    <span className="hidden md:inline">
                      {isSyncing ? 'Sincronizando...' : 'Nube'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-sky-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                  </>
                )}
              </button>
            )}

            {/* Mama Daily Love Reminder Button */}
            {onOpenMamaLoveReminder && (
              <button
                id="header-mama-love-btn"
                onClick={onOpenMamaLoveReminder}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/90 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                title="💌 Recordatorio Diario con Amor de Mamá (1 al día)"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">Amor de Mamá</span>
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  1 al día
                </span>
              </button>
            )}

            {/* Active Family User Profile Switcher */}
            {onUserChange && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${currentUserObj.themeBg}`}
                  title="Cambiar quién está usando este dispositivo"
                >
                  <span className="text-sm">{currentUserObj.avatarEmoji}</span>
                  <span className="hidden sm:inline font-bold">{currentUserObj.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                      ¿Quién usa este celular?
                    </div>
                    <div className="space-y-1">
                      {FAMILY_USERS.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            onUserChange(user.id);
                            setShowUserDropdown(false);
                            soundFX.playPop();
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                            activeUser === user.id
                              ? 'bg-slate-900 text-white'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-base">{user.avatarEmoji}</span>
                          <div className="flex-1 truncate">
                            <div>{user.name}</div>
                            <div className={`text-[10px] font-normal ${activeUser === user.id ? 'text-slate-300' : 'text-slate-400'}`}>
                              {user.badge}
                            </div>
                          </div>
                          {activeUser === user.id && (
                            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-md">
                              Activo
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {onLockApp && (
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          id="tablet-lock-app-btn"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLockApp();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Bloquear pantalla</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
            <span>Fotos &amp; Recuerdos 📸</span>
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
