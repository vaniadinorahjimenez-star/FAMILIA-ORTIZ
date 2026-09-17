import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, Sparkles, ArrowLeft, X, ShieldCheck } from 'lucide-react';
import { FAMILY_USERS } from '../utils/familyUsers';
import { FamilyUserId, FamilyUserProfile } from '../types';
import { verifyFamilyUserPassword, setUserSessionAuthenticated } from '../utils/familyAuth';
import { soundFX } from '../utils/audio';

interface DeviceProfileModalProps {
  isOpen: boolean;
  targetUser?: FamilyUserId | null;
  allowClose?: boolean;
  onSuccess: (userId: FamilyUserId) => void;
  onClose?: () => void;
}

export const DeviceProfileModal: React.FC<DeviceProfileModalProps> = ({
  isOpen,
  targetUser: initialTargetUser,
  allowClose = false,
  onSuccess,
  onClose,
}) => {
  const [selectedUser, setSelectedUser] = useState<FamilyUserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial target user when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setShowPassword(false);

      if (initialTargetUser) {
        const found = FAMILY_USERS.find((u) => u.id === initialTargetUser);
        if (found) {
          setSelectedUser(found);
          setTimeout(() => inputRef.current?.focus(), 150);
          return;
        }
      }
      setSelectedUser(null);
    }
  }, [isOpen, initialTargetUser]);

  if (!isOpen) return null;

  const handleSelectUser = (user: FamilyUserProfile) => {
    setSelectedUser(user);
    setPassword('');
    setErrorMessage(null);
    setShowPassword(false);
    soundFX.playPop();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setPassword('');
    setErrorMessage(null);
    soundFX.playPop();
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const isValid = verifyFamilyUserPassword(selectedUser.id, password);

    if (isValid) {
      soundFX.playFanfare();
      setUserSessionAuthenticated(selectedUser.id);
      setErrorMessage(null);
      setIsSubmitting(false);
      onSuccess(selectedUser.id);
    } else {
      soundFX.playPop();
      setIsSubmitting(false);
      setErrorMessage('Contraseña incorrecta. Intenta nuevamente.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200"
      onClick={() => {
        if (allowClose && onClose) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-pink-100 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Close Button if user is already authenticated */}
        {allowClose && onClose && (
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cancelar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 1: USER SELECTION */}
        {!selectedUser ? (
          <div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide mb-2 border border-pink-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Acceso Familiar Protegido</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                ¿Quién está ingresando?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Selecciona tu perfil para ingresar con tu contraseña personal.
              </p>
            </div>

            {/* Profile Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FAMILY_USERS.map((user, idx) => {
                const isLastOdd = idx === FAMILY_USERS.length - 1 && FAMILY_USERS.length % 2 !== 0;
                return (
                  <button
                    key={user.id}
                    id={`select-profile-${user.id}`}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all group active:scale-[0.98] text-left shadow-2xs hover:shadow-xs cursor-pointer ${
                      isLastOdd ? 'sm:col-span-2 sm:max-w-[240px] sm:mx-auto w-full' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        {user.avatarEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {user.badge}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-pink-600 bg-pink-100/70 p-1.5 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition-all shrink-0 ml-1">
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cada miembro tiene su contraseña de acceso personal</span>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: PASSWORD ENTRY FOR SELECTED USER */
          <div>
            {/* Header with Back button */}
            <div className="flex items-center justify-between mb-3">
              <button
                id="back-to-profiles-btn"
                onClick={handleBackToUsers}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Elegir otro usuario</span>
              </button>

              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Seguridad
              </span>
            </div>

            {/* Selected User Badge */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mx-auto shadow-inner border border-slate-200 mb-2">
                {selectedUser.avatarEmoji}
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ¡Hola, {selectedUser.name}! 👋
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa tu contraseña para acceder a la aplicación
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label 
                  htmlFor="family-user-password-input" 
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Contraseña de {selectedUser.name}
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    ref={inputRef}
                    id="family-user-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl border text-sm font-medium transition-all outline-none ${
                      errorMessage 
                        ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' 
                        : 'border-slate-200 bg-slate-50/50 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100'
                    }`}
                  />

                  <button
                    type="button"
                    id="toggle-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1.5 animate-in fade-in">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="submit-auth-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Acceder a la página</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
