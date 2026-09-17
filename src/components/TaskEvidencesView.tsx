import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Heart, 
  Maximize2, 
  X,
  Clock,
  Dog
} from 'lucide-react';
import { TaskEvidence, ChildId } from '../types';
import { soundFX } from '../utils/audio';

interface TaskEvidencesViewProps {
  evidences: TaskEvidence[];
  onOpenUploadModal: (childId?: ChildId) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  selectedChild: ChildId | 'both';
}

export const TaskEvidencesView: React.FC<TaskEvidencesViewProps> = ({
  evidences,
  onOpenUploadModal,
  onDeleteEvidence,
  selectedChild,
}) => {
  const [filterChild, setFilterChild] = useState<ChildId | 'both'>(selectedChild);
  const [zoomedEvidence, setZoomedEvidence] = useState<TaskEvidence | null>(null);

  const filteredEvidences = evidences.filter((ev) => {
    if (filterChild === 'both') return true;
    return ev.childId === filterChild;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta foto de evidencia?')) {
      onDeleteEvidence(id);
      soundFX.playPop();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                Álbum de Logros y Misiones
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif]">
              Fotos de Actividades Cumplidas 📸
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl leading-relaxed">
              El rincón visual donde Regina y Romina suben su foto comprobando que sacaron a Luna, practicaron piano o duolingo, hicieron gimnasia o completaron sus rutinas.
            </p>
          </div>

          <button
            id="upload-evidence-top-btn"
            onClick={() => {
              onOpenUploadModal(filterChild === 'both' ? 'romina' : filterChild);
              soundFX.playPop();
            }}
            className="px-5 py-3 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105"
          >
            <Camera className="w-4 h-4 text-purple-600" />
            <span>+ Subir Nueva Foto</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Ver fotos de:
          </span>
          <button
            onClick={() => {
              setFilterChild('both');
              soundFX.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterChild === 'both'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas las fotos ({evidences.length})
          </button>
          <button
            onClick={() => {
              setFilterChild('romina');
              soundFX.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterChild === 'romina'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🌸 Romina ({evidences.filter((e) => e.childId === 'romina').length})
          </button>
          <button
            onClick={() => {
              setFilterChild('regina');
              soundFX.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterChild === 'regina'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            💜 Regina ({evidences.filter((e) => e.childId === 'regina').length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          {filteredEvidences.length} {filteredEvidences.length === 1 ? 'foto registrada' : 'fotos registradas'}
        </span>
      </div>

      {/* Grid of Evidences */}
      {filteredEvidences.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-500 mx-auto flex items-center justify-center mb-3">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-['Fredoka',sans-serif] text-slate-800 mb-1">
            Aún no hay fotos subidas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            ¡Cuando cumplan su paseo con Luna, lección de piano, duolingo o gimnasia, tomen una foto para guardarla en su muro de evidencias!
          </p>
          <button
            onClick={() => onOpenUploadModal('romina')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Primera Foto de Actividad</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidences.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setZoomedEvidence(ev)}
              className="bg-white rounded-3xl border-2 border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Photo Area */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {ev.imageDataUrl ? (
                    <img
                      src={ev.imageDataUrl}
                      alt={ev.taskTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-rose-100 text-purple-600 p-4 text-center">
                      <Sparkles className="w-8 h-8 mb-1 text-amber-500" />
                      <span className="text-xs font-bold">Evidencia Registrada</span>
                    </div>
                  )}

                  {/* Badge of Child */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                        ev.childId === 'romina'
                          ? 'bg-rose-500 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {ev.childId === 'romina' ? '🌸 Romina' : '💜 Regina'}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(ev.id, e)}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-2 right-2 p-1 bg-black/40 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {ev.taskTitle}
                  </h4>

                  {ev.caption && (
                    <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                      &ldquo;{ev.caption}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Date & Time */}
              <div className="px-4 pb-3 pt-1 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {ev.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(ev.timestamp).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedEvidence && (
        <div
          onClick={() => setZoomedEvidence(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between animate-in zoom-in-95"
          >
            <div className="relative bg-black flex items-center justify-center max-h-[38vh] flex-1 min-h-[140px]">
              {zoomedEvidence.imageDataUrl ? (
                <img
                  src={zoomedEvidence.imageDataUrl}
                  alt={zoomedEvidence.taskTitle}
                  className="max-h-[38vh] w-auto object-contain"
                />
              ) : (
                <div className="py-8 text-white text-center">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                  <p className="font-bold text-xs">Foto de evidencia</p>
                </div>
              )}

              <button
                onClick={() => setZoomedEvidence(null)}
                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 bg-white flex-shrink-0 border-t border-slate-100">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span
                    className={`px-2 py-0.2 rounded-full text-[9px] font-black ${
                      zoomedEvidence.childId === 'romina'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {zoomedEvidence.childId === 'romina' ? '🌸 Romina' : '💜 Regina'}
                  </span>
                  <span className="text-[10px] text-slate-400">{zoomedEvidence.date}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {zoomedEvidence.taskTitle}
                </h3>
                {zoomedEvidence.caption && (
                  <p className="text-[11px] text-slate-600 italic truncate mt-0.5">
                    &ldquo;{zoomedEvidence.caption}&rdquo;
                  </p>
                )}
              </div>

              <button
                onClick={() => setZoomedEvidence(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex-shrink-0 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
