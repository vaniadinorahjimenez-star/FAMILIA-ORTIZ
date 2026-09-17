import React from 'react';
import { Sparkles } from 'lucide-react';
import { FAMILY_USERS } from '../utils/familyUsers';
import { FamilyUserId } from '../types';
import { soundFX } from '../utils/audio';

interface DeviceProfileModalProps {
  isOpen: boolean;
  onSelectUser: (userId: FamilyUserId) => void;
  onClose?: () => void;
}

export const DeviceProfileModal: React.FC<DeviceProfileModalProps> = ({
  isOpen,
  onSelectUser,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-pink-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Decorative Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Perfil Familiar</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            ¿Quién usará este dispositivo?
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Selecciona tu nombre para sincronizar tus mensajes y tareas.
          </p>
        </div>

        {/* Profile Buttons in 2-Column Compact Grid */}
        <div className="grid grid-cols-2 gap-2">
          {FAMILY_USERS.map((user, idx) => {
            const isLastOdd = idx === FAMILY_USERS.length - 1 && FAMILY_USERS.length % 2 !== 0;
            return (
              <button
                key={user.id}
                onClick={() => {
                  soundFX.playFanfare();
                  onSelectUser(user.id);
                }}
                className={`flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/60 transition-all group active:scale-[0.98] text-left shadow-2xs hover:shadow-xs cursor-pointer ${
                  isLastOdd ? 'col-span-2 max-w-[220px] mx-auto w-full' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                    {user.avatarEmoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-pink-600 transition-colors truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.badge}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-pink-600 bg-pink-100/70 px-1.5 py-0.5 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-all shrink-0 ml-1">
                  →
                </span>
              </button>
            );
          })}
        </div>

        {onClose && (
          <div className="mt-2.5 text-center">
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Elegir después
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
