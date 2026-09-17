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
  Wifi
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
    '🚨 Aviso de Nan: ¡Revisión sorpresa de cuartos y mochilas en 15 minutos! 👮‍♀️',
    '🐶 Recordatorio de Nan: Chicas, hora de sacar a Luna y cambiarle el agua.',
    '⚠️ Aviso de Nan: Si hay ropa tirada en el piso, se aplicará multa de $5 pesos.',
    '👏 Felicitación de Nan: ¡Excelente orden y tareas hechas a tiempo hoy!',
  ],
  Mamá: [
    '¡Muchas gracias mis amores, estoy muy orgullosa de ustedes! 💖',
    '¡Excelente trabajo chicas! Las amo con todo mi corazón 🌸',
    '¡Recuerden dejar su tarea lista de 3 a 4 y lavarse la cara antes de dormir! 🌙🧼',
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
  activeUser = 'mama',
  onSwitchUser,
  onlineUsers = [],
  onOpenConnectModal,
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
      id: `chat-${Date.now()}`,
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
      // Compress iPad / camera photo so it sends instantly in realtime
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
      text: msg.text.length > 80 ? msg.text.slice(0, 80) + '...' : msg.text,
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

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-pink-300/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Avisos & Chat Familiar
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

      {/* Live Online Presence & Connect Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>En línea ahora:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onlineUsers && onlineUsers.length > 0 ? (
              onlineUsers.map((u) => (
                <span
                  key={u.userId}
                  className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs"
                >
                  <span className="text-sm leading-none">{u.avatarEmoji}</span>
                  <span>{u.name}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium px-2.5 py-1 rounded-xl">
                <span>👩 Mamá activa</span>
              </span>
            )}
          </div>
        </div>

        {onOpenConnectModal && (
          <button
            onClick={onOpenConnectModal}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Conectar iPads de las niñas</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white/70 backdrop-blur-xs p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({messages.length})
          </button>
          <button
            onClick={() => setActiveFilter('notices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'notices'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-pink-700 hover:bg-pink-50'
            }`}
          >
            <Pin className="w-3 h-3" />
            Solo Avisos ({noticesCount})
          </button>
          {photosCount > 0 && (
            <button
              onClick={() => setActiveFilter('photos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeFilter === 'photos'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              Fotos ({photosCount})
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-semibold px-2">
          Familia Jiménez
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageCircle className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No hay mensajes todavía</p>
              <p className="text-xs max-w-xs mt-1">
                Escribe un mensaje o sube una foto para avisar a Mamá o a toda la familia.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMama = msg.senderRole === 'mama' || msg.sender === 'Mamá';
              const isOfficer = msg.senderRole === 'policia_nan' || msg.sender === 'Nan';
              const isPapa = msg.senderRole === 'papa' || msg.sender === 'Papá';
              const isRomina = msg.senderRole === 'romina' || msg.sender === 'Romina';

              const roleColors = isOfficer
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : isMama
                ? 'bg-pink-50/90 border-pink-200 text-pink-950'
                : isPapa
                ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                : isRomina
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : 'bg-purple-50/90 border-purple-200 text-purple-950';

              const avatarEmoji = isOfficer ? '👮‍♀️' : isMama ? '👩' : isPapa ? '👨' : isRomina ? '🌸' : '💜';

              return (
                <div key={msg.id} className="flex flex-col space-y-1">
                  <div className="flex items-start gap-3">
                    {/* Avatar icon */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs border ${
                        isOfficer
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : isMama
                          ? 'bg-pink-100 text-pink-700 border-pink-300'
                          : isPapa
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : isRomina
                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                          : 'bg-purple-100 text-purple-700 border-purple-300'
                      }`}
                    >
                      {avatarEmoji}
                    </div>

                    {/* Message Card */}
                    <div className={`max-w-[92%] sm:max-w-[80%] rounded-3xl p-4 border-2 shadow-xs flex-1 ${roleColors}`}>
                      {/* Replying quote if present */}
                      {msg.replyTo && (
                        <div className="mb-2 px-3 py-1.5 rounded-xl bg-black/5 border-l-3 border-pink-500 text-xs text-slate-600 flex items-center gap-1.5">
                          <CornerDownRight className="w-3 h-3 text-pink-600 flex-shrink-0" />
                          <span className="font-bold text-slate-800">{msg.replyTo.sender}:</span>
                          <span className="truncate italic">"{msg.replyTo.text}"</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {msg.sender}
                          </span>
                          {isOfficer && (
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                              Policía Nan 🚨
                            </span>
                          )}
                          {msg.isNoticeToMama && (
                            <span className="text-[10px] bg-pink-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <Pin className="w-2.5 h-2.5" />
                              Aviso a Mamá
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.timestamp).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                        {msg.text}
                      </p>

                      {/* Photo if attached */}
                      {msg.imageDataUrl && (
                        <div className="mt-2.5 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                          <img
                            src={msg.imageDataUrl}
                            alt="Foto adjunta"
                            className="max-h-60 w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Reaction and Action Bar */}
                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between gap-2 flex-wrap text-xs">
                        {/* Reactions */}
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
                                className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                  count > 0
                                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-2xs font-bold'
                                    : 'hover:bg-white/60 text-slate-500'
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span>{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Reply button */}
                          <button
                            onClick={() => startReply(msg)}
                            className="px-2 py-1 rounded-lg hover:bg-white/80 text-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Responder a este mensaje"
                          >
                            <CornerDownRight className="w-3 h-3 text-slate-500" />
                            <span>Responder</span>
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (window.confirm('¿Deseas borrar este mensaje?')) {
                                onDeleteMessage(msg.id);
                                soundFX.playPop();
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2.5">
          {/* Active Reply Banner */}
          {replyingTo && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl px-3 py-1.5 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 truncate">
                <CornerDownRight className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
                <span className="font-bold text-pink-900">Respondiendo a {replyingTo.sender}:</span>
                <span className="text-pink-700 truncate italic">"{replyingTo.text}"</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-pink-500 hover:text-rose-700 p-1"
                title="Cancelar respuesta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Options Row: Notice to Mama toggle and photo preview */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold select-none bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-xl border border-pink-200 transition-colors">
                <input
                  type="checkbox"
                  checked={isNoticeToMama}
                  onChange={(e) => setIsNoticeToMama(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded-md border-pink-300 focus:ring-pink-500 cursor-pointer"
                />
                <Pin className="w-3.5 h-3.5 text-pink-600" />
                <span>Marcar como Aviso a Mamá</span>
              </label>

              {/* Quick suggestions pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {QUICK_NOTICES[currentSender]?.slice(0, 2).map((notice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(notice);
                      soundFX.playPop();
                    }}
                    className="hidden sm:inline-block px-2.5 py-1 rounded-xl text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 truncate max-w-[170px] border border-slate-200 transition-colors"
                    title={notice}
                  >
                    {notice}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo preview pill */}
            {imageDataUrl && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs">
                <span>📸 Foto lista</span>
                <button
                  type="button"
                  onClick={() => setImageDataUrl('')}
                  className="hover:text-rose-600 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick shortcuts row for current sender */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Atajos {currentSender}:
            </span>
            {QUICK_NOTICES[currentSender]?.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(phrase);
                  soundFX.playPop();
                }}
                className="text-[11px] bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-900 border border-slate-200 px-2.5 py-0.5 rounded-lg flex-shrink-0 whitespace-nowrap transition-colors"
              >
                {phrase.length > 32 ? phrase.slice(0, 32) + '...' : phrase}
              </button>
            ))}
          </div>

          {/* Input & Sender Controls */}
          <div className="flex items-center gap-2">
            {/* Sender Selector */}
            <select
              value={currentSender}
              onChange={(e) => {
                const s = e.target.value as ChatSender;
                setCurrentSender(s);
              }}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-2xl px-2.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              <option value="Mamá">👩 Mamá</option>
              <option value="Papá">👨 Papá</option>
              <option value="Nan">👮‍♀️ Nan (Policía)</option>
              <option value="Regina">💜 Regina</option>
              <option value="Romina">🌸 Romina</option>
            </select>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Photo button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-2xl border transition-colors flex-shrink-0 ${
                imageDataUrl
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
              }`}
              title="Adjuntar foto de evidencia o aviso"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe libremente como ${currentSender}...`}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:bg-white"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !imageDataUrl}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
