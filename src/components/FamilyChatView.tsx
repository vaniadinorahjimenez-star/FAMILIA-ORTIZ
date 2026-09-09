import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Camera, 
  Sparkles, 
  Pin, 
  UploadCloud, 
  Trash2, 
  Heart, 
  Smile, 
  AlertCircle,
  X,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { FamilyChatMessage } from '../types';
import { soundFX } from '../utils/audio';

interface FamilyChatViewProps {
  messages: FamilyChatMessage[];
  onSendMessage: (message: FamilyChatMessage) => void;
  onDeleteMessage: (id: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
}

type ChatSender = 'Mamá' | 'Papá' | 'Regina' | 'Romina' | 'Nan';

const PARTICIPANTS: { name: ChatSender; role: FamilyChatMessage['senderRole']; avatar: string; color: string; desc: string }[] = [
  { name: 'Mamá', role: 'mama', avatar: '👩', color: 'border-pink-300 bg-pink-50 text-pink-700', desc: 'Mamá' },
  { name: 'Papá', role: 'papa', avatar: '👨', color: 'border-blue-300 bg-blue-50 text-blue-700', desc: 'Papá' },
  { name: 'Regina', role: 'regina', avatar: '💜', color: 'border-purple-300 bg-purple-50 text-purple-700', desc: 'Regina (10a)' },
  { name: 'Romina', role: 'romina', avatar: '🌸', color: 'border-rose-300 bg-rose-50 text-rose-700', desc: 'Romina (8a)' },
  { name: 'Nan', role: 'policia_nan', avatar: '👮‍♀️', color: 'border-amber-400 bg-amber-50 text-amber-900', desc: 'Policía de Multas' },
];

const QUICK_NOTICES: Record<ChatSender, string[]> = {
  Romina: [
    '¡Mamá, ya saqué a pasear a Luna al parque! 🐶🌸',
    '¡Mamá, ya terminé mi lección de piano! 🎹✨',
    '¡Mamá, mi cuarto está limpio y sin ropa tirada! 🛏️',
    '¡Mamá, ya tomé agua y lavé mis dientes! 🪥',
  ],
  Regina: [
    '¡Mamá, tengo listo mi leotardo y mochila para gimnasia! 🤸‍♀️💜',
    '¡Mamá, ya completé mi racha perfecta de Duolingo! 🦉✨',
    '¡Mamá, ya di de comer a Luna y le cambié el agua! 🐶🥣',
    '¡Mamá, ya recogí mi ropa y acomodé mis tenis! 👟',
  ],
  Nan: [
    '🚨 Aviso de Nan: ¡Revisión sorpresa de cuartos y ropa en 15 minutos!',
    '🐶 Aviso de Nan: Chicas, es hora de sacar a Luna a pasear.',
    '⚠️ Aviso de Nan: Si hay ropa tirada en el suelo, habrá multa de $5 pesos.',
    '👏 Aviso de Nan: ¡Excelente orden hoy, cero multas levantadas!',
  ],
  Mamá: [
    '¡Muchas gracias mis amores, estoy muy orgullosa de ustedes! 💖',
    '¡Excelente trabajo chicas! Las amo muchísimo 🌟',
    '¡Recuerden dejar todo listo antes de las 8:30pm para descansar rico! 🌙',
  ],
  Papá: [
    '¡Gran trabajo hoy campeonas! Las veo al rato para cenar juntos 👨‍👩‍👧‍👧',
    '¡Mucho éxito en su gimnasia y piano! 🎉',
  ],
};

export const FamilyChatView: React.FC<FamilyChatViewProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onAddReaction,
}) => {
  const [currentSender, setCurrentSender] = useState<ChatSender>('Romina');
  const [inputText, setInputText] = useState('');
  const [isNoticeToMama, setIsNoticeToMama] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [filterNoticesOnly, setFilterNoticesOnly] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Scroll smoothly to bottom when a new message arrives
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageDataUrl) return;

    const senderObj = PARTICIPANTS.find((p) => p.name === currentSender) || PARTICIPANTS[3];

    const newMsg: FamilyChatMessage = {
      id: `chat-${Date.now()}`,
      sender: currentSender,
      senderRole: senderObj.role,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isNoticeToMama: currentSender !== 'Mamá' ? isNoticeToMama : false,
      imageDataUrl: imageDataUrl || undefined,
      reactions: {},
    };

    onSendMessage(newMsg);
    soundFX.playPop();
    setInputText('');
    setImageDataUrl('');
  };

  const handleQuickNotice = (notice: string) => {
    setInputText(notice);
    setIsNoticeToMama(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUrl(reader.result as string);
        soundFX.playCheck();
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedMessages = filterNoticesOnly
    ? messages.filter((m) => m.isNoticeToMama)
    : messages;

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                Canal Familiar Interactivo
              </span>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Oficial Nan presente 👮‍♀️
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif] flex items-center gap-2">
              <span>Avisos a Mamá & Chat en Familia</span>
              <span>💬</span>
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 mt-1 max-w-xl leading-relaxed">
              Aquí Regina y Romina le avisan a Mamá cuando terminaron de pasear a Luna o sus tareas, Mamá y Papá dejan recados de cariño, y la oficial Nan manda recordatorios para evitar multas.
            </p>
          </div>

          <button
            onClick={() => setFilterNoticesOnly(!filterNoticesOnly)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 self-start sm:self-auto ${
              filterNoticesOnly
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{filterNoticesOnly ? 'Mostrando sólo Avisos a Mamá 📌' : 'Filtrar sólo Avisos a Mamá'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Active Participant Selector Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ¿Quién está escribiendo ahora?
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {PARTICIPANTS.map((p) => {
              const isSelected = currentSender === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setCurrentSender(p.name);
                    soundFX.playPop();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-2 ${
                    isSelected
                      ? `${p.color} shadow-sm scale-105`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{p.avatar}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Notices Carousel for Current Sender */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="font-bold text-slate-500 flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Avisos rápidos de {currentSender}:
          </span>
          {(QUICK_NOTICES[currentSender] || []).map((notice, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickNotice(notice)}
              className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-purple-100 text-slate-700 font-medium rounded-lg border border-purple-200/80 transition-colors shadow-2xs hover:shadow-xs"
            >
              {notice}
            </button>
          ))}
        </div>

        {/* Message History Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {displayedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageCircle className="w-12 h-12 mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No hay mensajes aún</p>
              <p className="text-xs max-w-xs mt-1">
                Escribe un aviso para Mamá o comparte una novedad con la familia.
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isOfficer = msg.senderRole === 'policia_nan';
              const isMama = msg.senderRole === 'mama';
              const isPapa = msg.senderRole === 'papa';
              const isRomina = msg.senderRole === 'romina';
              const isRegina = msg.senderRole === 'regina';

              const roleColors = isOfficer
                ? 'bg-amber-50 border-amber-300 text-slate-900'
                : isMama
                ? 'bg-pink-50 border-pink-200 text-slate-900'
                : isPapa
                ? 'bg-blue-50 border-blue-200 text-slate-900'
                : isRomina
                ? 'bg-rose-50 border-rose-200 text-slate-900'
                : 'bg-purple-50 border-purple-200 text-slate-900';

              const avatarEmoji = isOfficer
                ? '👮‍♀️'
                : isMama
                ? '👩'
                : isPapa
                ? '👨'
                : isRomina
                ? '🌸'
                : '💜';

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
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 border-2 shadow-xs ${roleColors}`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5">
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
                            <span className="text-[10px] bg-pink-500 text-white font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
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
                        <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200">
                          <img
                            src={msg.imageDataUrl}
                            alt="Foto adjunta"
                            className="max-h-60 w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Reaction bar */}
                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-1 flex-wrap">
                          {['❤️', '👏', '🌟', '👮‍♀️', '😂'].map((emoji) => {
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
                                    ? 'bg-white/90 border border-slate-300 text-slate-800 shadow-2xs font-bold'
                                    : 'hover:bg-white/60 text-slate-500'
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span>{count}</span>}
                              </button>
                            );
                          })}
                        </div>

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
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
          {/* Options Row: Notice to Mama toggle and photo preview */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              {currentSender !== 'Mamá' && (
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold select-none">
                  <input
                    type="checkbox"
                    checked={isNoticeToMama}
                    onChange={(e) => setIsNoticeToMama(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                  />
                  <span>📌 Marcar como Aviso a Mamá</span>
                </label>
              )}

              {imageDataUrl && (
                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                  <span>Foto adjunta</span>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl('')}
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              Escribiendo como: <strong className="text-slate-700">{currentSender}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-2xl border transition-colors ${
                imageDataUrl
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
              title="Adjuntar foto de la actividad o comprobante"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe un mensaje o aviso como ${currentSender}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none bg-slate-50/50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !imageDataUrl}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
