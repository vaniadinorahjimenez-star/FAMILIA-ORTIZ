import React, { useState } from 'react';
import { X, Heart, Plus, Calendar, Clock, Sparkles, Check, Trash2, Edit2 } from 'lucide-react';
import { FamilyActivity } from '../types';
import { INSPIRING_FAMILY_ACTIVITIES } from '../utils/scheduleGenerator';
import { soundFX } from '../utils/audio';

interface FamilyActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: FamilyActivity[];
  onSaveActivity: (activity: FamilyActivity) => void;
  onDeleteActivity: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const FamilyActivitiesModal: React.FC<FamilyActivitiesModalProps> = ({
  isOpen,
  onClose,
  activities,
  onSaveActivity,
  onDeleteActivity,
  onToggleComplete,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-09-10');
  const [time, setTime] = useState('18:30');
  const [suggestedBy, setSuggestedBy] = useState('Mamá y Papá');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handlePickPreset = (preset: { title: string; description: string }) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setShowAddForm(true);
    soundFX.playPop();
  };

  const handleEdit = (act: FamilyActivity) => {
    setEditingId(act.id);
    setTitle(act.title);
    setDescription(act.description);
    setDate(act.date);
    setTime(act.time || '18:30');
    setSuggestedBy(act.suggestedBy || 'Familia');
    setNotes(act.notes || '');
    setShowAddForm(true);
    soundFX.playPop();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const act: FamilyActivity = {
      id: editingId || `act-fam-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      suggestedBy,
      completed: false,
      notes,
    };

    onSaveActivity(act);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setNotes('');
    setShowAddForm(false);
    soundFX.playCheck();
  };

  return (
    <div 
      id="family-activities-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        id="family-activities-modal-card"
        className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border-2 border-rose-200 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs">
              <Heart className="w-4 h-4 text-white fill-white/50" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-['Fredoka',sans-serif] leading-tight">
                Jueves en Familia 👨‍👩‍👧‍👧
              </h3>
              <p className="text-[10px] text-rose-100">
                Momentos especiales para leer, pasear y divertirse juntos
              </p>
            </div>
          </div>
          <button
            id="close-family-activities-modal"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Column layout on tablet / desktop to avoid scrolling */}
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
          {/* Left Column: Form or Scheduled Activities */}
          <div className="space-y-2.5 flex flex-col justify-between">
            {/* Action to Toggle Form */}
            {!showAddForm ? (
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-2 sm:p-2.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-rose-950 leading-tight">
                    ¿Nueva idea para el jueves?
                  </h4>
                  <p className="text-[10px] text-rose-700">
                    Regina, Romina, mamá o papá
                  </p>
                </div>
                <button
                  id="propose-activity-btn"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setDescription('');
                    setNotes('');
                    setShowAddForm(true);
                    soundFX.playPop();
                  }}
                  className="flex items-center gap-1 py-1 px-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Proponer
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                  <span className="font-bold text-xs text-slate-800">
                    {editingId ? 'Editar Actividad' : 'Nueva Actividad'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-600 mb-0.5">
                    Título *
                  </label>
                  <input
                    id="family-act-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Reto de rompecabezas..."
                    className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-600 mb-0.5">
                    ¿Qué haremos?
                  </label>
                  <input
                    id="family-act-desc-input"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre qué haremos juntos..."
                    className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-600 mb-0.5">Fecha</label>
                    <input
                      id="family-act-date-input"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-600 mb-0.5">Hora</label>
                    <input
                      id="family-act-time-input"
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="18:30"
                      className="w-full px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-600 mb-0.5">Por</label>
                    <select
                      id="family-act-suggested-by-select"
                      value={suggestedBy}
                      onChange={(e) => setSuggestedBy(e.target.value)}
                      className="w-full px-1 py-1 rounded-lg border border-slate-200 bg-white text-[11px] focus:ring-2 focus:ring-rose-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Mamá">Mamá</option>
                      <option value="Papá">Papá</option>
                      <option value="Nan">Nan</option>
                      <option value="Regina">Regina</option>
                      <option value="Romina">Romina</option>
                      <option value="Familia">Familia</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="save-family-act-btn"
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-2xs cursor-pointer"
                  >
                    {editingId ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Scheduled Family Thursdays */}
            <div className="flex-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-rose-500" />
                <span>Actividades Programadas</span>
              </h4>

              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center bg-slate-50 rounded-xl">
                  No hay actividades aún. ¡Elige una idea a la derecha!
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className={`p-2 rounded-xl border transition-all ${
                        act.completed
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : 'bg-white border-rose-100 shadow-2xs hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap mb-0.5">
                            <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                              {act.date}
                            </span>
                            {act.time && (
                              <span className="text-[9px] text-slate-500">
                                {act.time}
                              </span>
                            )}
                            {act.suggestedBy && (
                              <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-1 py-0.2 rounded">
                                {act.suggestedBy}
                              </span>
                            )}
                          </div>

                          <h5 className={`text-xs font-bold text-slate-800 truncate ${act.completed ? 'line-through text-slate-400' : ''}`}>
                            {act.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate leading-tight">
                            {act.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => onToggleComplete(act.id)}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                              act.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={act.completed ? 'Desmarcar' : 'Completada'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleEdit(act)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Ideas Bank / Preset Inspirations */}
          <div className="flex flex-col justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ideas Divertidas (1 Clic para usar)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1">
              {INSPIRING_FAMILY_ACTIVITIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickPreset(preset)}
                  className="text-left p-2 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all group cursor-pointer flex flex-col justify-center"
                >
                  <div className="font-bold text-xs text-slate-800 group-hover:text-rose-700 leading-tight">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
