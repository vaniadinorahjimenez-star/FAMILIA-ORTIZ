import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Camera, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Sparkles, 
  X, 
  Calendar,
  Clock,
  Coins,
  Smile,
  BadgeAlert,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { FineRecord, ChildId } from '../types';
import { soundFX } from '../utils/audio';
import { formatDateKey } from '../utils/scheduleGenerator';

interface FinesPolicePanelProps {
  fines: FineRecord[];
  onAddFine: (fine: FineRecord) => void;
  onForgiveFine: (fineId: string) => void;
  onDeleteFine: (fineId: string) => void;
  currentDate: Date;
  selectedChild: ChildId | 'both';
}

const COMMON_REASONS = [
  'Ropa tirada en el piso 👕',
  'No sacó a Luna a pasear 🐶',
  'Cama sin tender 🛏️',
  'No cumplió actividad del horario ⏰',
  'Platos o vasos sucios sin recoger 🍽️',
  'Juguetes o zapatos regados 🧸',
];

export const FinesPolicePanel: React.FC<FinesPolicePanelProps> = ({
  fines,
  onAddFine,
  onForgiveFine,
  onDeleteFine,
  currentDate,
  selectedChild,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [childId, setChildId] = useState<ChildId>('romina');
  const [reason, setReason] = useState('Ropa tirada en el piso 👕');
  const [customReason, setCustomReason] = useState('');
  const [amount, setAmount] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState('');
  const [zoomedFine, setZoomedFine] = useState<FineRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Statistics
  const rominaActiveFines = fines.filter((f) => f.childId === 'romina' && f.status === 'activa');
  const reginaActiveFines = fines.filter((f) => f.childId === 'regina' && f.status === 'activa');
  const rominaDeduction = rominaActiveFines.reduce((sum, f) => sum + f.amount, 0);
  const reginaDeduction = reginaActiveFines.reduce((sum, f) => sum + f.amount, 0);

  const filteredFines = fines.filter((f) => {
    if (selectedChild === 'both') return true;
    return f.childId === selectedChild;
  });

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Por favor selecciona un archivo de imagen (JPG, PNG).');
      return;
    }
    setFormError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      soundFX.playPop();
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

  const handleSubmitFine = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'custom' ? customReason.trim() : reason;
    if (!finalReason) {
      setFormError('Escribe o selecciona el motivo de la multa.');
      return;
    }

    const newFine: FineRecord = {
      id: `fine-${Date.now()}`,
      childId,
      reason: finalReason,
      amount: Number(amount) || 5,
      officer: 'Nan - Policía de las Multas 👮‍♀️',
      date: formatDateKey(currentDate),
      timestamp: new Date().toISOString(),
      imageDataUrl: imageDataUrl || undefined,
      status: 'activa',
      notes: notes.trim() || undefined,
    };

    onAddFine(newFine);
    soundFX.playPop();
    setShowAddForm(false);
    setImageDataUrl('');
    setNotes('');
    setCustomReason('');
    setReason('Ropa tirada en el piso 👕');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Official Police Headquarters Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden border-2 border-amber-400/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                Departamento de Orden y Disciplina
              </span>
              <span className="text-xs text-amber-200 font-bold bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-700">
                Oficial al Mando: Nan 👮‍♀️
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif] flex items-center gap-2">
              <span>Policía de las Multas Familiar</span>
              <span className="text-amber-400">🚨</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Supervisión de la oficial <strong className="text-white">Nan</strong>: si las niñas dejan ropa tirada, no sacan a pasear a <strong className="text-amber-300">Luna</strong> o no cumplen sus rutinas, se tomará foto de evidencia y se descontarán <strong className="text-amber-300">$5 pesos</strong> por cada multa de su domingo.
            </p>
          </div>

          <button
            id="open-fine-form-btn"
            onClick={() => {
              setShowAddForm(true);
              soundFX.playPop();
            }}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105"
          >
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>+ Levantar Multa (Oficial Nan) 👮‍♀️</span>
          </button>
        </div>
      </div>

      {/* Summary Scoreboard for the Girls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Romina Fines Box */}
        <div className="bg-white p-5 rounded-3xl border-2 border-rose-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
              🌸
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Multas de Romina (8 años)
              </span>
              <h4 className="text-base font-bold text-slate-800">
                {rominaActiveFines.length} {rominaActiveFines.length === 1 ? 'infracción activa' : 'infracciones activas'}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-rose-500 font-bold block">Descuento</span>
            <span className="text-xl font-black text-rose-600 font-['Fredoka',sans-serif]">
              -${rominaDeduction} MXN
            </span>
          </div>
        </div>

        {/* Regina Fines Box */}
        <div className="bg-white p-5 rounded-3xl border-2 border-purple-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
              💜
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Multas de Regina (10 años)
              </span>
              <h4 className="text-base font-bold text-slate-800">
                {reginaActiveFines.length} {reginaActiveFines.length === 1 ? 'infracción activa' : 'infracciones activas'}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-purple-500 font-bold block">Descuento</span>
            <span className="text-xl font-black text-purple-600 font-['Fredoka',sans-serif]">
              -${reginaDeduction} MXN
            </span>
          </div>
        </div>
      </div>

      {/* Modal / Inline Form to Add a Fine */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white border-2 border-amber-400 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-blue-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-white flex items-center gap-2">
                  <span>Boleta Oficial de Infracción</span>
                  <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                    NAN 👮‍♀️
                  </span>
                </h3>
                <p className="text-xs text-blue-200">
                  Registra la falta, sube la foto de prueba y aplica la deducción de $5 pesos
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-800/60 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-400 text-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFine} className="space-y-4">
            {/* Choose child */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                ¿A quién se le levanta la multa? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setChildId('romina');
                    soundFX.playPop();
                  }}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    childId === 'romina'
                      ? 'border-rose-400 bg-rose-500/30 text-white shadow'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>🌸 Romina (8 años)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChildId('regina');
                    soundFX.playPop();
                  }}
                  className={`p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    childId === 'regina'
                      ? 'border-purple-400 bg-purple-500/30 text-white shadow'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>💜 Regina (10 años)</span>
                </button>
              </div>
            </div>

            {/* Quick Reason Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                Motivo de la Infracción *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setReason(r);
                      soundFX.playPop();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      reason === r
                        ? 'bg-amber-400 text-slate-950 font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setReason('custom');
                    soundFX.playPop();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    reason === 'custom'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Otro motivo personalizado ✍️
                </button>
              </div>

              {reason === 'custom' && (
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Escribe el motivo exacto de la multa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              )}
            </div>

            {/* Photo Evidence Upload (Drag and Drop & click) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Foto de Evidencia de la Infracción (ej. Ropa tirada) 📸
                </label>
                <span className="text-[11px] text-blue-300">
                  ¡Toma la foto donde se vea la falta!
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {!imageDataUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-amber-400 bg-amber-400/20'
                      : 'border-slate-700 hover:border-amber-400/80 bg-slate-800/50 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 mx-auto flex items-center justify-center mb-1.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Arrastra la foto de la evidencia o haz clic para tomarla
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nan puede tomar la foto de la ropa en el piso, juguetes regados, etc.
                  </p>
                  <span className="inline-block mt-2.5 px-3 py-1 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow hover:bg-amber-300">
                    Tomar o Elegir Foto 📸
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 group">
                  <img
                    src={imageDataUrl}
                    alt="Evidencia de infracción"
                    className="w-full h-48 object-cover bg-slate-900"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow"
                    >
                      Cambiar Foto 🔄
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageDataUrl('')}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
                    >
                      Quitar Foto ✕
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase tracking-wider">
                    Evidencia Lista
                  </div>
                </div>
              )}
            </div>

            {/* Amount & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                  Monto de la Multa (MXN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm font-bold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-amber-400 font-semibold">
                    MXN a descontar
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Regla acordada: $5 pesos por multa.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                  Observaciones de Nan (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Se le avisó dos veces y no levantó su sudadera."
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-900/70">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2"
              >
                <BadgeAlert className="w-4 h-4 text-slate-950" />
                <span>Aplicar Multa (-${amount} MXN)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Issued Fines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-['Fredoka',sans-serif] text-slate-900 flex items-center gap-2">
            <span>Historial de Multas Levantadas</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {filteredFines.length}
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            Nan puede perdonar la multa si la niña rectifica de inmediato
          </span>
        </div>

        {filteredFines.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-emerald-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 font-['Fredoka',sans-serif]">
              ¡Cero multas activas! 🎉
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Las niñas tienen su cuarto ordenado, pasearon a Luna y tienen su ropa guardada. ¡Sigan así para llevarse sus $100 pesos completos!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFines.map((fine) => {
              const isRomina = fine.childId === 'romina';
              const isActiva = fine.status === 'activa';

              return (
                <div
                  key={fine.id}
                  className={`bg-white rounded-3xl border-2 p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActiva
                      ? isRomina
                        ? 'border-rose-200 hover:border-rose-300'
                        : 'border-purple-200 hover:border-purple-300'
                      : 'border-slate-200 opacity-75 bg-slate-50/60'
                  }`}
                >
                  <div>
                    {/* Top Row: Badge, Status, Amount */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                            isRomina
                              ? 'bg-rose-500 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {isRomina ? '🌸 Romina (8a)' : '💜 Regina (10a)'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isActiva
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isActiva ? '🚨 Multa Activa' : '😇 Perdonada'}
                        </span>
                      </div>

                      <div
                        className={`text-sm font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                          isActiva
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>-${fine.amount} MXN</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      {fine.reason}
                    </h4>

                    {fine.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                        &ldquo;{fine.notes}&rdquo;
                      </p>
                    )}

                    {/* Photo Evidence if present */}
                    {fine.imageDataUrl && (
                      <div
                        onClick={() => setZoomedFine(fine)}
                        className="relative rounded-2xl overflow-hidden mb-3 border border-slate-200 cursor-pointer group"
                      >
                        <img
                          src={fine.imageDataUrl}
                          alt="Foto de la falta"
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded backdrop-blur-sm flex items-center gap-1">
                          <Camera className="w-3 h-3 text-amber-300" />
                          <span>Foto de prueba de Nan</span>
                        </div>
                        <div className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer info & action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fine.date}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-500">
                        {fine.officer}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActiva ? (
                        <button
                          onClick={() => {
                            onForgiveFine(fine.id);
                            soundFX.playFanfare();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                          title="Nan puede perdonar la multa si la niña recogió su ropa"
                        >
                          <Smile className="w-3 h-3" />
                          <span>Perdonar</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Subsanada
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas eliminar esta multa del registro?')) {
                            onDeleteFine(fine.id);
                            soundFX.playPop();
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar multa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom Modal for fine evidence */}
      {zoomedFine && (
        <div
          onClick={() => setZoomedFine(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between animate-in zoom-in-95"
          >
            <div className="relative bg-black flex items-center justify-center max-h-[50vh] min-h-[160px] flex-1">
              {zoomedFine.imageDataUrl && (
                <img
                  src={zoomedFine.imageDataUrl}
                  alt={zoomedFine.reason}
                  className="max-h-[50vh] w-auto object-contain"
                />
              )}
              <button
                onClick={() => setZoomedFine(null)}
                className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white flex-shrink-0 border-t border-slate-100">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
                  Infracción por {zoomedFine.officer}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {zoomedFine.reason}
                </h3>
                {zoomedFine.notes && (
                  <p className="text-xs text-slate-600 truncate mt-0.5 italic">
                    &ldquo;{zoomedFine.notes}&rdquo;
                  </p>
                )}
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Multa a {zoomedFine.childId === 'romina' ? 'Romina' : 'Regina'} · -${zoomedFine.amount} MXN
                </span>
              </div>
              <button
                onClick={() => setZoomedFine(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex-shrink-0 cursor-pointer"
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
