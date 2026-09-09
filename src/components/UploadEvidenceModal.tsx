import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  X, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ChildId, TaskEvidence } from '../types';
import { soundFX } from '../utils/audio';
import { formatDateKey } from '../utils/scheduleGenerator';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvidence: (evidence: TaskEvidence) => void;
  initialChildId?: ChildId;
  initialTaskTitle?: string;
  initialTaskId?: string;
  currentDate: Date;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  onSaveEvidence,
  initialChildId = 'romina',
  initialTaskTitle = '',
  initialTaskId,
  currentDate,
}) => {
  const [childId, setChildId] = useState<ChildId>(initialChildId);
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle);
  const [caption, setCaption] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if initial props change
  React.useEffect(() => {
    if (isOpen) {
      setChildId(initialChildId);
      setTaskTitle(initialTaskTitle || '');
      setCaption('');
      setImageDataUrl('');
      setError('');
    }
  }, [isOpen, initialChildId, initialTaskTitle]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen es muy pesada. Por favor selecciona una de menos de 8MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      soundFX.playCheck();
    };
    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta con otra foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setError('Escribe qué actividad se cumplió.');
      return;
    }

    if (!imageDataUrl) {
      setError('Sube o toma una foto para comprobar la actividad cumplida.');
      return;
    }

    const newEvidence: TaskEvidence = {
      id: `ev-${Date.now()}`,
      taskId: initialTaskId,
      taskTitle: taskTitle.trim(),
      childId,
      date: formatDateKey(currentDate),
      timestamp: new Date().toISOString(),
      imageDataUrl,
      caption: caption.trim() || undefined,
    };

    onSaveEvidence(newEvidence);
    soundFX.playFanfare();
    onClose();
  };

  return (
    <div 
      id="upload-evidence-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div 
        id="upload-evidence-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-purple-200 relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-slate-900">
                Subir Foto de Actividad Cumplida 📸
              </h3>
              <p className="text-xs text-slate-500">
                Evidencia de que cumpliste tu rutina o reto del día
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Who completed it */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              ¿Quién cumplió la actividad? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="select-evidence-romina-btn"
                onClick={() => {
                  setChildId('romina');
                  soundFX.playPop();
                }}
                className={`p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  childId === 'romina'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span>🌸 Romina (8 años)</span>
              </button>

              <button
                type="button"
                id="select-evidence-regina-btn"
                onClick={() => {
                  setChildId('regina');
                  soundFX.playPop();
                }}
                className={`p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  childId === 'regina'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span>💜 Regina (10 años)</span>
              </button>
            </div>
          </div>

          {/* Activity title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Actividad o Rutina Realizada *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ej: Paseo con Luna en el parque, Lección de piano, Gimnasia..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {/* Drag and drop upload zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Foto de la actividad *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imageDataUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-purple-400 bg-slate-50/70 hover:bg-purple-50/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Arrastra tu foto aquí o haz clic para seleccionarla
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Puedes tomar la foto con la cámara de tu celular o tablet, o elegir de tu galería
                </p>
                <span className="inline-block mt-3 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700">
                  Tomar o Elegir Foto 📷
                </span>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-300 group">
                <img
                  src={imageDataUrl}
                  alt="Vista previa de evidencia"
                  className="w-full h-56 object-cover bg-slate-100"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-white text-slate-800 font-bold text-xs rounded-xl shadow hover:bg-slate-100"
                  >
                    Cambiar Foto 🔄
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl('')}
                    className="px-3.5 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-700"
                  >
                    Quitar ✕
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 text-white text-[11px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Foto lista para guardar</span>
                </div>
              </div>
            )}
          </div>

          {/* Optional Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Comentario o mensaje (opcional)
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej: Luna disfrutó mucho correr en el pasto, ¡y practicamos saltos!"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!imageDataUrl || !taskTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Guardar Evidencia Fotográfica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
