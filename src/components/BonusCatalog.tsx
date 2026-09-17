import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Bed, 
  UtensilsCrossed, 
  Palette, 
  Puzzle, 
  Dog, 
  Flower2, 
  Bike, 
  ChefHat, 
  PenTool, 
  Briefcase, 
  Plus, 
  Trash2,
  CheckCircle,
  Coins,
  RotateCw,
  Clock,
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import { ScreenFreeBonus, ChildId, BonusLogEntry } from '../types';
import { SCREEN_FREE_BONUSES, formatDateKey } from '../utils/scheduleGenerator';
import { soundFX } from '../utils/audio';
import { RouletteModal } from './RouletteModal';

interface BonusCatalogProps {
  bonusLogs: BonusLogEntry[];
  onClaimBonus: (bonus: ScreenFreeBonus, childId: ChildId) => void;
  onRemoveBonusLog: (logId: string) => void;
  selectedChild: ChildId | 'both';
  currentDate: Date;
}

export const BonusCatalog: React.FC<BonusCatalogProps> = ({
  bonusLogs,
  onClaimBonus,
  onRemoveBonusLog,
  selectedChild,
  currentDate,
}) => {
  const [activeChild, setActiveChild] = useState<ChildId>(
    selectedChild === 'both' ? 'romina' : selectedChild
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState(15);
  const [customPesos, setCustomPesos] = useState(8);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<{
    childId: ChildId;
    bonus: ScreenFreeBonus;
    nextSuggested: ScreenFreeBonus;
  } | null>(null);

  const todayKey = formatDateKey(currentDate);

  // Check 1 daily bonus rule per child
  const rominaClaimedToday = useMemo(
    () => bonusLogs.some((b) => b.childId === 'romina' && b.date === todayKey),
    [bonusLogs, todayKey]
  );

  const reginaClaimedToday = useMemo(
    () => bonusLogs.some((b) => b.childId === 'regina' && b.date === todayKey),
    [bonusLogs, todayKey]
  );

  const activeChildClaimedToday = activeChild === 'romina' ? rominaClaimedToday : reginaClaimedToday;

  const categories = ['all', 'Lectura', 'Hogar', 'Creatividad', 'Juegos', 'Luna', 'Deporte'];

  const filteredBonuses = SCREEN_FREE_BONUSES.filter((b) => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  const getBonusIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'Bed': return <Bed className="w-5 h-5 text-amber-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-emerald-600" />;
      case 'Palette': return <Palette className="w-5 h-5 text-pink-600" />;
      case 'Puzzle': return <Puzzle className="w-5 h-5 text-purple-600" />;
      case 'Dog': return <Dog className="w-5 h-5 text-amber-600" />;
      case 'Flower2': return <Flower2 className="w-5 h-5 text-green-600" />;
      case 'Bike': return <Bike className="w-5 h-5 text-sky-600" />;
      case 'ChefHat': return <ChefHat className="w-5 h-5 text-orange-600" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-purple-600" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-slate-600" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleClaim = (bonus: ScreenFreeBonus) => {
    if (activeChildClaimedToday) return;

    onClaimBonus(bonus, activeChild);
    soundFX.playFanfare();

    // Automatically assign/suggest the next bonus challenge
    const currentIndex = SCREEN_FREE_BONUSES.findIndex((b) => b.id === bonus.id);
    const nextBonus = SCREEN_FREE_BONUSES[(currentIndex + 1) % SCREEN_FREE_BONUSES.length];

    setRecentlyCompleted({
      childId: activeChild,
      bonus,
      nextSuggested: nextBonus,
    });
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || activeChildClaimedToday) return;

    const customBonus: ScreenFreeBonus = {
      id: `custom-bonus-${Date.now()}`,
      title: customTitle.trim(),
      description: 'Actividad creativa sin pantalla inventada en familia.',
      points: Number(customPoints) || 15,
      pesosReward: Number(customPesos) || 8,
      iconName: 'Sparkles',
      category: 'Especial',
    };

    onClaimBonus(customBonus, activeChild);
    setCustomTitle('');
    setShowCustomModal(false);
    soundFX.playFanfare();

    setRecentlyCompleted({
      childId: activeChild,
      bonus: customBonus,
      nextSuggested: SCREEN_FREE_BONUSES[0],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Intro Banner with Roulette Trigger */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Cero Pantallas · Máximo 1 Bono Diario
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif]">
              Bonos Extras Sin Pantallas 🎨📚
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1.5 leading-relaxed">
              En lugar de estar en el iPad, ganen puntos y pesos en efectivo haciendo actividades creativas y del hogar. 
              <strong> Máximo 1 bono diario por niña</strong> para que valoren su tiempo de calidad.
            </p>

            {/* Daily Status Indicators */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                rominaClaimedToday 
                  ? 'bg-emerald-500/30 text-white border-emerald-300/40' 
                  : 'bg-white/20 text-white border-white/20'
              }`}>
                <span>🌸 Romina:</span>
                <span className="font-extrabold">
                  {rominaClaimedToday ? '✅ 1/1 Bono completado hoy' : '⏳ 0/1 Disponible hoy'}
                </span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                reginaClaimedToday 
                  ? 'bg-emerald-500/30 text-white border-emerald-300/40' 
                  : 'bg-white/20 text-white border-white/20'
              }`}>
                <span>💜 Regina:</span>
                <span className="font-extrabold">
                  {reginaClaimedToday ? '✅ 1/1 Bono completado hoy' : '⏳ 0/1 Disponible hoy'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA & Child Selector */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
            {/* Roulette Button */}
            <button
              id="open-roulette-btn"
              onClick={() => {
                setShowRouletteModal(true);
                soundFX.playPop();
              }}
              className="px-5 py-3 bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm sm:text-base rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 font-['Fredoka',sans-serif] group"
            >
              <RotateCw className="w-5 h-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              <span>Girar Ruleta de la Suerte 🎡</span>
            </button>

            {/* Child Selector for Manual Claim */}
            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 flex items-center justify-between sm:justify-start gap-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider pl-2 pr-1 hidden sm:inline">
                Ver para:
              </span>
              <button
                id="claim-for-romina-btn"
                onClick={() => {
                  setActiveChild('romina');
                  soundFX.playPop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeChild === 'romina'
                    ? 'bg-white text-rose-700 shadow-md font-extrabold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                🌸 Romina
              </button>
              <button
                id="claim-for-regina-btn"
                onClick={() => {
                  setActiveChild('regina');
                  soundFX.playPop();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeChild === 'regina'
                    ? 'bg-white text-purple-800 shadow-md font-extrabold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                💜 Regina
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice if active child reached limit */}
      {activeChildClaimedToday && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                ¡{activeChild === 'romina' ? 'Romina' : 'Regina'} ya cumplió su bono sin pantalla de hoy! 🎉
              </h4>
              <p className="text-xs text-emerald-700">
                La regla es máximo 1 diario para concentrarse en su día. Mañana estará disponible otro reto.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveChild(activeChild === 'romina' ? 'regina' : 'romina');
              soundFX.playPop();
            }}
            className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm hover:bg-emerald-100/50"
          >
            Cambiar a {activeChild === 'romina' ? 'Regina' : 'Romina'} &rarr;
          </button>
        </div>
      )}

      {/* Automatically Suggested Next Challenge Notification */}
      {recentlyCompleted && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md mb-1 inline-block">
                ¡Bono registrado con éxito! 🏆
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span>{recentlyCompleted.childId === 'romina' ? 'Romina' : 'Regina'} completó:</span>
                <span className="text-rose-600">&ldquo;{recentlyCompleted.bonus.title}&rdquo;</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Reto sugerido automáticamente para mañana:</span>
                <strong className="text-purple-900">{recentlyCompleted.nextSuggested.title}</strong>
              </p>
            </div>

            <button
              onClick={() => setRecentlyCompleted(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Pills & Invent Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                soundFX.playPop();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRouletteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-rose-500" />
            Ruleta
          </button>

          <button
            id="custom-bonus-btn"
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Inventar Actividad
          </button>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBonuses.map((bonus) => (
          <div
            key={bonus.id}
            className="p-5 rounded-3xl bg-white border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100 group-hover:scale-105 transition-transform">
                  {getBonusIcon(bonus.iconName)}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    +{bonus.points} pts
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-0.5">
                    <Coins className="w-3 h-3 text-emerald-600" />
                    +${bonus.pesosReward} MXN
                  </span>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {bonus.category}
              </span>

              <h4 className="text-base font-bold text-slate-800 leading-snug mb-1">
                {bonus.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {bonus.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Para: <span className="font-bold text-slate-700">{activeChild === 'romina' ? 'Romina' : 'Regina'}</span>
              </span>

              <button
                onClick={() => handleClaim(bonus)}
                disabled={activeChildClaimedToday}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  activeChildClaimedToday
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : activeChild === 'romina'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{activeChildClaimedToday ? '1/1 Hecho hoy' : '¡Completado!'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* History of Claimed Screen-Free Activities */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold font-['Fredoka',sans-serif] text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Historial de Actividades Sin Pantalla</span>
        </h3>

        {bonusLogs.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Aún no han registrado actividades extras. ¡Gira la ruleta o elige una del catálogo arriba!
          </p>
        ) : (
          <div className="space-y-2.5">
            {bonusLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    log.childId === 'romina' ? 'bg-rose-500' : 'bg-purple-600'
                  }`}>
                    {log.childId === 'romina' ? 'Romi' : 'Regi'}
                  </div>

                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                      {log.title}
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      {log.childId === 'romina' ? 'Romina' : 'Regina'} · {log.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    +${log.pesosReward} MXN ({log.points} pts)
                  </span>

                  <button
                    onClick={() => onRemoveBonusLog(log.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Deshacer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roulette Wheel Modal */}
      <RouletteModal
        isOpen={showRouletteModal}
        onClose={() => setShowRouletteModal(false)}
        onClaimBonus={handleClaim}
        selectedChild={activeChild}
        onSelectChild={setActiveChild}
        hasClaimedToday={(cid) => (cid === 'romina' ? rominaClaimedToday : reginaClaimedToday)}
      />

      {/* Modal for Inventing Custom Bonus */}
      {showCustomModal && (
        <div 
          onClick={() => setShowCustomModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border-2 border-amber-300 relative flex flex-col justify-between overflow-hidden animate-in zoom-in-95"
          >
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h4 className="text-sm sm:text-base font-bold font-['Fredoka',sans-serif] text-slate-800 mb-0.5 pr-6">
                Inventar Actividad Sin Pantalla ✨
              </h4>
              <p className="text-[10px] text-slate-500 mb-2">
                Crea una actividad divertida sin pantallas y define su recompensa.
              </p>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                  ¿Qué actividad hizo? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ayudó a bañar a Luna, cartas a los abuelos..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                    Puntos extras
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="5"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                    Pesos ($ MXN)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customPesos}
                    onChange={(e) => setCustomPesos(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={activeChildClaimedToday}
                  className={`px-3 py-1 rounded-xl font-bold text-xs shadow-2xs cursor-pointer ${
                    activeChildClaimedToday
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {activeChildClaimedToday ? 'Límite alcanzado' : 'Guardar y Reclamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
