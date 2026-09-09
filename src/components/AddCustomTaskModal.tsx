import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Clock, Check } from 'lucide-react';
import { RoutineTask, ChildId, TaskCategory } from '../types';

interface AddCustomTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: RoutineTask) => void;
  selectedChild: ChildId | 'both';
}

export const AddCustomTaskModal: React.FC<AddCustomTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  selectedChild,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState('16:00 - 16:30');
  const [timeCategory, setTimeCategory] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [assignedTo, setAssignedTo] = useState<ChildId | 'both'>(selectedChild);
  const [points, setPoints] = useState(15);
  const [category, setCategory] = useState<TaskCategory>('custom');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: RoutineTask = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Actividad especial agregada por la familia.',
      timeSlot,
      timeCategory,
      assignedTo,
      category,
      points: Number(points) || 10,
      iconName: 'CheckCircle2',
      custom: true,
    };

    onAddTask(newTask);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div 
      id="custom-task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div 
        id="custom-task-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-200 animate-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                Nueva Actividad para Hoy
              </h3>
              <p className="text-xs text-slate-500">
                Agrega una tarea personalizada para Regina o Romina
              </p>
            </div>
          </div>
          <button
            id="close-custom-task-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Nombre de la actividad *
            </label>
            <input
              id="custom-task-title-input"
              type="text"
              required
              placeholder="Ej: Terminar maqueta de ciencias, regar flores..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Descripción o detalles
            </label>
            <textarea
              id="custom-task-desc-input"
              rows={2}
              placeholder="Detalles sobre qué deben hacer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                ¿A quién le toca?
              </label>
              <select
                id="custom-task-assigned-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value as ChildId | 'both')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="both">👨‍👩‍👧‍👧 A ambas</option>
                <option value="romina">🌸 Romina (8 años)</option>
                <option value="regina">💜 Regina (10 años)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Horario sugerido
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="custom-task-time-input"
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="Ej: 16:30 - 17:00"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Momento del día
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['morning', 'afternoon', 'evening'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTimeCategory(cat)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                      timeCategory === cat
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'morning' ? 'Mañana' : cat === 'afternoon' ? 'Tarde' : 'Noche'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Puntos asignados
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-task-points-input"
                  type="number"
                  min="5"
                  max="50"
                  step="5"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suma al 100%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="submit-custom-task-btn"
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
