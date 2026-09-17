import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  AlertCircle, 
  Smartphone, 
  Tablet, 
  Wifi, 
  Users 
} from 'lucide-react';
import { FAMILY_USERS, generateUserDirectLink } from '../utils/familyUsers';
import { soundFX } from '../utils/audio';

interface FamilyDeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline?: boolean;
}

export const FamilyDeviceConnectModal: React.FC<FamilyDeviceConnectModalProps> = ({
  isOpen,
  onClose,
  isOnline = true,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFX.playChime();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (name: string, link: string) => {
    const message = encodeURIComponent(
      `¡Hola ${name}! 🌸 Entra a nuestra app familiar para revisar tus rutinas, ganar estrellitas y chatear todas juntas:\n\n${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-3.5 sm:p-4 shadow-2xl border border-pink-100 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-lg text-white shadow-xs shrink-0">
            📲
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-tight">
              Conectar Dispositivos Familiares
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Abre el enlace en los iPads de Regina y Romina o en tu cel
            </p>
          </div>
        </div>

        {/* Compact 3-Step Guide (3 Columns on sm+) */}
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border border-pink-200/80 rounded-2xl p-2 mb-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-700">
          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              1
            </span>
            <div className="leading-tight">
              <strong className="text-slate-900">Activar Share:</strong> Haz clic en <em>"Share"</em> arriba para que esté público.
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              2
            </span>
            <div className="leading-tight">
              <strong className="text-slate-900">Mismo Link:</strong> Abrir el link público en iPads y celulares.
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
              3
            </span>
            <div className="leading-tight">
              <strong className="text-slate-900">Links Directos:</strong> Copia abajo el de cada una para entrar con su perfil.
            </div>
          </div>
        </div>

        {/* Personalized Links in 2-Column Grid */}
        <div className="mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {FAMILY_USERS.map((user) => {
              const directLink = generateUserDirectLink(user.id);
              const isCopied = copiedId === user.id;

              return (
                <div
                  key={user.id}
                  className="p-1.5 sm:p-2 rounded-xl border border-slate-200 hover:border-pink-300 bg-white transition-all flex items-center justify-between gap-1.5 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                      {user.avatarEmoji}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {user.badge}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShareWhatsApp(user.name, directLink)}
                      className="px-1.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                      title="Enviar por WhatsApp"
                    >
                      💬
                    </button>

                    <button
                      onClick={() => handleCopy(user.id, directLink)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Listo!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Reassurance Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Sincronización familiar activa</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
