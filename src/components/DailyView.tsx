import React from 'react';
import { 
  Check, 
  Clock, 
  Sparkles, 
  Droplet, 
  Utensils, 
  Dog, 
  Moon, 
  Music, 
  Globe, 
  Medal, 
  Heart, 
  Home, 
  Plus, 
  Trophy,
  AlertCircle,
  CalendarCheck,
  RotateCw,
  Coins,
  Camera,
  ShieldAlert,
  WifiOff
} from 'lucide-react';
import { RoutineTask, ChildId, FamilyActivity, BonusLogEntry } from '../types';
import { soundFX } from '../utils/audio';
import { formatDateKey } from '../utils/scheduleGenerator';
import { LunaFrenchPoodle } from './LunaFrenchPoodle';
import { DailyFunFactWidget } from './DailyFunFactWidget';

interface DailyViewProps {
  currentDate: Date;
  tasks: RoutineTask[];
  completions: Record<string, boolean>;
  onToggleTask: (taskId: string, childId: ChildId) => void;
  selectedChild: ChildId | 'both';
  onOpenAddCustomModal: () => void;
  onOpenFamilyModal: () => void;
  todayFamilyActivity?: FamilyActivity;
  hasLunaDuty: boolean;
  bonusLogs?: BonusLogEntry[];
  onOpenRoulette?: () => void;
  onOpenUploadEvidence?: (task?: RoutineTask, childId?: ChildId) => void;
  activeFinesCount?: number;
  onNavigateToFines?: () => void;
  onNavigateToEvidences?: () => void;
  activeUser?: string;
  onShareToChat?: (text: string) => void;
  isOnline?: boolean;
  pendingChangesCount?: number;
}

export const DailyView: React.FC<DailyViewProps> = ({
  currentDate,
  tasks,
  completions,
  onToggleTask,
  selectedChild,
  onOpenAddCustomModal,
  onOpenFamilyModal,
  todayFamilyActivity,
  hasLunaDuty,
  bonusLogs = [],
  onOpenRoulette,
  onOpenUploadEvidence,
  activeFinesCount = 0,
  onNavigateToFines,
  onNavigateToEvidences,
  activeUser,
  onShareToChat,
  isOnline = true,
  pendingChangesCount = 0,
}) => {
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isGymDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
  const isThursday = dayOfWeek === 4;
  const isSunday = dayOfWeek === 0;

  // Filter tasks based on selected child
  const relevantTasksForChild = (child: ChildId) => {
    return tasks.filter((t) => t.assignedTo === child || t.assignedTo === 'both');
  };

  const getTaskStatus = (task: RoutineTask, child: ChildId): boolean => {
    const key = `${task.id}_${child}`;
    return !!completions[key];
  };

  // Calculate metrics for Romina
  const rominaTasks = relevantTasksForChild('romina');
  const rominaCompletedCount = rominaTasks.filter((t) => getTaskStatus(t, 'romina')).length;
  const rominaTotalCount = rominaTasks.length;
  const rominaPercent = rominaTotalCount > 0 ? Math.round((rominaCompletedCount / rominaTotalCount) * 100) : 0;
  const rominaPointsToday = rominaTasks
    .filter((t) => getTaskStatus(t, 'romina'))
    .reduce((sum, t) => sum + t.points, 0);

  // Calculate metrics for Regina
  const reginaTasks = relevantTasksForChild('regina');
  const reginaCompletedCount = reginaTasks.filter((t) => getTaskStatus(t, 'regina')).length;
  const reginaTotalCount = reginaTasks.length;
  const reginaPercent = reginaTotalCount > 0 ? Math.round((reginaCompletedCount / reginaTotalCount) * 100) : 0;
  const reginaPointsToday = reginaTasks
    .filter((t) => getTaskStatus(t, 'regina'))
    .reduce((sum, t) => sum + t.points, 0);

  // Group tasks for display
  const displayTasks = tasks.filter((t) => {
    if (selectedChild === 'both') return true;
    return t.assignedTo === selectedChild || t.assignedTo === 'both';
  });

  const morningTasks = displayTasks.filter((t) => t.timeCategory === 'morning');
  const afternoonTasks = displayTasks.filter((t) => t.timeCategory === 'afternoon');
  const eveningTasks = displayTasks.filter((t) => t.timeCategory === 'evening');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dog': return <Dog className="w-5 h-5 text-amber-600" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'Home': return <Home className="w-5 h-5 text-emerald-600" />;
      case 'Music': return <Music className="w-5 h-5 text-rose-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-green-600" />;
      case 'Medal': return <Medal className="w-5 h-5 text-amber-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      default: return <CalendarCheck className="w-5 h-5 text-slate-500" />;
    }
  };

  const renderTaskCard = (task: RoutineTask) => {
    // When viewing 'both' and task is assigned to 'both', we render checkboxes for Romina and Regina
    const isAssignedBoth = task.assignedTo === 'both';
    const rominaChecked = getTaskStatus(task, 'romina');
    const reginaChecked = getTaskStatus(task, 'regina');

    return (
      <div
        key={task.id}
        className={`p-4 rounded-2xl border transition-all duration-200 ${
          (selectedChild === 'romina' && rominaChecked) ||
          (selectedChild === 'regina' && reginaChecked) ||
          (selectedChild === 'both' && (
            (isAssignedBoth && rominaChecked && reginaChecked) ||
            (!isAssignedBoth && ((task.assignedTo === 'romina' && rominaChecked) || (task.assignedTo === 'regina' && reginaChecked)))
          ))
            ? 'bg-slate-50/80 border-slate-200 opacity-80'
            : 'bg-white border-amber-100/80 shadow-sm hover:shadow-md hover:border-amber-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100 flex-shrink-0 mt-0.5">
              {getIcon(task.iconName)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Time badge */}
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {task.timeSlot}
                </span>

                {/* Assigned child badge */}
                {task.assignedTo === 'romina' && (
                  <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                    🌸 Romina
                  </span>
                )}
                {task.assignedTo === 'regina' && (
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                    💜 Regina
                  </span>
                )}
                {task.assignedTo === 'both' && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    👨‍👩‍👧‍👧 Ambas
                  </span>
                )}

                {/* Points badge */}
                <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  +{task.points} pts
                </span>

                {task.isEveryTwoDays && (
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                    Cada 2 días
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-800 leading-snug">
                {task.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {task.description}
              </p>
            </div>
          </div>

          {/* Right action checkboxes */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
            {/* If task is for Romina or Both */}
            {(task.assignedTo === 'romina' || (task.assignedTo === 'both' && (selectedChild === 'romina' || selectedChild === 'both'))) && (
              <button
                id={`check-task-${task.id}-romina`}
                onClick={() => onToggleTask(task.id, 'romina')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  rominaChecked
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                }`}
              >
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${rominaChecked ? 'bg-white text-rose-600 border-white' : 'border-rose-400'}`}>
                  {rominaChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{selectedChild === 'both' ? 'Romina' : (rominaChecked ? '¡Listo!' : 'Marcar')}</span>
              </button>
            )}

            {/* If task is for Regina or Both */}
            {(task.assignedTo === 'regina' || (task.assignedTo === 'both' && (selectedChild === 'regina' || selectedChild === 'both'))) && (
              <button
                id={`check-task-${task.id}-regina`}
                onClick={() => onToggleTask(task.id, 'regina')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  reginaChecked
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80'
                }`}
              >
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${reginaChecked ? 'bg-white text-purple-600 border-white' : 'border-purple-400'}`}>
                  {reginaChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{selectedChild === 'both' ? 'Regina' : (reginaChecked ? '¡Listo!' : 'Marcar')}</span>
              </button>
            )}

            {/* Quick Upload Evidence Photo Button */}
            {onOpenUploadEvidence && (
              <button
                id={`upload-evidence-${task.id}`}
                onClick={() => onOpenUploadEvidence(
                  task,
                  task.assignedTo === 'both' 
                    ? (selectedChild === 'regina' ? 'regina' : 'romina') 
                    : task.assignedTo
                )}
                className="p-2 rounded-xl text-slate-500 hover:text-purple-700 bg-slate-100/80 hover:bg-purple-50 border border-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
                title="Subir foto de evidencia de esta actividad"
              >
                <Camera className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Mama Daily Reminder Card */}
      {(() => {
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return (
          <div className="p-3.5 sm:p-4 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50/60 to-amber-50 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                👩‍👧‍👧
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                    Recordatorio de Mamá
                  </span>
                  {isWeekend ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                      🏖️ Sábado y Domingo: Sin tareas de la escuela
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                      📚 Día escolar: Hacer tareas concentradas
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  {isWeekend 
                    ? '¡Mamá las ama con todo el corazón! Recuerden cumplir sus misiones de casa, cepillarse y consentir a Luna 🐶' 
                    : '¡Mamá las ama con todo su corazón! Recuerden hacer sus tareas de la escuela y cumplir sus misiones con alegría ✨'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Nan Police Surveillance Banner */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
        activeFinesCount > 0 
          ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-300'
          : 'bg-gradient-to-r from-slate-900 to-amber-950 text-white border-amber-500/40'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
            activeFinesCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
          }`}>
            👮‍♀️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                activeFinesCount > 0 ? 'bg-rose-200 text-rose-900' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              }`}>
                Patrulla Oficial Nan
              </span>
              {activeFinesCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                  {activeFinesCount} {activeFinesCount === 1 ? 'multa activa (-$5)' : 'multas activas (-$5 c/u)'}
                </span>
              )}
            </div>
            <h4 className={`text-sm font-bold mt-0.5 ${activeFinesCount > 0 ? 'text-slate-900' : 'text-amber-100'}`}>
              {activeFinesCount > 0 
                ? '¡Atención! Hay multas pendientes por ropa tirada o actividades sin cumplir' 
                : '¡Todo en orden! Sin multas registradas hoy. ¡Cuelguen su ropa y paseen a Luna!'}
            </h4>
            <p className={`text-xs ${activeFinesCount > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
              La policía Nan descuenta $5 pesos por ropa tirada, no pasear a Luna o no cumplir horarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {onNavigateToFines && (
            <button
              id="goto-fines-banner-btn"
              onClick={onNavigateToFines}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                activeFinesCount > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Ver Multas Nan</span>
            </button>
          )}

          {onNavigateToEvidences && (
            <button
              id="goto-evidences-banner-btn"
              onClick={onNavigateToEvidences}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFinesCount > 0
                  ? 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Galería Evidencias</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Romina Card */}
        {(selectedChild === 'romina' || selectedChild === 'both') && (
          <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 p-5 rounded-3xl border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 font-['Fredoka',sans-serif] text-lg">
                    Romina (8 años)
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">
                    {rominaCompletedCount} de {rominaTotalCount} actividades listas hoy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-['Fredoka',sans-serif] text-rose-600">
                  {rominaPercent}%
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-rose-800 font-bold">
                  +{rominaPointsToday} pts ganados
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-rose-200/70 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${rominaPercent}%` }}
              />
            </div>

            {rominaPercent === 100 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-900 bg-rose-100/90 py-1 px-2.5 rounded-xl border border-rose-300 animate-pulse">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                ¡Meta del 100% alcanzada hoy por Romina! 🎉
              </div>
            )}
          </div>
        )}

        {/* Regina Card */}
        {(selectedChild === 'regina' || selectedChild === 'both') && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5 rounded-3xl border border-purple-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 font-['Fredoka',sans-serif] text-lg">
                    Regina (10 años)
                  </h3>
                  <p className="text-xs text-purple-700 font-medium">
                    {reginaCompletedCount} de {reginaTotalCount} actividades listas hoy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-['Fredoka',sans-serif] text-purple-600">
                  {reginaPercent}%
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold">
                  +{reginaPointsToday} pts ganados
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-purple-200/70 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${reginaPercent}%` }}
              />
            </div>

            {reginaPercent === 100 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-purple-100/90 py-1 px-2.5 rounded-xl border border-purple-300 animate-pulse">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                ¡Meta del 100% alcanzada hoy por Regina! 🎉
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special Highlights Banners */}
      <div className="space-y-3">
        {/* Luna 2-Day Care Banner */}
        {hasLunaDuty && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/90 via-sky-50 to-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl border border-amber-200 shadow-xs flex items-center justify-center p-1 flex-shrink-0">
                <LunaFrenchPoodle size="sm" showBark={false} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md mb-0.5">
                    Misión especial de hoy (Cada 2 días)
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    French Poodle blanca con orejitas negritas 🐩🤍🖤
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  ¡Hoy toca cuidado profundo de Luna! 🐶
                </h4>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-rose-700">Romina:</span> ponerle agua fresca limpia 💧 ·{' '}
                  <span className="font-semibold text-purple-700">Regina:</span> rellenar su bote de comida 🥣
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-amber-800 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto">
              +10 pts c/u
            </div>
          </div>
        )}

        {/* Gymnastics Day Banner */}
        {isGymDay && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100/90 via-indigo-50 to-pink-50 border border-purple-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-sm">
                <Medal className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md mb-0.5">
                  Día de Gimnasia (Lun, Mié, Vie)
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  ¡Entrenamiento de 6:00 a 8:00 PM! 🤸‍♀️
                </h4>
                <p className="text-xs text-slate-600">
                  ⏰ <span className="font-bold text-purple-800">5:00 PM súper puntuales:</span> Leotardo puesto, agua, magnesia y dientes lavados. (Piano y Duolingo pasan a las 8:30 PM).
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-200 self-start sm:self-auto">
              +40 pts totales
            </span>
          </div>
        )}

        {/* Thursday Family Activity Banner */}
        {isThursday && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-100/90 via-amber-50 to-rose-50 border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-sm">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md mb-0.5">
                  ¡Hoy es Jueves de Familia!
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  {todayFamilyActivity ? todayFamilyActivity.title : 'Actividad especial en familia'}
                </h4>
                <p className="text-xs text-slate-600">
                  {todayFamilyActivity ? todayFamilyActivity.description : 'Leer un libro, salir a caminar, hornear algo rico o jugar juntos.'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenFamilyModal}
              className="py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Ver / Modificar Actividad
            </button>
          </div>
        )}

        {/* Sunday Cleaning Banner */}
        {isSunday && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-100/90 to-teal-50 border border-emerald-300 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md mb-0.5">
                  Domingo por la mañana
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Aseo y orden del cuarto 🧹
                </h4>
                <p className="text-xs text-slate-600">
                  Tender camas, guardar juguetes y doblar ropa limpia para iniciar la semana con alegría.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
              +25 pts
            </span>
          </div>
        )}
      </div>

      {/* Motivational Widget: Dato Curioso del Día (Perritos o Ciencia) */}
      <DailyFunFactWidget
        currentDate={currentDate}
        activeUser={activeUser}
        onShareToChat={onShareToChat}
      />

      {/* Offline Mode Reassurance Banner in Daily Routines */}
      {!isOnline && (
        <div 
          id="daily-offline-notice"
          className="bg-amber-100/90 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 text-xs shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                Modo Offline activo: Las niñas pueden seguir marcando sus rutinas con normalidad
              </span>
              <p className="text-[11px] text-amber-850 mt-0.5">
                Tus palomitas, puntos acumulados y celebraciones se guardan de inmediato en este dispositivo y se sincronizarán con la nube en segundo plano cuando vuelva la conexión.
              </p>
            </div>
          </div>
          {pendingChangesCount > 0 && (
            <span className="bg-amber-200 text-amber-950 border border-amber-400/60 text-xs font-black px-3 py-1 rounded-xl whitespace-nowrap self-end sm:self-auto">
              💾 {pendingChangesCount} {pendingChangesCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
            </span>
          )}
        </div>
      )}

      {/* Routine Timeline Sections */}
      <div className="space-y-6">
        {/* Morning Section */}
        {morningTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-['Fredoka',sans-serif] text-slate-800 flex items-center gap-2">
                <span>🌅 Rutinas de la Mañana</span>
                <span className="text-xs font-normal text-slate-500">
                  ({morningTasks.length} actividades)
                </span>
              </h3>
            </div>
            <div className="space-y-3">
              {morningTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Afternoon Section */}
        {afternoonTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-['Fredoka',sans-serif] text-slate-800 flex items-center gap-2">
                <span>☀️ Rutinas de la Tarde</span>
                <span className="text-xs font-normal text-slate-500">
                  ({afternoonTasks.length} actividades)
                </span>
              </h3>
            </div>
            <div className="space-y-3">
              {afternoonTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Evening Section */}
        {eveningTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-['Fredoka',sans-serif] text-slate-800 flex items-center gap-2">
                <span>🌙 Rutinas de la Noche</span>
                <span className="text-xs font-normal text-slate-500">
                  ({eveningTasks.length} actividades)
                </span>
              </h3>
            </div>
            <div className="space-y-3">
              {eveningTasks.map(renderTaskCard)}
            </div>
          </div>
        )}
      </div>

      {/* Screen-Free Daily Bonus Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border-2 border-amber-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <RotateCw className="w-4 h-4 text-rose-600" />
            </span>
            <div>
              <h3 className="text-base font-bold font-['Fredoka',sans-serif] text-slate-800">
                Bono Sin Pantalla del Día (Anti-iPad) 🎨
              </h3>
              <p className="text-xs text-slate-500">
                Regla familiar: Máximo 1 actividad extra al día para disfrutar tiempo de calidad
              </p>
            </div>
          </div>

          {onOpenRoulette && (
            <button
              onClick={onOpenRoulette}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow transition-transform hover:scale-105"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar Ruleta 🎡</span>
            </button>
          )}
        </div>

        {/* Display today's claimed bonuses if any */}
        {(() => {
          const todayDateStr = formatDateKey(currentDate);
          const relevantBonusLogs = (bonusLogs || []).filter(
            (b) =>
              b.date === todayDateStr &&
              (selectedChild === 'both' || b.childId === selectedChild)
          );

          if (relevantBonusLogs.length === 0) {
            return (
              <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Hoy aún no han registrado su actividad sin pantalla (leer libro, rompecabezas, etc.).
                </span>
                {onOpenRoulette && (
                  <button
                    onClick={onOpenRoulette}
                    className="text-rose-600 font-bold hover:underline self-start sm:self-auto"
                  >
                    ¿Qué suerte toca hoy? Girar Ruleta &rarr;
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-2">
              {relevantBonusLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-white rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between flex-wrap gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        log.childId === 'romina' ? 'bg-rose-500' : 'bg-purple-600'
                      }`}
                    >
                      {log.childId === 'romina' ? 'Romi' : 'Regi'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {log.childId === 'romina' ? 'Romina' : 'Regina'} · Bono cumplido hoy (1/1)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <Coins className="w-3.5 h-3.5" />
                    +${log.pesosReward} MXN (+{log.points} pts)
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Action to Add Custom Task for Today */}
      <div className="pt-2 flex justify-center">
        <button
          id="add-custom-task-btn"
          onClick={onOpenAddCustomModal}
          className="flex items-center gap-2 py-3 px-6 bg-white hover:bg-amber-50 text-amber-900 font-bold text-sm rounded-2xl border-2 border-dashed border-amber-300 shadow-sm hover:shadow transition-all group"
        >
          <Plus className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span>+ Agregar Tarea Especial para Hoy</span>
        </button>
      </div>
    </div>
  );
};
