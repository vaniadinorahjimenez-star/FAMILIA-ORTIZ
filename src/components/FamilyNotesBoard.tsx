import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Heart, 
  Star, 
  Sparkles, 
  Send, 
  Smile, 
  Trophy, 
  Dog, 
  X,
  Trash2
} from 'lucide-react';
import { FamilyNote } from '../types';
import { soundFX } from '../utils/audio';

interface FamilyNotesBoardProps {
  notes: FamilyNote[];
  onAddNote: (note: FamilyNote) => void;
  onReactToNote: (noteId: string, reactionType: keyof FamilyNote['reactions']) => void;
  onDeleteNote: (noteId: string) => void;
}

export const FamilyNotesBoard: React.FC<FamilyNotesBoardProps> = ({
  notes,
  onAddNote,
  onReactToNote,
  onDeleteNote,
}) => {
  const [filterTo, setFilterTo] = useState<string>('all');
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Compose form state
  const [from, setFrom] = useState('Mamá');
  const [to, setTo] = useState('Todos');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FamilyNote['category']>('agradecimiento');
  const [color, setColor] = useState<FamilyNote['color']>('amber');

  const filteredNotes = notes.filter((n) => {
    if (filterTo === 'all') return true;
    return n.to.toLowerCase() === filterTo.toLowerCase();
  });

  const handleReaction = (noteId: string, reaction: keyof FamilyNote['reactions']) => {
    onReactToNote(noteId, reaction);
    soundFX.playPop();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newNote: FamilyNote = {
      id: `note-${Date.now()}`,
      from,
      to,
      message: message.trim(),
      category,
      color,
      createdAt: new Date().toISOString(),
      reactions: { heart: 1, star: 0, dog: 0, clap: 0, laugh: 0 },
    };

    onAddNote(newNote);
    setMessage('');
    setShowComposeModal(false);
    soundFX.playFanfare();
  };

  const getColorClasses = (c: FamilyNote['color']) => {
    switch (c) {
      case 'rose': return 'bg-rose-50 border-rose-200 text-rose-950 shadow-rose-100';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-950 shadow-purple-100';
      case 'emerald': return 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-100';
      case 'sky': return 'bg-sky-50 border-sky-200 text-sky-950 shadow-sky-100';
      default: return 'bg-amber-50 border-amber-200 text-amber-950 shadow-amber-100';
    }
  };

  const getCategoryBadge = (cat: FamilyNote['category']) => {
    switch (cat) {
      case 'animo':
        return <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-lg flex items-center gap-1">🌟 Ánimo</span>;
      case 'divertido':
        return <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-lg flex items-center gap-1">😂 Momento Divertido</span>;
      case 'orgullo':
        return <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-lg flex items-center gap-1">🏆 ¡Qué Orgullo!</span>;
      default:
        return <span className="text-[11px] font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-lg flex items-center gap-1">❤️ Agradecimiento</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Rincón del Cariño Familiar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif]">
              Muro de Agradecimientos &amp; Pensamientos 💌
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
              Un espacio para decirnos palabras bonitas, agradecer lo que hacemos los unos por los otros y compartir momentos felices entre Regina, Romina, mamá y papá.
            </p>
          </div>

          <button
            id="open-compose-note-btn"
            onClick={() => {
              setShowComposeModal(true);
              soundFX.playPop();
            }}
            className="flex items-center gap-2 py-3 px-5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all self-start sm:self-auto group"
          >
            <Plus className="w-4 h-4 text-purple-600 group-hover:rotate-90 transition-transform" />
            <span>Escribir Mensaje</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-slate-400 mr-1">Filtrar para:</span>
        {[
          { key: 'all', label: 'Todos los mensajes' },
          { key: 'regina', label: '💜 Para Regina' },
          { key: 'romina', label: '🌸 Para Romina' },
          { key: 'familia', label: '👨‍👩‍👧‍👧 Para la Familia / Papás' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilterTo(f.key);
              soundFX.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTo === f.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-3xl border-2 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${getColorClasses(
              note.color
            )}`}
          >
            <div>
              {/* Note Header: From / To / Category */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {getCategoryBadge(note.category)}
                
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                  title="Eliminar mensaje"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3">
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-black/5 font-bold">
                  De: {note.from}
                </span>
                <span>&rarr;</span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-black/5 font-bold text-purple-900">
                  Para: {note.to}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm font-medium leading-relaxed mb-4 whitespace-pre-line">
                &ldquo;{note.message}&rdquo;
              </p>
            </div>

            {/* Reactions Footer */}
            <div className="pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-1.5">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => handleReaction(note.id, 'heart')}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/80 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                  title="Me encanta"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{note.reactions.heart}</span>
                </button>

                <button
                  onClick={() => handleReaction(note.id, 'star')}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/80 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                  title="Eres genial"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{note.reactions.star}</span>
                </button>

                <button
                  onClick={() => handleReaction(note.id, 'dog')}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/80 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                  title="Huellita de Luna"
                >
                  <Dog className="w-3.5 h-3.5 text-amber-600" />
                  <span>{note.reactions.dog}</span>
                </button>

                <button
                  onClick={() => handleReaction(note.id, 'laugh')}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/80 hover:bg-white px-2 py-1 rounded-lg transition-colors"
                  title="Me dio risa"
                >
                  <Smile className="w-3.5 h-3.5 text-yellow-600" />
                  <span>{note.reactions.laugh}</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400">
                {new Date(note.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Note Modal */}
      {showComposeModal && (
        <div 
          onClick={() => setShowComposeModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-indigo-200 relative max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-['Fredoka',sans-serif] text-slate-800 leading-tight">
                    Escribir Pensamiento o Agradecimiento
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Para que todos en la familia lo veamos en el muro
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                    ¿Quién escribe? (De)
                  </label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Mamá">Mamá 👩</option>
                    <option value="Papá">Papá 👨</option>
                    <option value="Nan">Nan 👵</option>
                    <option value="Regina">Regina (10a) 💜</option>
                    <option value="Romina">Romina (8a) 🌸</option>
                    <option value="Toda la Familia">Toda la Familia 👨‍👩‍👧‍👧</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                    ¿Para quién es? (Para)
                  </label>
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Todos">Para Todos 👨‍👩‍👧‍👧</option>
                    <option value="Regina">Regina 💜</option>
                    <option value="Romina">Romina 🌸</option>
                    <option value="Mamá">Mamá 👩</option>
                    <option value="Papá">Papá 👨</option>
                    <option value="Nan">Nan 👵</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                    Tipo de mensaje
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FamilyNote['category'])}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="agradecimiento">❤️ Agradecimiento</option>
                    <option value="animo">🌟 Mensaje de ánimo</option>
                    <option value="divertido">😂 Momento divertido</option>
                    <option value="orgullo">🏆 ¡Qué orgullo!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                    Color de la nota
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {(['amber', 'rose', 'purple', 'emerald', 'sky'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                          color === c ? 'ring-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'
                        } ${
                          c === 'amber' ? 'bg-amber-300' :
                          c === 'rose' ? 'bg-rose-300' :
                          c === 'purple' ? 'bg-purple-300' :
                          c === 'emerald' ? 'bg-emerald-300' : 'bg-sky-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                  Tu mensaje con cariño *
                </label>
                <textarea
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe lo que sientes, agradeces o un momento que te hizo sonreír..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar en el Muro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
