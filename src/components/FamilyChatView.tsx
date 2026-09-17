import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Camera, 
  Pin, 
  Trash2, 
  X, 
  Clock, 
  CornerDownRight, 
  Sparkles, 
  Image as ImageIcon, 
  Share2, 
  Users, 
  Wifi,
  ChevronDown,
  Check,
  Maximize2
} from 'lucide-react';
import { FamilyChatMessage, FamilyUserId } from '../types';
import { soundFX } from '../utils/audio';
import { FAMILY_USERS } from '../utils/familyUsers';
import { OnlineUser } from '../utils/realtimeChat';
import { compressImage } from '../utils/imageCompressor';

interface FamilyChatViewProps {
  messages: FamilyChatMessage[];
  onSendMessage: (message: FamilyChatMessage) => void;
  onDeleteMessage: (id: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onMamaApproveNotice?: (messageId: string, comment?: string) => void;
  activeUser?: FamilyUserId;
  onSwitchUser?: (userId: FamilyUserId) => void;
  onlineUsers?: OnlineUser[];
  onOpenConnectModal?: () => void;
  deviceView?: 'mobile' | 'tablet';
}

type ChatSender = 'Mamá' | 'Papá' | 'Regina' | 'Romina' | 'Nan';

const QUICK_NOTICES: Record<ChatSender, string[]> = {
  Romina: [
    '¡Ya terminé de hacer mi tarea escolar! 📚✏️',
    '¡Ya saqué a pasear a Luna al parque! 🐶🌸',
    '¡Ya practiqué mi lección de piano! 🎹✨',
    '¡Ya me lavé la cara, dientes y tengo la pijama! 🌙🧼',
    '¡Mi cuarto está recogido y sin ropa tirada! 🛏️',
  ],
  Regina: [
    '¡Ya hice toda mi tarea escolar y guardé mi mochila! 📚✏️',
    '¡Tengo listo mi leotardo y mochila de gimnasia! 🤸‍♀️💜',
    '¡Ya completé mi racha de Duolingo de hoy! 🦉✨',
    '¡Ya saqué a Luna y le puse su agua fresca! 🐶🐕',
    '¡Ya me lavé la cara, dientes y estoy en pijama! 🌙🧼',
  ],
  Nan: [
    '🚨 ¡Revisión sorpresa de cuartos y mochilas en 15 minutos! 👮‍♀️',
    '🐶 Chicas, hora de sacar a Luna y cambiarle el agua.',
    '⚠️ Recuerden: si hay ropa tirada en el piso, multa de $5 pesos.',
    '👏 ¡Excelente orden y tareas hechas a tiempo hoy!',
  ],
  Mamá: [
    '¡Muchas gracias mis amores, estoy muy orgullosa de ustedes! 💖',
    '¡Excelente trabajo chicas! Las amo con todo mi corazón 🌸',
    '¡Recuerden dejar su tarea lista y lavarse la cara! 🌙🧼',
    '¡Hoy cenamos rico juntos al rato! 💕',
  ],
  Papá: [
    '¡Gran trabajo hoy campeonas! Las veo al rato para cenar juntos 👨‍👩‍👧‍👧',
    '¡Mucho éxito en su tarea, gimnasia y piano! 🎉',
    '¡Excelente esfuerzo el de hoy, las quiero mucho! 👔',
  ],
};

export const FamilyChatView: React.FC<FamilyChatViewProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onAddReaction,
  onMamaApproveNotice,
  activeUser = 'mama',
  onSwitchUser,
  onlineUsers = [],
  onOpenConnectModal,
  deviceView = 'mobile',
}) => {
  // Map active user to sender
  const defaultSender: ChatSender = 
    activeUser === 'mama' ? 'Mamá' :
    activeUser === 'papa' ? 'Papá' :
    activeUser === 'nan' || activeUser === 'nana' ? 'Nan' :
    activeUser === 'regina' ? 'Regina' : 'Romina';

  const [currentSender, setCurrentSender] = useState<ChatSender>(defaultSender);
  const [inputText, setInputText] = useState('');
  const [isNoticeToMama, setIsNoticeToMama] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'notices' | 'photos'>('all');
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  
  // Replying context
  const [replyingTo, setReplyingTo] = useState<{ id: string; sender: string; text: string } | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCurrentSender(defaultSender);
  }, [defaultSender]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageDataUrl) return;

    const roleMap: Record<ChatSender, FamilyChatMessage['senderRole']> = {
      Mamá: 'mama',
      Papá: 'papa',
      Nan: 'policia_nan',
      Regina: 'regina',
      Romina: 'romina',
    };

    const newMsg: FamilyChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: currentSender,
      senderRole: roleMap[currentSender],
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isNoticeToMama: isNoticeToMama,
      imageDataUrl: imageDataUrl || undefined,
      replyTo: replyingTo || undefined,
    };

    onSendMessage(newMsg);
    setInputText('');
    setImageDataUrl('');
    setReplyingTo(null);
    setIsNoticeToMama(false);
    soundFX.playPop();
  };

  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    try {
      // Compress iPhone/iPad photo so it sends instantly in realtime
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      setImageDataUrl(compressed.dataUrl);
      soundFX.playChime();
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageDataUrl(event.target?.result as string);
        soundFX.playChime();
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const startReply = (msg: FamilyChatMessage) => {
    setReplyingTo({
      id: msg.id,
      sender: msg.sender,
      text: msg.text.length > 70 ? msg.text.slice(0, 70) + '...' : msg.text,
    });
    inputRef.current?.focus();
    soundFX.playPop();
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'notices') return m.isNoticeToMama;
    if (activeFilter === 'photos') return !!m.imageDataUrl;
    return true;
  });

  const noticesCount = messages.filter((m) => m.isNoticeToMama).length;
  const photosCount = messages.filter((m) => !!m.imageDataUrl).length;

  const isMobile = deviceView === 'mobile';

  return (
    <div className={`w-full mx-auto space-y-2.5 sm:space-y-4 animate-in fade-in duration-200 ${isMobile ? 'max-w-md px-1' : 'max-w-4xl pb-10'}`}>
      {/* 1. Header Banner - Optimized for mobile view */}
      {isMobile ? (
        // SLIM COMPACT MOBILE HEADER
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 rounded-2xl p-3 text-white shadow-md border border-pink-300/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shrink-0">
                💬
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight font-['Fredoka',sans-serif] truncate">
                  Chat Familiar en Vivo
                </h1>
                <p className="text-[10px] text-pink-100 font-medium truncate">
                  Regina, Romina, Mamá, Papá y Nan
                </p>
              </div>
            </div>

            {/* Firestore Live Indicator Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>En vivo</span>
              </span>
              {onOpenConnectModal && (
                <button
                  onClick={onOpenConnectModal}
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Conectar iPads"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // TABLET/DESKTOP HEADER BANNER
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-pink-300/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                💬
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Avisos &amp; Chat Familiar
                  </h1>
                  <span className="bg-white/20 backdrop-blur-md text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                    Escritura Libre
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-pink-100 font-medium mt-0.5">
                  Comunicación directa entre Mamá, Papá, Regina, Romina y Nan 🌸
                </p>
              </div>
            </div>

            {/* Quick Active User Switcher */}
            {onSwitchUser && (
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center gap-1.5 border border-white/25">
                <span className="text-[11px] font-bold text-pink-100 px-2">Perfil en este cel:</span>
                <div className="flex items-center gap-1">
                  {FAMILY_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        soundFX.playPop();
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                        activeUser === u.id
                          ? 'bg-white text-slate-900 shadow-sm scale-110 font-bold ring-2 ring-pink-300'
                          : 'bg-white/10 hover:bg-white/30 text-white'
                      }`}
                      title={`Cambiar a ${u.name}`}
                    >
                      {u.avatarEmoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-2 text-xs text-pink-100 font-medium flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/30 text-white font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-300/40">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                <span>🔥 Firebase Firestore en tiempo real</span>
              </span>
              <span className="text-white font-semibold text-xs">
                ⚡ Sincronización instantánea entre todos los dispositivos (iPad, Celular y PC)
              </span>
            </div>
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] text-white">
              Base de datos Firestore activa
            </span>
          </div>
        </div>
      )}

      {/* 2. Filter & Presence Bar - Single clean compact row on mobile */}
      <div className="flex items-center justify-between gap-1.5 bg-white/90 backdrop-blur-xs p-1.5 sm:p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => {
              setActiveFilter('all');
              soundFX.playPop();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({messages.length})
          </button>
          <button
            onClick={() => {
              setActiveFilter('notices');
              soundFX.playPop();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
              activeFilter === 'notices'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-pink-700 hover:bg-pink-50'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Avisos ({noticesCount})</span>
          </button>
          {photosCount > 0 && (
            <button
              onClick={() => {
                setActiveFilter('photos');
                soundFX.playPop();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                activeFilter === 'photos'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Fotos ({photosCount})</span>
            </button>
          )}
        </div>

        {/* Online avatars indicator */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          {onlineUsers && onlineUsers.length > 0 ? (
            <div className="flex items-center -space-x-1">
              {onlineUsers.slice(0, 3).map((u) => (
                <span
                  key={u.userId}
                  className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs shadow-2xs"
                  title={`${u.name} en línea`}
                >
                  {u.avatarEmoji}
                </span>
              ))}
              {onlineUsers.length > 3 && (
                <span className="w-5 h-5 rounded-full bg-slate-200 border border-white text-[9px] font-black flex items-center justify-center text-slate-700">
                  +{onlineUsers.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden min-[360px]:inline">Conectado</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Main Chat Card: Dynamic Mobile Height + Modern Flex Layout */}
      <div className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${
        isMobile ? 'h-[calc(100dvh-220px)] min-h-[460px] max-h-[720px]' : 'h-[550px]'
      }`}>
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-3 bg-slate-50/60 scrollbar-none">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageCircle className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
              <p className="font-bold text-xs sm:text-sm text-slate-600">No hay mensajes todavía</p>
              <p className="text-[11px] max-w-xs mt-1 text-slate-400">
                Escribe un mensaje o aviso para Mamá o para toda la familia.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMama = msg.senderRole === 'mama' || msg.sender === 'Mamá';
              const isOfficer = msg.senderRole === 'policia_nan' || msg.sender === 'Nan';
              const isPapa = msg.senderRole === 'papa' || msg.sender === 'Papá';
              const isRomina = msg.senderRole === 'romina' || msg.sender === 'Romina';

              const roleColors = isOfficer
                ? 'bg-amber-50/95 border-amber-300 text-amber-950'
                : isMama
                ? 'bg-pink-50/95 border-pink-200 text-pink-950'
                : isPapa
                ? 'bg-blue-50/95 border-blue-200 text-blue-950'
                : isRomina
                ? 'bg-rose-50/95 border-rose-200 text-rose-950'
                : 'bg-purple-50/95 border-purple-200 text-purple-950';

              const avatarEmoji = isOfficer ? '👮‍♀️' : isMama ? '👩' : isPapa ? '👨' : isRomina ? '🌸' : '💜';

              return (
                <div key={msg.id} className="flex flex-col space-y-1">
                  {/* Chat Message Card */}
                  <div className={`w-full rounded-2xl p-3 border shadow-2xs transition-all ${roleColors}`}>
                    {/* Quoted reply */}
                    {msg.replyTo && (
                      <div className="mb-2 px-2.5 py-1 rounded-xl bg-black/5 border-l-3 border-pink-500 text-[11px] text-slate-700 flex items-center gap-1.5">
                        <CornerDownRight className="w-3 h-3 text-pink-600 shrink-0" />
                        <span className="font-black text-slate-900">{msg.replyTo.sender}:</span>
                        <span className="truncate italic">"{msg.replyTo.text}"</span>
                      </div>
                    )}

                    {/* Header line: Avatar, Sender Name, Badges, Timestamp */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Avatar Pill */}
                        <div className="w-6 h-6 rounded-lg bg-white/80 border border-black/10 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {avatarEmoji}
                        </div>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {msg.sender}
                        </span>
                        {isOfficer && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0">
                            Policía 🚨
                          </span>
                        )}
                        {msg.isNoticeToMama && (
                          <span className="text-[9px] bg-pink-500 text-white font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0 shadow-2xs">
                            <Pin className="w-2.5 h-2.5" />
                            Aviso
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 shrink-0">
                        <Clock className="w-2.5 h-2.5 opacity-60" />
                        {new Date(msg.timestamp).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Body Text */}
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap break-words pl-0.5">
                      {msg.text}
                    </p>

                    {/* Attached Photo */}
                    {msg.imageDataUrl && (
                      <div 
                        onClick={() => setZoomedPhoto(msg.imageDataUrl || null)}
                        className="mt-2 rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs relative group cursor-pointer"
                      >
                        <img
                          src={msg.imageDataUrl}
                          alt="Foto adjunta"
                          className="max-h-52 w-full object-cover group-hover:opacity-95 transition-opacity"
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white p-1 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                          <Maximize2 className="w-3 h-3" />
                          <span>Ver foto</span>
                        </div>
                      </div>
                    )}

                    {/* Notice Approved by Mama Status Badge */}
                    {msg.isNoticeToMama && msg.reviewedByMama && (
                      <div className="mt-2 p-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{msg.mamaComment || '¡Revisado y aprobado por Mamá! 💕'}</span>
                      </div>
                    )}

                    {/* Action & Reaction Bar - Clean, Compact, Never Broken */}
                    <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between gap-1 flex-wrap text-xs">
                      {/* Emoji Reactions Row */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {['❤️', '👏', '🌟', '👮‍♀️', '😂', '👍'].map((emoji) => {
                          const count = msg.reactions?.[emoji] || 0;
                          return (
                            <button
                              key={emoji}
                              onClick={() => {
                                onAddReaction(msg.id, emoji);
                                soundFX.playPop();
                              }}
                              className={`px-1.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-0.5 transition-all active:scale-90 cursor-pointer ${
                                count > 0
                                  ? 'bg-white border border-slate-300 text-slate-800 shadow-2xs font-bold'
                                  : 'hover:bg-white/60 text-slate-500'
                              }`}
                              title={`Reaccionar con ${emoji}`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] font-black">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Reply & Delete Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* If notice to mama and activeUser is mama, allow approval button */}
                        {msg.isNoticeToMama && !msg.reviewedByMama && (activeUser === 'mama' || currentSender === 'Mamá') && onMamaApproveNotice && (
                          <button
                            onClick={() => {
                              onMamaApproveNotice(msg.id, '¡Aprobado por Mamá! 💕');
                              soundFX.playCelebration();
                            }}
                            className="px-2 py-0.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            ✓ Aprobar
                          </button>
                        )}

                        <button
                          onClick={() => startReply(msg)}
                          className="px-2 py-0.5 rounded-lg hover:bg-white/80 text-slate-600 text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Responder mensaje"
                        >
                          <CornerDownRight className="w-3 h-3 text-slate-500" />
                          <span>Resp</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('¿Deseas eliminar este mensaje?')) {
                              onDeleteMessage(msg.id);
                              soundFX.playPop();
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/80 transition-colors cursor-pointer"
                          title="Borrar mensaje"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* 4. Chat Input Form: Engineered for Mobile Touch and Complete Visibility */}
        <form 
          onSubmit={handleSend} 
          className="shrink-0 bg-white border-t border-slate-200/90 p-2 sm:p-3 space-y-2"
        >
          {/* Active Reply Banner */}
          {replyingTo && (
            <div className="bg-pink-50 border border-pink-200 rounded-xl px-2.5 py-1 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 min-w-0">
                <CornerDownRight className="w-3 h-3 text-pink-600 shrink-0" />
                <span className="font-bold text-pink-900 shrink-0">A {replyingTo.sender}:</span>
                <span className="text-pink-700 truncate italic">"{replyingTo.text}"</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-pink-500 hover:text-rose-700 p-0.5 shrink-0"
                title="Cancelar respuesta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Options Line: Notice to Mama Toggle + Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
            {/* Aviso a Mamá Toggle Pill (Clean & Touch-friendly) */}
            <button
              type="button"
              onClick={() => {
                setIsNoticeToMama(!isNoticeToMama);
                soundFX.playPop();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                isNoticeToMama
                  ? 'bg-pink-600 text-white shadow-xs scale-102 ring-1 ring-pink-400'
                  : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200'
              }`}
            >
              <Pin className={`w-3 h-3 ${isNoticeToMama ? 'text-white' : 'text-pink-600'}`} />
              <span>{isNoticeToMama ? '📌 Aviso a Mamá ACTIVADO' : '📌 Aviso a Mamá'}</span>
            </button>

            {/* Photo attached indicator chip */}
            {imageDataUrl && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-xl text-[11px] font-bold shrink-0">
                <span>📸 Foto lista</span>
                <button
                  type="button"
                  onClick={() => setImageDataUrl('')}
                  className="hover:text-rose-600 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick shortcuts pills for the current sender */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Atajos:
            </span>
            {QUICK_NOTICES[currentSender]?.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(phrase);
                  soundFX.playPop();
                }}
                className="text-[11px] bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-900 border border-slate-200/90 px-2.5 py-0.5 rounded-xl shrink-0 whitespace-nowrap transition-colors cursor-pointer"
              >
                {phrase.length > 28 ? phrase.slice(0, 28) + '...' : phrase}
              </button>
            ))}
          </div>

          {/* MAIN INPUT ROW: Sender + Camera + Input + Send Button */}
          {/* Note: flex container with min-w-0 on input guarantees Send button NEVER disappears off screen! */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sender Selector Dropdown */}
            <div className="relative shrink-0">
              <select
                value={currentSender}
                onChange={(e) => {
                  const s = e.target.value as ChatSender;
                  setCurrentSender(s);
                  soundFX.playPop();
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl pl-2 pr-6 py-2 sm:py-2.5 text-xs font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500 cursor-pointer shadow-2xs"
                title="Cambiar quién escribe"
              >
                <option value="Romina">🌸 Romi</option>
                <option value="Regina">💜 Regi</option>
                <option value="Mamá">👩 Mamá</option>
                <option value="Papá">👨 Papá</option>
                <option value="Nan">👮‍♀️ Nan</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Camera Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressingPhoto}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                imageDataUrl
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
              }`}
              title="Adjuntar foto de evidencia o aviso"
            >
              <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Text Input Field: Strict min-w-0 to prevent horizontal overflow! */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe como ${currentSender}...`}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all shadow-inner"
            />

            {/* Send Button: Always visible, shrink-0, perfectly proportioned */}
            <button
              type="submit"
              disabled={!inputText.trim() && !imageDataUrl}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-pink-500/25 active:scale-95 transition-all cursor-pointer"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Zoomed Photo Modal */}
      {zoomedPhoto && (
        <div 
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="p-3 bg-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold">Foto Familiar</span>
              <button 
                onClick={() => setZoomedPhoto(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={zoomedPhoto} 
              alt="Foto ampliada" 
              className="w-full max-h-[75vh] object-contain bg-black" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
