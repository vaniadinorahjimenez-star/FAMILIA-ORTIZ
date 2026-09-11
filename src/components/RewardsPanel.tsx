import React from 'react';
import { 
  Coins, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Heart,
  TrendingUp,
  Target,
  Flame
} from 'lucide-react';
import { ChildId, BonusLogEntry, WeekPayoutStatus, FineRecord, ExtraPaymentConcept, RoutineTask } from '../types';
import { soundFX } from '../utils/audio';
import { generateDailySchedule, formatDateKey } from '../utils/scheduleGenerator';
import { ManualExtraPaymentsSection } from './ManualExtraPaymentsSection';
import { WeeklyGoalProgress, ChildGoalData, CircularProgressRing } from './WeeklyGoalProgress';

interface RewardsPanelProps {
  currentDate: Date;
  completions: Record<string, boolean>;
  bonusLogs: BonusLogEntry[];
  fines?: FineRecord[];
  selectedChild: ChildId | 'both';
  weeklyPayouts: Record<string, WeekPayoutStatus>;
  onTogglePayout: (weekKey: string) => void;
  onNavigateToFines?: () => void;
  extraPayments?: ExtraPaymentConcept[];
  onAddExtraPayment?: (payment: Omit<ExtraPaymentConcept, 'id' | 'timestamp'>) => void;
  onToggleExtraPaymentStatus?: (id: string) => void;
  onDeleteExtraPayment?: (id: string) => void;
  activeUser?: string;
  customTasks?: RoutineTask[];
}

export const RewardsPanel: React.FC<RewardsPanelProps> = ({
  currentDate,
  completions,
  bonusLogs,
  fines = [],
  selectedChild,
  weeklyPayouts,
  onTogglePayout,
  onNavigateToFines,
  extraPayments = [],
  onAddExtraPayment,
  onToggleExtraPaymentStatus,
  onDeleteExtraPayment,
  activeUser,
  customTasks = [],
}) => {
  // Compute Monday to Sunday dates of the current week
  const curr = new Date(currentDate);
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(curr.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  // Week key format
  const year = monday.getFullYear();
  const d = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const weekKey = `${year}-W${String(weekNo).padStart(2, '0')}`;

  const sunday = weekDays[6];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const weekLabel = `${monday.getDate()} ${months[monday.getMonth()]} al ${sunday.getDate()} ${months[sunday.getMonth()]} de ${year}`;

  const isPaid = !!weeklyPayouts[weekKey]?.paid;

  // Calculate points and task counts for a child across the 7 days of this week
  const calculateChildWeekStats = (childId: ChildId) => {
    let regularPoints = 0;
    let totalWeekTasks = 0;
    let completedTasksCount = 0;
    const dailyPoints: { date: Date; dateStr: string; dayName: string; points: number }[] = [];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    weekDays.forEach((dayDate, idx) => {
      const dateStr = formatDateKey(dayDate);
      
      // Get base routine tasks for this day
      const daySchedule = generateDailySchedule(dayDate).filter(
        (t) => t.assignedTo === childId || t.assignedTo === 'both'
      );

      // Custom tasks matching this day and child
      const dayCustom = (customTasks || []).filter((t) => {
        const matchesChild = t.assignedTo === childId || t.assignedTo === 'both';
        const matchesDate = !t.id.includes('custom-date-') || t.id.includes(`custom-date-${dateStr}`);
        return matchesChild && matchesDate;
      });

      const allDayTasks = [...daySchedule, ...dayCustom];
      totalWeekTasks += allDayTasks.length;

      let dayPoints = 0;
      allDayTasks.forEach((task) => {
        const taskKey = `${task.id}_${childId}`;
        if (completions[taskKey]) {
          dayPoints += task.points;
          completedTasksCount++;
        }
      });

      dailyPoints.push({
        date: dayDate,
        dateStr,
        dayName: dayNames[idx],
        points: dayPoints,
      });

      regularPoints += dayPoints;
    });

    // Bonuses this week
    const weekStartStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const weekEndStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

    const childBonuses = bonusLogs.filter((b) => {
      return b.childId === childId && b.date >= weekStartStr && b.date <= weekEndStr;
    });

    const bonusPoints = childBonuses.reduce((sum, b) => sum + b.points, 0);
    const bonusPesos = childBonuses.reduce((sum, b) => sum + b.pesosReward, 0);

    // Active fines this week (Official Nan)
    const childFines = fines.filter((f) => {
      return f.childId === childId && f.status === 'activa' && f.date >= weekStartStr && f.date <= weekEndStr;
    });
    const finesDeduction = childFines.reduce((sum, f) => sum + f.amount, 0);

    // Extra manual payment concepts for this child
    const childExtraPayments = (extraPayments || []).filter(
      (p) => p.childId === childId || p.childId === 'both'
    );
    const extraPesosPending = childExtraPayments
      .filter((p) => p.status === 'pendiente')
      .reduce((sum, p) => sum + p.amount, 0);
    const extraPesosPaid = childExtraPayments
      .filter((p) => p.status === 'pagado')
      .reduce((sum, p) => sum + p.amount, 0);
    const extraPesosTotal = extraPesosPending + extraPesosPaid;

    // Goal for full week regular routines: 350 pts = $100 pesos (approx 50 pts/day)
    const WEEKLY_ROUTINE_TARGET = 350;
    const routinePercent = Math.min(100, Math.round((regularPoints / WEEKLY_ROUTINE_TARGET) * 100));
    const baseAllowanceEarned = Math.min(100, Math.round((routinePercent / 100) * 100));
    const totalWeeklyEarnings = Math.max(0, baseAllowanceEarned + bonusPesos - finesDeduction + extraPesosPending);

    const pointsRemaining = Math.max(0, WEEKLY_ROUTINE_TARGET - regularPoints);
    const avgPointsPerTask = 16.5;
    const tasksRemainingToGoal = pointsRemaining <= 0 ? 0 : Math.ceil(pointsRemaining / avgPointsPerTask);
    const isGoalReached = regularPoints >= WEEKLY_ROUTINE_TARGET;

    return {
      regularPoints,
      bonusPoints,
      bonusPesos,
      childFines,
      finesDeduction,
      extraPesosPending,
      extraPesosPaid,
      extraPesosTotal,
      childExtraPayments,
      routinePercent,
      baseAllowanceEarned,
      totalWeeklyEarnings,
      dailyPoints,
      childBonuses,
      totalWeekTasks,
      completedTasksCount,
      targetPoints: WEEKLY_ROUTINE_TARGET,
      pointsRemaining,
      tasksRemainingToGoal,
      isGoalReached,
    };
  };

  const rominaStats = calculateChildWeekStats('romina');
  const reginaStats = calculateChildWeekStats('regina');

  const rominaGoal: ChildGoalData = {
    childId: 'romina',
    name: 'Romina',
    age: 8,
    theme: 'rose',
    regularPoints: rominaStats.regularPoints,
    targetPoints: rominaStats.targetPoints,
    pointsRemaining: rominaStats.pointsRemaining,
    routinePercent: rominaStats.routinePercent,
    completedTasksCount: rominaStats.completedTasksCount,
    totalWeekTasks: rominaStats.totalWeekTasks,
    tasksRemainingToGoal: rominaStats.tasksRemainingToGoal,
    isGoalReached: rominaStats.isGoalReached,
    baseAllowanceEarned: rominaStats.baseAllowanceEarned,
  };

  const reginaGoal: ChildGoalData = {
    childId: 'regina',
    name: 'Regina',
    age: 10,
    theme: 'purple',
    regularPoints: reginaStats.regularPoints,
    targetPoints: reginaStats.targetPoints,
    pointsRemaining: reginaStats.pointsRemaining,
    routinePercent: reginaStats.routinePercent,
    completedTasksCount: reginaStats.completedTasksCount,
    totalWeekTasks: reginaStats.totalWeekTasks,
    tasksRemainingToGoal: reginaStats.tasksRemainingToGoal,
    isGoalReached: reginaStats.isGoalReached,
    baseAllowanceEarned: reginaStats.baseAllowanceEarned,
  };

  const handleToggle = () => {
    onTogglePayout(weekKey);
    soundFX.playFanfare();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Week Title & Status Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Semana Actual
              </span>
              <span className="text-xs text-emerald-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {weekLabel}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Fredoka',sans-serif]">
              Recompensas y Ganancias ($100 Pesos)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
              Cumplir el 100% de las rutinas de la semana equivale a los $100 pesos acordados. Además, las actividades sin pantalla suman bonos extras en efectivo.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <button
              id="toggle-payout-btn"
              onClick={handleToggle}
              className={`py-2.5 px-5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                isPaid
                  ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                  : 'bg-amber-400 hover:bg-amber-300 text-amber-950 hover:scale-105'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPaid ? '¡Semana Pagada! (Marcar pendiente)' : 'Entregar $100 Pesos (Marcar Pagado)'}</span>
            </button>
            {isPaid && (
              <span className="text-[11px] text-emerald-100 mt-1">
                Entregado por papá y mamá el domingo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Weekly Goal Component (Circular & Linear Progress with Tasks Remaining) */}
      <WeeklyGoalProgress
        rominaGoal={rominaGoal}
        reginaGoal={reginaGoal}
        selectedChild={selectedChild}
      />

      {/* Two Daughter Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Romina's Rewards Box */}
        {(selectedChild === 'romina' || selectedChild === 'both') && (
          <div className="bg-white p-6 rounded-3xl border-2 border-rose-200 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold font-['Fredoka',sans-serif] text-lg shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                    Romina (8 años)
                  </h3>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Meta semanal: $100 MXN
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black font-['Fredoka',sans-serif] text-slate-900">
                  ${rominaStats.totalWeeklyEarnings} <span className="text-sm font-bold text-slate-500">MXN</span>
                </span>
                <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Total a cobrar
                </span>
              </div>
            </div>

            {/* Weekly Routine Progress with Mini Circular Ring */}
            <div className="space-y-2 mb-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Target className="w-3.5 h-3.5 text-rose-500" />
                  <span>Avance de rutinas de la semana:</span>
                </div>
                <span className="text-rose-700 font-extrabold">{rominaStats.routinePercent}%</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-shrink-0">
                  <CircularProgressRing
                    percent={rominaStats.routinePercent}
                    size={58}
                    strokeWidth={6}
                    color="rose"
                    isCompleted={rominaStats.isGoalReached}
                    centerTopText={`${rominaStats.routinePercent}%`}
                    centerSubText=""
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="w-full h-3 bg-rose-200/80 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${rominaStats.routinePercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span>{rominaStats.regularPoints} de {rominaStats.targetPoints} pts</span>
                    {rominaStats.isGoalReached ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ¡Meta alcanzada! ($100 MXN)
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold bg-rose-100/80 px-2 py-0.5 rounded-md">
                        Faltan {rominaStats.tasksRemainingToGoal} {rominaStats.tasksRemainingToGoal === 1 ? 'tarea' : 'tareas'} (~{rominaStats.pointsRemaining} pts)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Por rutinas fijas:</span>
                <span className="text-base font-extrabold text-slate-800">
                  ${rominaStats.baseAllowanceEarned} MXN
                </span>
                <span className="text-[10px] text-slate-400 block">De los $100 base</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <span className="text-amber-800 block mb-0.5 font-semibold">Bonos sin pantallas:</span>
                <span className="text-base font-extrabold text-amber-700">
                  +${rominaStats.bonusPesos} MXN
                </span>
                <span className="text-[10px] text-amber-600 block">
                  {rominaStats.childBonuses.length} extras
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${rominaStats.finesDeduction > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                <span className={`block mb-0.5 font-semibold ${rominaStats.finesDeduction > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  Multas Nan 👮‍♀️:
                </span>
                <span className={`text-base font-extrabold ${rominaStats.finesDeduction > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {rominaStats.finesDeduction > 0 ? `-$${rominaStats.finesDeduction} MXN` : '$0 MXN'}
                </span>
                <span className={`text-[10px] block ${rominaStats.finesDeduction > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                  {rominaStats.childFines.length > 0 ? `${rominaStats.childFines.length} infracciones` : '¡Cero multas! 🎉'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200">
                <span className="text-teal-800 block mb-0.5 font-semibold">Otros pagos extras:</span>
                <span className="text-base font-extrabold text-teal-700">
                  +${rominaStats.extraPesosPending} MXN
                </span>
                <span className="text-[10px] text-teal-600 block">
                  {rominaStats.childExtraPayments.length} conceptos ({rominaStats.extraPesosPaid > 0 ? `$${rominaStats.extraPesosPaid} cobrados` : 'por cobrar'})
                </span>
              </div>
            </div>

            {/* Daily Routine Points Mini Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Puntos por día de esta semana
              </h5>
              <div className="grid grid-cols-7 gap-1 text-center">
                {rominaStats.dailyPoints.map((dp, i) => (
                  <div key={i} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-500">
                      {dp.dayName.slice(0, 3)}
                    </span>
                    <span className="text-xs font-black text-rose-700">
                      {dp.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regina's Rewards Box */}
        {(selectedChild === 'regina' || selectedChild === 'both') && (
          <div className="bg-white p-6 rounded-3xl border-2 border-purple-200 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold font-['Fredoka',sans-serif] text-lg shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                    Regina (10 años)
                  </h3>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    Meta semanal: $100 MXN
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black font-['Fredoka',sans-serif] text-slate-900">
                  ${reginaStats.totalWeeklyEarnings} <span className="text-sm font-bold text-slate-500">MXN</span>
                </span>
                <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Total a cobrar
                </span>
              </div>
            </div>

            {/* Weekly Routine Progress with Mini Circular Ring */}
            <div className="space-y-2 mb-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Target className="w-3.5 h-3.5 text-purple-600" />
                  <span>Avance de rutinas de la semana:</span>
                </div>
                <span className="text-purple-700 font-extrabold">{reginaStats.routinePercent}%</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-shrink-0">
                  <CircularProgressRing
                    percent={reginaStats.routinePercent}
                    size={58}
                    strokeWidth={6}
                    color="purple"
                    isCompleted={reginaStats.isGoalReached}
                    centerTopText={`${reginaStats.routinePercent}%`}
                    centerSubText=""
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="w-full h-3 bg-purple-200/80 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${reginaStats.routinePercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span>{reginaStats.regularPoints} de {reginaStats.targetPoints} pts</span>
                    {reginaStats.isGoalReached ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ¡Meta alcanzada! ($100 MXN)
                      </span>
                    ) : (
                      <span className="text-purple-700 font-bold bg-purple-100/80 px-2 py-0.5 rounded-md">
                        Faltan {reginaStats.tasksRemainingToGoal} {reginaStats.tasksRemainingToGoal === 1 ? 'tarea' : 'tareas'} (~{reginaStats.pointsRemaining} pts)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Por rutinas fijas:</span>
                <span className="text-base font-extrabold text-slate-800">
                  ${reginaStats.baseAllowanceEarned} MXN
                </span>
                <span className="text-[10px] text-slate-400 block">De los $100 base</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <span className="text-amber-800 block mb-0.5 font-semibold">Bonos sin pantallas:</span>
                <span className="text-base font-extrabold text-amber-700">
                  +${reginaStats.bonusPesos} MXN
                </span>
                <span className="text-[10px] text-amber-600 block">
                  {reginaStats.childBonuses.length} extras
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${reginaStats.finesDeduction > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                <span className={`block mb-0.5 font-semibold ${reginaStats.finesDeduction > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  Multas Nan 👮‍♀️:
                </span>
                <span className={`text-base font-extrabold ${reginaStats.finesDeduction > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {reginaStats.finesDeduction > 0 ? `-$${reginaStats.finesDeduction} MXN` : '$0 MXN'}
                </span>
                <span className={`text-[10px] block ${reginaStats.finesDeduction > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                  {reginaStats.childFines.length > 0 ? `${reginaStats.childFines.length} infracciones` : '¡Cero multas! 🎉'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200">
                <span className="text-teal-800 block mb-0.5 font-semibold">Otros pagos extras:</span>
                <span className="text-base font-extrabold text-teal-700">
                  +${reginaStats.extraPesosPending} MXN
                </span>
                <span className="text-[10px] text-teal-600 block">
                  {reginaStats.childExtraPayments.length} conceptos ({reginaStats.extraPesosPaid > 0 ? `$${reginaStats.extraPesosPaid} cobrados` : 'por cobrar'})
                </span>
              </div>
            </div>

            {/* Daily Routine Points Mini Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Puntos por día de esta semana
              </h5>
              <div className="grid grid-cols-7 gap-1 text-center">
                {reginaStats.dailyPoints.map((dp, i) => (
                  <div key={i} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-500">
                      {dp.dayName.slice(0, 3)}
                    </span>
                    <span className="text-xs font-black text-purple-700">
                      {dp.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transparent Weighting System Guide */}
      <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200 shadow-sm">
        <h4 className="text-base font-bold font-['Fredoka',sans-serif] text-amber-950 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>¿Cómo funciona la ponderación de puntos y los $100 pesos?</span>
        </h4>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mb-4">
          Cada actividad tiene una ponderación de puntos según el tiempo y dedicación requerida. Al cumplir con todas sus rutinas fijas durante la semana alcanzan el 100% y se ganan sus <strong>$100 pesos completos</strong>. Si hacen actividades extras sin pantalla, ¡ganan pesos adicionales!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-purple-700 block text-sm mb-0.5">40 pts</span>
            <span className="font-semibold text-slate-700">Gimnasia</span>
            <span className="text-[10px] text-slate-400 block">(Prep 15 + Clase 25)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-emerald-700 block text-sm mb-0.5">25 pts</span>
            <span className="font-semibold text-slate-700">Aseo Cuarto</span>
            <span className="text-[10px] text-slate-400 block">(Domingo mañana)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-amber-700 block text-sm mb-0.5">15 pts</span>
            <span className="font-semibold text-slate-700">Paseo Luna</span>
            <span className="text-[10px] text-slate-400 block">(Diario 1h c/u)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-rose-700 block text-sm mb-0.5">15 pts</span>
            <span className="font-semibold text-slate-700">Piano / Duolingo</span>
            <span className="text-[10px] text-slate-400 block">(Lección diaria)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-sky-700 block text-sm mb-0.5">10 pts</span>
            <span className="font-semibold text-slate-700">Agua/Comida Luna</span>
            <span className="text-[10px] text-slate-400 block">(Cada 2 días)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-center">
            <span className="font-bold text-indigo-700 block text-sm mb-0.5">10 pts</span>
            <span className="font-semibold text-slate-700">Dientes y Pijama</span>
            <span className="text-[10px] text-slate-400 block">(Mañana y Noche)</span>
          </div>
        </div>
      </div>

      {/* Manual Extra Payment Concepts Section ("Llevar su cuenta") */}
      <ManualExtraPaymentsSection
        extraPayments={extraPayments}
        onAddExtraPayment={onAddExtraPayment || (() => {})}
        onToggleStatus={onToggleExtraPaymentStatus || (() => {})}
        onDeletePayment={onDeleteExtraPayment || (() => {})}
        selectedChild={selectedChild}
        activeUser={activeUser}
      />
    </div>
  );
};
