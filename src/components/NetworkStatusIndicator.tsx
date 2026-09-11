import React, { useState } from 'react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  HardDrive, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  CloudUpload
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface NetworkStatusIndicatorProps {
  isOnline: boolean;
  isReconnecting: boolean;
  justReconnected: boolean;
  pendingChangesCount: number;
  onCheckConnection: () => Promise<boolean>;
  onForceSync?: () => Promise<void>;
  onOpenSyncModal?: () => void;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  isOnline,
  isReconnecting,
  justReconnected,
  pendingChangesCount,
  onCheckConnection,
  onForceSync,
  onOpenSyncModal,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const handleManualCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    soundFX.playPop();

    const reachable = await onCheckConnection();
    setIsChecking(false);

    if (reachable) {
      setCheckResult('¡Conexión verificada con éxito!');
      soundFX.playFanfare();
      if (onForceSync) {
        await onForceSync();
      }
    } else {
      setCheckResult('Aún sin conexión a internet. Tus datos siguen seguros localmente.');
      soundFX.playTick();
    }

    setTimeout(() => {
      setCheckResult(null);
    }, 4000);
  };

  // 1. RECONNECTED BANNER (Temporary celebration when connection returns)
  if (isOnline && (justReconnected || isReconnecting)) {
    return (
      <div 
        id="network-reconnected-banner"
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2.5 shadow-md transition-all animate-in slide-in-from-top duration-300 relative z-30"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {isReconnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              )}
            </div>
            <div>
              <span className="font-bold flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-200 animate-pulse" />
                {isReconnecting
                  ? '¡Internet detectado! Sincronizando en segundo plano...'
                  : '¡Conexión a internet restablecida!'}
              </span>
              <p className="text-[11px] text-emerald-100 hidden sm:block">
                Las tareas y rutinas de Regina y Romina se han sincronizado con la nube familiar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSyncModal && (
              <button
                onClick={onOpenSyncModal}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
              >
                Ver nube
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. OFFLINE BANNER (Persistent until back online)
  if (!isOnline) {
    return (
      <aside 
        id="network-offline-banner"
        aria-label="Estado de conexión sin red"
        className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md transition-all relative z-30 border-b border-amber-400/40"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            
            {/* Main Alert Message */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 shadow-inner">
                <WifiOff className="w-4 h-4 text-amber-100 animate-pulse" />
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1">
                    📡 Modo Sin Conexión (Offline)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                    <HardDrive className="w-3 h-3 text-amber-200" />
                    {pendingChangesCount > 0 ? (
                      <span>{pendingChangesCount} {pendingChangesCount === 1 ? 'cambio local' : 'cambios locales'}</span>
                    ) : (
                      <span>Guardado local activo</span>
                    )}
                  </span>
                </div>

                {!isCollapsed && (
                  <p className="text-[11px] sm:text-xs text-amber-100 leading-snug mt-0.5 line-clamp-1 sm:line-clamp-none">
                    ✨ ¡Regina y Romina pueden seguir marcando sus rutinas con normalidad! Todo se guarda seguro en este dispositivo y se subirá automáticamente al volver el internet.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                id="check-network-btn"
                onClick={handleManualCheck}
                disabled={isChecking}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
                title="Comprobar si ya hay conexión con el servidor"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-700' : ''}`} />
                <span className="hidden xs:inline">{isChecking ? 'Probando...' : 'Reintentar'}</span>
              </button>

              <button
                id="toggle-offline-collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 sm:p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                title={isCollapsed ? 'Ver detalles' : 'Ocultar detalles'}
                aria-label={isCollapsed ? 'Ver detalles' : 'Ocultar detalles'}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback message if manual check was performed */}
          {checkResult && (
            <div className="mt-2 text-xs font-semibold px-3 py-1 rounded-xl bg-white/20 text-white backdrop-blur-xs animate-in fade-in flex items-center justify-between">
              <span>{checkResult}</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 3. ONLINE IDLE STATE: Don't render banner when fully online and synced
  return null;
};
