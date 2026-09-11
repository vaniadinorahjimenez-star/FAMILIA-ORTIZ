import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Wallet, 
  Receipt, 
  Sparkles, 
  User, 
  Calendar as CalendarIcon, 
  Tag, 
  Check, 
  AlertCircle,
  HelpCircle,
  Car,
  ShoppingBag,
  Flower2,
  Dog,
  Shirt,
  Sparkle
} from 'lucide-react';
import { ChildId, ExtraPaymentConcept } from '../types';
import { soundFX } from '../utils/audio';

interface ManualExtraPaymentsSectionProps {
  extraPayments: ExtraPaymentConcept[];
  onAddExtraPayment: (payment: Omit<ExtraPaymentConcept, 'id' | 'timestamp'>) => void;
  onToggleStatus: (id: string) => void;
  onDeletePayment: (id: string) => void;
  selectedChild: ChildId | 'both';
  activeUser?: string;
}

const QUICK_SUGGESTIONS = [
  { title: 'Lavar y secar el coche con papá', amount: 35, category: 'auto', icon: Car },
  { title: 'Desempacar y guardar la despensa', amount: 20, category: 'mandado', icon: ShoppingBag },
  { title: 'Regar y cuidar plantas del jardín', amount: 15, category: 'cuidado', icon: Flower2 },
  { title: 'Bañar y cepillar a Luna con papá', amount: 30, category: 'cuidado', icon: Dog },
  { title: 'Doblar y guardar ropa limpia', amount: 20, category: 'hogar', icon: Shirt },
  { title: 'Barrer y ordenar patio o terraza', amount: 25, category: 'hogar', icon: Sparkle },
  { title: 'Ayudar a preparar cena especial', amount: 25, category: 'especial', icon: Sparkles },
  { title: 'Organizar clóset y cajones', amount: 20, category: 'hogar', icon: Sparkles },
];

export const ManualExtraPaymentsSection: React.FC<ManualExtraPaymentsSectionProps> = ({
  extraPayments = [],
  onAddExtraPayment,
  onToggleStatus,
  onDeletePayment,
  selectedChild,
  activeUser = 'Mamá',
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'romina' | 'regina' | 'pendiente' | 'pagado'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number | ''>(25);
  const [assignedChild, setAssignedChild] = useState<ChildId | 'both'>(
    selectedChild === 'both' ? 'romina' : selectedChild
  );
  const [date, setDate] = useState(todayStr);
  const [registeredBy, setRegisteredBy] = useState(
    activeUser.toLowerCase().includes('papa') ? 'Papá' : 'Mamá'
  );
  const [status, setStatus] = useState<'pendiente' | 'pagado'>('pendiente');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Calculations for running balance ("Llevar su cuenta")
  const totalConceptsCount = extraPayments.length;
  
  // Romina stats
  const rominaPayments = extraPayments.filter(p => p.childId === 'romina' || p.childId === 'both');
  const rominaPending = rominaPayments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount : p.amount), 0);
  const rominaPaid = rominaPayments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount : p.amount), 0);
  const rominaTotal = rominaPending + rominaPaid;

  // Regina stats
  const reginaPayments = extraPayments.filter(p => p.childId === 'regina' || p.childId === 'both');
  const reginaPending = reginaPayments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount : p.amount), 0);
  const reginaPaid = reginaPayments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount : p.amount), 0);
  const reginaTotal = reginaPending + reginaPaid;

  // Overall sums
  const overallPending = extraPayments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount * 2 : p.amount), 0);
  const overallPaid = extraPayments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + (p.childId === 'both' ? p.amount * 2 : p.amount), 0);
  const overallTotal = overallPending + overallPaid;

  // Filtered list
  const filteredPayments = extraPayments.filter(p => {
    if (filter === 'romina') return p.childId === 'romina' || p.childId === 'both';
    if (filter === 'regina') return p.childId === 'regina' || p.childId === 'both';
    if (filter === 'pendiente') return p.status === 'pendiente';
    if (filter === 'pagado') return p.status === 'pagado';
    return true;
  });

  const handleSelectQuickSuggestion = (item: typeof QUICK_SUGGESTIONS[0]) => {
    setConcept(item.title);
    setAmount(item.amount);
    soundFX.playPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      setFormError('Por favor escribe el concepto o tarea realizada.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('El monto debe ser un número mayor a 0 pesos.');
      return;
    }

    setFormError('');
    onAddExtraPayment({
      concept: concept.trim(),
      amount: Math.round(numAmount),
      childId: assignedChild,
      date: date || todayStr,
      registeredBy,
      status,
      notes: notes.trim() || undefined,
    });

    soundFX.playChime();

    // Reset form
    setConcept('');
    setAmount(25);
    setNotes('');
    setIsFormOpen(false);
  };

  const handleToggle = (id: string) => {
    onToggleStatus(id);
    soundFX.playCheck();
  };

  const handleDelete = (id: string) => {
    onDeletePayment(id);
    setDeleteConfirmId(null);
    soundFX.playPop();
  };

  return (
    <div id="manual-extra-payments-section" className="mt-8 bg-white rounded-3xl border-2 border-emerald-200/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative top pill badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                Otros Conceptos de Pago Manuales
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Lista de Cuenta
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Registra cualquier tarea, mandado o acuerdo especial por el que mamá o papá les pagan para llevar su cuenta clara al centavo.
            </p>
          </div>
        </div>

        <button
          id="btn-open-add-extra-payment"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            soundFX.playPop();
          }}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-sm hover:from-emerald-700 hover:to-teal-700 hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cerrar formulario' : '➕ Registrar Concepto de Pago'}</span>
        </button>
      </div>

      {/* Account Balances Summary Cards ("Llevar su cuenta") */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Por Cobrar (Pendiente)</span>
            </span>
            <span className="text-[10px] font-bold bg-amber-200/60 px-2 py-0.5 rounded-full text-amber-900">
              Por pagar
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] text-amber-950">
            ${overallPending} <span className="text-xs font-bold text-amber-700">MXN</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-800/80 mt-1 pt-1 border-t border-amber-200/50">
            <span>Romi: <strong>${rominaPending}</strong></span>
            <span>Regi: <strong>${reginaPending}</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ya Pagado / Entregado</span>
            </span>
            <span className="text-[10px] font-bold bg-emerald-200/60 px-2 py-0.5 rounded-full text-emerald-900">
              Liquidado
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] text-emerald-950">
            ${overallPaid} <span className="text-xs font-bold text-emerald-700">MXN</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800/80 mt-1 pt-1 border-t border-emerald-200/50">
            <span>Romi: <strong>${rominaPaid}</strong></span>
            <span>Regi: <strong>${reginaPaid}</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/70 p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-slate-600" />
              <span>Total Histórico Acumulado</span>
            </span>
            <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">
              {totalConceptsCount} registros
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] text-slate-900">
            ${overallTotal} <span className="text-xs font-bold text-slate-500">MXN</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200">
            <span>Romi: <strong>${rominaTotal}</strong></span>
            <span>Regi: <strong>${reginaTotal}</strong></span>
          </div>
        </div>
      </div>

      {/* Expandable Registration Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 sm:p-6 bg-emerald-50/60 rounded-3xl border border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Nuevo Concepto de Pago</span>
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Suma a su cuenta familiar
            </span>
          </div>

          {/* Quick suggestions chips */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 mb-1.5">
              Sugerencias rápidas (1 clic para autocompletar):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickSuggestion(item)}
                    className="text-xs py-1 px-2.5 rounded-full bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100/70 hover:border-emerald-300 transition-colors flex items-center gap-1.5 shadow-2xs font-medium"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.title}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded text-[10px]">
                      ${item.amount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Concept name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Concepto o Tarea Realizada *
              </label>
              <input
                type="text"
                id="input-extra-concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej: Lavar el coche con papá, guardar despensa, cuidar jardín..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monto a pagar ($ MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">$</span>
                <input
                  type="number"
                  id="input-extra-amount"
                  min="1"
                  max="1000"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="25"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-bold text-slate-800"
                  required
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[15, 20, 25, 30, 50].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => {
                      setAmount(quickVal);
                      soundFX.playPop();
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold ${
                      amount === quickVal
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ${quickVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned to */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ¿A quién corresponde el pago? *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  id="btn-child-romina"
                  onClick={() => setAssignedChild('romina')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition-all ${
                    assignedChild === 'romina'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <span>🌸 Romina</span>
                  <span className="text-[9px] opacity-80">(8 años)</span>
                </button>

                <button
                  type="button"
                  id="btn-child-regina"
                  onClick={() => setAssignedChild('regina')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition-all ${
                    assignedChild === 'regina'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <span>💜 Regina</span>
                  <span className="text-[9px] opacity-80">(10 años)</span>
                </button>

                <button
                  type="button"
                  id="btn-child-both"
                  onClick={() => setAssignedChild('both')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-0.5 transition-all ${
                    assignedChild === 'both'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <span>👭 Ambas</span>
                  <span className="text-[9px] opacity-80">($ c/u)</span>
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha</span>
              </label>
              <input
                type="date"
                id="input-extra-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
              />
            </div>

            {/* Registered / authorized by */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>¿Quién autoriza o paga?</span>
              </label>
              <select
                id="select-extra-authorizer"
                value={registeredBy}
                onChange={(e) => setRegisteredBy(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs font-medium"
              >
                <option value="Mamá">👩 Mamá</option>
                <option value="Papá">👨 Papá</option>
                <option value="Nan">👮‍♀️ Nan</option>
                <option value="Familia">🌟 Familia / Abuelos</option>
              </select>
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado inicial del pago:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="btn-status-pending"
                  onClick={() => setStatus('pendiente')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'pendiente'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏳ Pendiente de pago (Por liquidar)</span>
                </button>

                <button
                  type="button"
                  id="btn-status-paid"
                  onClick={() => setStatus('pagado')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'pagado'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✅ Ya entregado / Pagado en efectivo</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones o detalles adicionales (Opcional)
              </label>
              <input
                type="text"
                id="input-extra-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Secó los cristales con toalla, acomodó las cajas de cereal..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-extra-payment"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en la lista y sumar a la cuenta</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            id="filter-all"
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({extraPayments.length})
          </button>
          <button
            id="filter-romina"
            onClick={() => setFilter('romina')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              filter === 'romina'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🌸 Romina (${rominaTotal})
          </button>
          <button
            id="filter-regina"
            onClick={() => setFilter('regina')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              filter === 'regina'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            💜 Regina (${reginaTotal})
          </button>
          <button
            id="filter-pending"
            onClick={() => setFilter('pendiente')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              filter === 'pendiente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ⏳ Pendientes (${overallPending})
          </button>
          <button
            id="filter-paid"
            onClick={() => setFilter('pagado')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
              filter === 'pagado'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ✅ Pagados (${overallPaid})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          Haz clic en el botón de estado para cambiarlo (Pendiente ↔ Pagado)
        </span>
      </div>

      {/* List of Concepts */}
      {filteredPayments.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">
            No hay conceptos en esta vista
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Utiliza el botón superior para registrar cualquier favor, mandado o trabajo extra por el que pagues a las niñas.
          </p>
          <button
            onClick={() => {
              setIsFormOpen(true);
              soundFX.playPop();
            }}
            className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar primer concepto extra</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPayments.map((item) => {
            const isPending = item.status === 'pendiente';
            const isBoth = item.childId === 'both';
            const isRomina = item.childId === 'romina' || isBoth;
            const isRegina = item.childId === 'regina' || isBoth;

            return (
              <div
                key={item.id}
                id={`payment-concept-card-${item.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPending
                    ? 'bg-white border-amber-200/80 shadow-2xs hover:border-amber-300'
                    : 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs hover:border-emerald-300'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs ${
                      isBoth
                        ? 'bg-indigo-500 text-white'
                        : item.childId === 'romina'
                        ? 'bg-rose-500 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {isBoth ? '👭' : item.childId === 'romina' ? '🌸' : '💜'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isBoth
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.childId === 'romina'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {isBoth ? 'Ambas ($ c/u)' : item.childId === 'romina' ? 'Romina' : 'Regina'}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {item.date}
                      </span>

                      {item.registeredBy && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          • Autorizado por {item.registeredBy}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                      {item.concept}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls: Amount + Status Toggle Button + Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black font-['Fredoka',sans-serif] text-emerald-800 block">
                      +${item.amount} <span className="text-xs font-bold text-slate-500">MXN</span>
                    </span>
                    {isBoth && (
                      <span className="text-[10px] text-indigo-700 font-semibold block">
                        (${(item.amount * 2)} total)
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    id={`btn-toggle-status-${item.id}`}
                    onClick={() => handleToggle(item.id)}
                    title="Haz clic para alternar entre Pendiente y Pagado"
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                      isPending
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>⏳ Por pagar</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>✅ ¡Pagado!</span>
                      </>
                    )}
                  </button>

                  {/* Delete button */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700"
                        title="Confirmar eliminación"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-300"
                        title="Cancelar"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`btn-delete-${item.id}`}
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful note at bottom */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
        <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Llevar su cuenta al día:</strong> Los montos marcados como <em>«Por pagar»</em> se suman al cálculo semanal de cobro de cada hija. Al entregarles el dinero en efectivo, simplemente pulsa en el botón para marcarlo como <em>«¡Pagado!»</em> y quedará guardado en su historial para que no se les olvide ningún pago acordado.
        </p>
      </div>
    </div>
  );
};
