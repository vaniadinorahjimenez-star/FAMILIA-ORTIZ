import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  Check, 
  Copy, 
  Share2, 
  Download, 
  Upload, 
  Users, 
  ShieldCheck, 
  X,
  Smartphone
} from 'lucide-react';
import { FAMILY_USERS } from '../utils/familyUsers';
import { 
  getStoredRoomId, 
  saveStoredRoomId, 
  generateShareableRoomLink 
} from '../utils/cloudSync';
import { soundFX } from '../utils/audio';

interface FamilySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onManualSync: () => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  activeUser: string;
}

export const FamilySyncModal: React.FC<FamilySyncModalProps> = ({
  isOpen,
  onClose,
  isSyncing,
  lastSyncTime,
  onManualSync,
  onExportBackup,
  onImportBackup,
  activeUser,
}) => {
  const [roomId, setRoomId] = useState(() => getStoredRoomId());
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const link = generateShareableRoomLink(roomId);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    soundFX.playChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    soundFX.playPop();
    setTimeout(() => setCopiedRoom(false), 2500);
  };

  const handleSaveRoom = (newId: string) => {
    setRoomId(newId);
    saveStoredRoomId(newId);
  };

  const handleTriggerSync = async () => {
    setSyncFeedback('Sincronizando con la nube...');
    try {
      await onManualSync();
      setSyncFeedback('¡Sincronización exitosa!');
      soundFX.playFanfare();
    } catch {
      setSyncFeedback('Hubo un detalle al conectar, reintentando...');
    }
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      soundFX.playChime();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Sincronización Familiar ☁️
              </h2>
              <p className="text-[11px] text-emerald-100">
                5 Miembros Conectados en Tiempo Real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - 2 Columns on iPad / landscape */}
        <div className="p-3.5 sm:p-4 space-y-2.5 text-slate-800 flex-1 overflow-y-auto">
          {/* Status Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5 leading-tight">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Sincronización activa
                </div>
                {lastSyncTime && (
                  <p className="text-[10px] text-emerald-700">
                    Última: {new Date(lastSyncTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer ${
                isSyncing 
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          {syncFeedback && (
            <div className="text-xs font-bold text-center py-1.5 px-3 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 animate-in fade-in">
              {syncFeedback}
            </div>
          )}

          {/* 5 Family Members Status */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Familia Conectada (5 Miembros)
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {FAMILY_USERS.map((user) => {
                const isCurrent = activeUser === user.id;
                return (
                  <div
                    key={user.id}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      isCurrent 
                        ? 'bg-emerald-100/70 border-emerald-400 ring-1 ring-emerald-500/20 shadow-2xs' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-lg leading-none mb-0.5">{user.avatarEmoji}</div>
                    <div className="font-bold text-[11px] text-slate-800 truncate">{user.name}</div>
                    <div className="text-[9px] text-slate-500 truncate">
                      {isCurrent ? '📱 Activo' : '🟢 En línea'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room ID & Sharing in 2 columns on iPad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Código de Sala Familiar
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => handleSaveRoom(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="FAMILIA-REGINA-ROMINA"
                />
                <button
                  onClick={handleCopyRoom}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  title="Copiar código de sala"
                >
                  {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRoom ? '¡Listo!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Compartir Enlace
              </label>
              <button
                onClick={handleCopyLink}
                className="w-full px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copiar Enlace para Celulares</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup & Restore in 1 compact row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Respaldos:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportBackup}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-sky-600" />
                <span>Exportar</span>
              </button>

              <label className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3 text-emerald-600" />
                <span>Importar</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
