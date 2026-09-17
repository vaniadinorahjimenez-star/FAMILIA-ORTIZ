import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  X, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { ChildId, TaskEvidence } from '../types';
import { soundFX } from '../utils/audio';
import { formatDateKey } from '../utils/scheduleGenerator';
import { compressImage } from '../utils/imageCompressor';

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

  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setError('');
    setIsCompressing(true);
    try {
      // Intelligently compress iPad/iPhone/camera photos
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      setImageDataUrl(compressed.dataUrl);
      soundFX.playCheck();
    } catch (err: any) {
      console.warn('Error comprimiendo imagen:', err);
      // Fallback to direct FileReader if canvas fails
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUrl(reader.result as string);
        soundFX.playCheck();
      };
      reader.onerror = () => {
        setError('Error al leer el archivo. Intenta con otra foto.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        id="upload-evidence-modal-card"
        className="w-full max-w-lg sm:max-w-xl bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border-2 border-purple-200 relative flex flex-col justify-between overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-purple-100 text-purple-700 rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-['Fredoka',sans-serif] text-slate-900 leading-tight">
                Subir Foto de Actividad Cumplida 📸
              </h3>
              <p className="text-[10px] text-slate-500">
                Evidencia de rutina o reto completado para la familia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-1.5 p-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Responsive 2-column on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
            {/* Left Column: Details */}
            <div className="space-y-1.5">
              {/* Who completed it */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                  ¿Quién cumplió la actividad? *
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    id="select-evidence-romina-btn"
                    onClick={() => {
                      setChildId('romina');
                      soundFX.playPop();
                    }}
                    className={`py-1 px-1.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      childId === 'romina'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>🌸 Romina</span>
                  </button>

                  <button
                    type="button"
                    id="select-evidence-regina-btn"
                    onClick={() => {
                      setChildId('regina');
                      soundFX.playPop();
                    }}
                    className={`py-1 px-1.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      childId === 'regina'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>💜 Regina</span>
                  </button>
                </div>
              </div>

              {/* Activity title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                  Actividad Realizada *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej: Paseo con Luna, Tarea escolar..."
                  className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              {/* Optional Caption */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                  Comentario (opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ej: ¡Luna corrió feliz en el parque!"
                  className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column: Photo Uploader / Preview */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
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
                  className={`p-2 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[95px] ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                      : 'border-slate-300 hover:border-purple-400 bg-slate-50/70 hover:bg-purple-50/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-0.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800 leading-tight">
                    Tomar o subir foto
                  </h4>
                  <span className="mt-1 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-2xs">
                    Cámara / Galería 📷
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-300 group h-[95px] flex items-center justify-center bg-slate-100">
                  <img
                    src={imageDataUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-0.5 bg-white text-slate-800 font-bold text-[9px] rounded-md shadow"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageDataUrl('')}
                      className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded-md shadow"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/60 text-white text-[9px] font-bold rounded backdrop-blur-xs flex items-center gap-0.5">
                    <Check className="w-2 h-2 text-emerald-400" />
                    <span>Lista</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!imageDataUrl || !taskTitle.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Guardar Evidencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
