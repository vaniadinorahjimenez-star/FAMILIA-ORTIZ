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
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Heart className="w-5 h-5 text-white fill-white/50" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-['Fredoka',sans-serif] leading-tight">
                Jueves en Familia 👨‍👩‍👧‍👧
              </h3>
              <p className="text-[11px] text-rose-100">
                Momentos especiales juntos para leer, pasear y divertirse
              </p>
            </div>
          </div>
          <button
            id="close-family-activities-modal"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Action to Toggle Form */}
          {!showAddForm ? (
            <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                  ¿Tienen una nueva idea para los jueves?
                </h4>
                <p className="text-[11px] text-rose-700">
                  Regina, Romina, mamá o papá pueden proponer o cambiar la actividad.
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
                className="flex items-center gap-1.5 py-1.5 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Proponer Actividad
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-amber-50/70 border border-amber-200 p-3.5 sm:p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  {editingId ? 'Editar Actividad Familiar' : 'Nueva Actividad Familiar'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                  Título de la actividad *
                </label>
                <input
                  id="family-act-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Gran partida de dominó o reto de rompecabezas..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                  ¿Qué haremos? (Descripción)
                </label>
                <input
                  id="family-act-desc-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre qué haremos juntos..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                    Fecha
                  </label>
                  <input
                    id="family-act-date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                    Hora
                  </label>
                  <input
                    id="family-act-time-input"
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="18:30"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                    Propuesto por
                  </label>
                  <select
                    id="family-act-suggested-by-select"
                    value={suggestedBy}
                    onChange={(e) => setSuggestedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Mamá">Mamá</option>
                    <option value="Papá">Papá</option>
                    <option value="Nan">Nan</option>
                    <option value="Regina">Regina (10 años)</option>
                    <option value="Romina">Romina (8 años)</option>
                    <option value="Regina & Romina">Regina & Romina</option>
                    <option value="Toda la Familia">Toda la Familia</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="save-family-act-btn"
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          )}

          {/* List of Scheduled Family Thursdays */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Próximas Actividades Programadas</span>
            </h4>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No hay actividades guardadas. ¡Selecciona una de las ideas abajo!
              </p>
            ) : (
              <div className="space-y-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      act.completed
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-rose-100 shadow-2xs hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {act.date}
                          </span>
                          {act.time && (
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {act.time}
                            </span>
                          )}
                          {act.suggestedBy && (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Idea de: {act.suggestedBy}
                            </span>
                          )}
                        </div>

                        <h5 className={`text-xs sm:text-sm font-bold text-slate-800 ${act.completed ? 'line-through text-slate-400' : ''}`}>
                          {act.title}
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {act.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleComplete(act.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            act.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={act.completed ? 'Desmarcar' : 'Marcar como realizada'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(act)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteActivity(act.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ideas Bank / Preset Inspirations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ideas Divertidas para Probar (1 Clic para usar)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INSPIRING_FAMILY_ACTIVITIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickPreset(preset)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all group cursor-pointer"
                >
                  <div className="font-bold text-xs text-slate-800 group-hover:text-rose-700 mb-0.5">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
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
