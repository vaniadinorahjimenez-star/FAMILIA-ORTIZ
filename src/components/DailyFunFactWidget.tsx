import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Dog, 
  Atom, 
  Send, 
  Check, 
  Lightbulb,
  Heart,
  Share2
} from 'lucide-react';
import { soundFX } from '../utils/audio';

export interface FunFactData {
  title: string;
  fact: string;
  category: 'dogs' | 'science';
  didYouKnow: string;
  encouragement: string;
  emoji: string;
  source: 'gemini' | 'curated';
}

interface DailyFunFactWidgetProps {
  currentDate?: Date;
  onShareToChat?: (text: string) => void;
  activeUser?: string;
}

export const DailyFunFactWidget: React.FC<DailyFunFactWidgetProps> = ({
  currentDate = new Date(),
  onShareToChat,
  activeUser,
}) => {
  const [topic, setTopic] = useState<'any' | 'dogs' | 'science'>('any');
  const [funFact, setFunFact] = useState<FunFactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Format date key (YYYY-MM-DD)
  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
  const d = String(currentDate.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;

  // Fetch fact from backend
  const fetchFact = async (chosenTopic: 'any' | 'dogs' | 'science' = topic, forceNew = false) => {
    setIsLoading(true);
    try {
      // Check cache for today if not forced
      const cacheKey = `daily_fun_fact_${dateKey}_${chosenTopic}`;
      if (!forceNew) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.fact) {
              setFunFact(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // parse error, continue
          }
        }
      }

      const res = await fetch(`/api/fun-fact?topic=${chosenTopic}&t=${Date.now()}`);
      if (!res.ok) throw new Error('Error al conectar con la API');
      const data = await res.json();

      if (data && data.fact) {
        setFunFact(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching fun fact:', err);
      // Fallback in case of server unreachable
      if (!funFact) {
        setFunFact({
          title: '¡Super olfato perruno! 🐾👃',
          fact: 'El sentido del olfato de perritas como Luna es hasta 100,000 veces más potente que el de los humanos. ¡Pueden oler una gota en una piscina olímpica!',
          category: 'dogs',
          didYouKnow: 'La nariz de cada perro tiene un dibujo único, igual que tu huella dactilar.',
          encouragement: '¡Romina y Regina, con ese mismo superpoder van a terminar sus tareas hoy!',
          emoji: '🐶',
          source: 'curated',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFact(topic);
  }, [dateKey, topic]);

  // Speech synthesis for Regina and Romina
  const handleToggleSpeech = () => {
    if (!funFact) return;

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const textToRead = `${funFact.title}. ${funFact.fact}. ¿Sabías que? ${funFact.didYouKnow}. ${funFact.encouragement}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95;
    utterance.pitch = 1.1; // friendly, upbeat pitch

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    soundFX.playTick();
  };

  const handleRefresh = () => {
    soundFX.playPop();
    fetchFact(topic, true);
  };

  const handleShare = () => {
    if (!funFact) return;
    soundFX.playFanfare();
    const shareMessage = `💡 *Dato Curioso del Día* ${funFact.emoji}\n*${funFact.title}*\n${funFact.fact}\n\n✨ *¿Sabías que?* ${funFact.didYouKnow}\n💖 *Para Regina y Romina:* ${funFact.encouragement}`;

    if (onShareToChat) {
      onShareToChat(shareMessage);
    } else {
      // Fallback to sending directly to /api/chat
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: activeUser || 'Regina y Romina',
          senderRole: 'regina',
          text: `💡 *Dato curioso compartido:* ${funFact.title} — ${funFact.fact} 🐾🔬`,
        }),
      }).catch(console.error);
    }

    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (!funFact && isLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border border-amber-200/80 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-amber-200" />
          <div className="h-4 bg-amber-200 rounded w-48" />
        </div>
        <div className="h-3 bg-amber-100 rounded w-full mb-2" />
        <div className="h-3 bg-amber-100 rounded w-3/4" />
      </div>
    );
  }

  if (!funFact) return null;

  const isDogs = funFact.category === 'dogs';
  const cardBorder = isDogs 
    ? 'border-amber-200 hover:border-amber-300' 
    : 'border-sky-200 hover:border-sky-300';
  const cardBg = isDogs 
    ? 'from-amber-50/90 via-orange-50/40 to-yellow-50/60' 
    : 'from-sky-50/90 via-indigo-50/40 to-cyan-50/60';
  const badgeColor = isDogs 
    ? 'bg-amber-100 text-amber-900 border-amber-200' 
    : 'bg-sky-100 text-sky-900 border-sky-200';
  const highlightBox = isDogs 
    ? 'bg-amber-100/60 border-amber-200 text-amber-950' 
    : 'bg-sky-100/60 border-sky-200 text-sky-950';

  return (
    <div
      id="daily-fun-fact-widget"
      className={`bg-gradient-to-br ${cardBg} p-4 sm:p-5 rounded-3xl border-2 ${cardBorder} shadow-sm transition-all duration-300 relative overflow-hidden`}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/40 blur-2xl pointer-events-none" />

      {/* Header bar: Title & Topic Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
            isDogs ? 'bg-amber-500 text-white' : 'bg-sky-600 text-white'
          }`}>
            {isDogs ? <Dog className="w-4 h-4" /> : <Atom className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Fredoka',sans-serif] font-bold text-sm sm:text-base text-slate-800">
                Dato Curioso del Día
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3 text-amber-500" />
                {funFact.source === 'gemini' ? 'IA Gemini' : 'Curiosidad Especial'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Motivación y aprendizaje para Regina y Romina
            </p>
          </div>
        </div>

        {/* Topic filter pills */}
        <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            id="fun-fact-topic-any-btn"
            onClick={() => {
              setTopic('any');
              soundFX.playTick();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              topic === 'any'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ✨ Sorpresa
          </button>
          <button
            type="button"
            id="fun-fact-topic-dogs-btn"
            onClick={() => {
              setTopic('dogs');
              soundFX.playTick();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              topic === 'dogs'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            🐾 Luna & Perritos
          </button>
          <button
            type="button"
            id="fun-fact-topic-science-btn"
            onClick={() => {
              setTopic('science');
              soundFX.playTick();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              topic === 'science'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50'
            }`}
          >
            🔬 Ciencia
          </button>
        </div>
      </div>

      {/* Main Fact Body */}
      <div className="bg-white/90 p-4 rounded-2xl border border-white shadow-xs space-y-2.5 relative z-10">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-['Fredoka',sans-serif] text-base sm:text-lg font-bold text-slate-900 leading-snug flex items-center gap-2">
            <span className="text-xl">{funFact.emoji}</span>
            <span>{funFact.title}</span>
          </h4>
        </div>

        {/* Fact description */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {funFact.fact}
        </p>

        {/* Did You Know box */}
        {funFact.didYouKnow && (
          <div className={`p-2.5 rounded-xl border text-xs font-medium flex items-start gap-2 ${highlightBox}`}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-bold block text-[11px] uppercase tracking-wider opacity-80">
                ¿Sabías que?
              </span>
              <span>{funFact.didYouKnow}</span>
            </div>
          </div>
        )}

        {/* Motivational Encouragement for Romina & Regina */}
        {funFact.encouragement && (
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50/80 p-2 rounded-xl border border-rose-100">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400 flex-shrink-0" />
            <span className="italic">{funFact.encouragement}</span>
          </div>
        )}
      </div>

      {/* Footer Controls: Audio, Refresh & Share to Chat */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap relative z-10 pt-1">
        {/* Left Action: Speech */}
        <button
          type="button"
          id="fun-fact-speak-btn"
          onClick={handleToggleSpeech}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
            isSpeaking
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
          title="Escuchar dato curioso en voz alta"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
          <span>{isSpeaking ? 'Detener voz' : 'Escuchar dato 🔊'}</span>
        </button>

        {/* Right Actions: Refresh and Share */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            id="fun-fact-share-btn"
            onClick={handleShare}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              copiedShare
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="Compartir este dato al chat familiar para que Mamá y Papá lo vean"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-purple-500" />}
            <span>{copiedShare ? '¡Compartido al chat!' : 'Compartir al Chat'}</span>
          </button>

          <button
            type="button"
            id="fun-fact-refresh-btn"
            disabled={isLoading}
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Generar otro dato curioso con IA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generando...' : 'Otro dato ✨'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
