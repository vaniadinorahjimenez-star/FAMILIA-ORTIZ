import React, { useState } from 'react';
import { 
  CalendarDays, 
  MessageCircle, 
  Camera, 
  ShieldAlert, 
  MoreHorizontal, 
  CalendarRange, 
  Coins, 
  Sparkles, 
  Pin, 
  Heart, 
  Cloud, 
  X,
  Tablet,
  Smartphone
} from 'lucide-react';
import { ActiveTab } from './Header';
import { soundFX } from '../utils/audio';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeFinesCount?: number;
  onOpenMamaLoveReminder?: () => void;
  onOpenSyncModal?: () => void;
  onToggleDeviceView: (mode: 'mobile' | 'tablet') => void;
  deviceView: 'mobile' | 'tablet';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeFinesCount = 0,
  onOpenMamaLoveReminder,
  onOpenSyncModal,
  onToggleDeviceView,
  deviceView,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    setShowMoreMenu(false);
    soundFX.playPop();
  };

  const isMoreActive = 
    activeTab === 'monthly' || 
    activeTab === 'rewards' || 
    activeTab === 'bonuses' || 
    activeTab === 'notes';

  return (
    <>
      {/* Quick Action Bottom Sheet / More Menu */}
      {showMoreMenu && (
        <div 
          onClick={() => setShowMoreMenu(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl p-4 sm:p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200 pb-safe"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-['Fredoka',sans-serif]">
                  Otras Secciones &amp; Ajustes
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Menú Celular
                </span>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {/* Mes Completo */}
              <button
                onClick={() => handleSelectTab('monthly')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Mes Completo</div>
                  <div className="text-[10px] text-slate-500 truncate">Vista mensual</div>
                </div>
              </button>

              {/* Puntos & Recompensas */}
              <button
                onClick={() => handleSelectTab('rewards')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Puntos &amp; Dinero</div>
                  <div className="text-[10px] text-slate-500 truncate">$100 semanales</div>
                </div>
              </button>

              {/* Bonos Sin Pantalla */}
              <button
                onClick={() => handleSelectTab('bonuses')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activeTab === 'bonuses'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Bonos y Ruleta</div>
                  <div className="text-[10px] text-slate-500 truncate">Premios sin pantalla</div>
                </div>
              </button>

              {/* Pizarrón de Notas */}
              <button
                onClick={() => handleSelectTab('notes')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activeTab === 'notes'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Pin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Pizarrón Familiar</div>
                  <div className="text-[10px] text-slate-500 truncate">Post-its y notas</div>
                </div>
              </button>
            </div>

            {/* Quick Action Tools */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {onOpenMamaLoveReminder && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenMamaLoveReminder();
                  }}
                  className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>💌 Recordatorio Diario con Amor de Mamá</span>
                  </span>
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-md font-bold">
                    Abrir
                  </span>
                </button>
              )}

              {onOpenSyncModal && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSyncModal();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    <span>☁️ Estado de Sincronización Nube / Respaldo</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Configurar</span>
                </button>
              )}

              {/* Device Mode Switcher */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Tablet className="w-4 h-4 text-amber-600" />
                  <span>¿Prefieres la vista de tablet?</span>
                </div>
                <button
                  onClick={() => {
                    onToggleDeviceView('tablet');
                    setShowMoreMenu(false);
                    soundFX.playPop();
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Ver modo Tablet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 flex items-center justify-around max-w-lg mx-auto sm:max-w-xl pb-safe"
      >
        {/* 1. Día / Hoy */}
        <button
          onClick={() => handleSelectTab('daily')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            activeTab === 'daily'
              ? 'text-amber-800 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'daily' ? 'bg-amber-100 scale-110' : ''}`}>
            <CalendarDays className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] leading-tight">Hoy</span>
        </button>

        {/* 2. Chat Familiar */}
        <button
          onClick={() => handleSelectTab('chat')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all relative ${
            activeTab === 'chat'
              ? 'text-pink-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'chat' ? 'bg-pink-100 scale-110' : ''}`}>
            <MessageCircle className="w-4 h-4 text-pink-600" />
          </div>
          <span className="text-[10px] leading-tight">Chat</span>
        </button>

        {/* 3. Álbum Fotos & Evidencias */}
        <button
          onClick={() => handleSelectTab('photos')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            activeTab === 'photos'
              ? 'text-purple-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'photos' ? 'bg-purple-100 scale-110' : ''}`}>
            <Camera className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[10px] leading-tight">Fotos</span>
        </button>

        {/* 4. Multas Nan */}
        <button
          onClick={() => handleSelectTab('fines')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all relative ${
            activeTab === 'fines'
              ? 'text-rose-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'fines' ? 'bg-rose-100 scale-110' : ''}`}>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            {activeFinesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {activeFinesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">Multas</span>
        </button>

        {/* 5. Más Opciones (Menú rápido) */}
        <button
          onClick={() => {
            setShowMoreMenu(true);
            soundFX.playPop();
          }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            isMoreActive
              ? 'text-indigo-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${isMoreActive ? 'bg-indigo-100 scale-110' : ''}`}>
            <MoreHorizontal className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-[10px] leading-tight">
            {isMoreActive ? (
              activeTab === 'monthly' ? 'Mes' :
              activeTab === 'rewards' ? 'Puntos' :
              activeTab === 'bonuses' ? 'Bonos' : 'Notas'
            ) : 'Más'}
          </span>
        </button>
      </nav>
    </>
  );
};
