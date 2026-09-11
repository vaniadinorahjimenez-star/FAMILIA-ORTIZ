import React from 'react';
import { 
  Target, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  Coins, 
  Clock, 
  Flame, 
  Award,
  ChevronRight
} from 'lucide-react';
import { ChildId } from '../types';

export interface ChildGoalData {
  childId: ChildId;
  name: string;
  age: number;
  theme: 'rose' | 'purple';
  regularPoints: number;
  targetPoints: number;
  pointsRemaining: number;
  routinePercent: number;
  completedTasksCount: number;
  totalWeekTasks: number;
  tasksRemainingToGoal: number;
  isGoalReached: boolean;
  baseAllowanceEarned: number;
}

interface WeeklyGoalProgressProps {
  rominaGoal: ChildGoalData;
  reginaGoal: ChildGoalData;
  selectedChild: ChildId | 'both';
  onNavigateToDaily?: () => void;
}

interface CircularProgressRingProps {
  percent: number;
  strokeWidth?: number;
  size?: number;
  color: 'rose' | 'purple';
  isCompleted: boolean;
  centerTopText?: string;
  centerSubText?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percent,
  strokeWidth = 9,
  size = 112,
  color,
  isCompleted,
  centerTopText,
  centerSubText,
}) => {
  const safePercent = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  const strokeColor = color === 'rose' ? '#f43f5e' : '#9333ea';
  const trackColor = color === 'rose' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(147, 51, 234, 0.15)';
  const glowShadow = isCompleted 
    ? (color === 'rose' ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.45))' : 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.45))')
    : 'none';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90 transform transition-all duration-700 ease-out"
        width={size}
        height={size}
        style={{ filter: glowShadow }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {isCompleted ? (
          <div className="flex flex-col items-center animate-bounce">
            <Trophy className={`w-6 h-6 ${color === 'rose' ? 'text-rose-600' : 'text-purple-600'}`} />
            <span className="text-[11px] font-black font-['Fredoka',sans-serif] text-slate-800 uppercase tracking-tighter">
              100%
            </span>
          </div>
        ) : (
          <>
            <span className={`text-xl font-black font-['Fredoka',sans-serif] leading-none ${
              color === 'rose' ? 'text-rose-600' : 'text-purple-700'
            }`}>
              {centerTopText || `${safePercent}%`}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
              {centerSubText || 'de la meta'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export const WeeklyGoalProgress: React.FC<WeeklyGoalProgressProps> = ({
  rominaGoal,
  reginaGoal,
  selectedChild,
}) => {
  const showRomina = selectedChild === 'romina' || selectedChild === 'both';
  const showRegina = selectedChild === 'regina' || selectedChild === 'both';

  const renderGoalCard = (data: ChildGoalData) => {
    const isRose = data.theme === 'rose';
    const accentBorder = isRose ? 'border-rose-200 hover:border-rose-300' : 'border-purple-200 hover:border-purple-300';
    const accentBg = isRose ? 'from-rose-50/70 to-pink-50/40' : 'from-purple-50/70 to-indigo-50/40';
    const badgeColor = isRose ? 'bg-rose-500 text-white' : 'bg-purple-600 text-white';
    const tagBg = isRose ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800';
    const barGradient = isRose ? 'from-rose-400 via-pink-500 to-rose-600' : 'from-purple-400 via-indigo-500 to-purple-600';
    const textColor = isRose ? 'text-rose-600' : 'text-purple-600';
    const highlightBg = isRose ? 'bg-rose-50 border-rose-200' : 'bg-purple-50 border-purple-200';

    return (
      <div 
        key={data.childId}
        id={`weekly-goal-card-${data.childId}`}
        className={`bg-white rounded-3xl p-5 sm:p-6 border-2 ${accentBorder} shadow-sm bg-gradient-to-br ${accentBg} transition-all duration-200 relative overflow-hidden`}
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/40 blur-2xl pointer-events-none" />

        {/* Header with Child Avatar & Title */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${badgeColor} flex items-center justify-center font-black font-['Fredoka',sans-serif] text-xl shadow-sm ring-4 ${isRose ? 'ring-rose-100' : 'ring-purple-100'}`}>
              {data.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg sm:text-xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                  {data.name}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagBg}`}>
                  {data.age} años
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Meta: <span className="font-bold text-slate-700">{data.targetPoints} pts</span> ($100 Pesos semanales)
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {data.isGoalReached ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">
              <Trophy className="w-3.5 h-3.5" />
              <span>¡Meta Lograda!</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${highlightBg} ${textColor}`}>
              <Target className="w-3.5 h-3.5" />
              <span>En progreso</span>
            </div>
          )}
        </div>

        {/* Center Visual Area: Circular Ring + Tasks Missing Hero Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white/80 p-4 rounded-2xl border border-white/90 shadow-xs mb-4">
          {/* Circular Progress Meter */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center">
            <CircularProgressRing
              percent={data.routinePercent}
              size={108}
              strokeWidth={9}
              color={data.theme}
              isCompleted={data.isGoalReached}
              centerTopText={`${data.routinePercent}%`}
              centerSubText={`${data.regularPoints}/${data.targetPoints}`}
            />
            <span className="text-[11px] font-bold text-slate-500 mt-1">
              {data.regularPoints} de {data.targetPoints} pts
            </span>
          </div>

          {/* Tasks Remaining Narrative & Stat Blocks */}
          <div className="sm:col-span-8 space-y-3">
            {/* The Big Hero Callout: Cuántas tareas faltan */}
            {data.isGoalReached ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>¡Felicidades {data.name}! Cumpliste el 100%</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                  Has acumulado los <strong>{data.regularPoints} puntos</strong> requeridos. Tus <strong>$100 pesos</strong> de recompensa base están 100% asegurados para este domingo.
                </p>
              </div>
            ) : (
              <div className={`border p-3.5 rounded-2xl ${highlightBg}`}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Flame className={`w-3.5 h-3.5 ${textColor}`} />
                    Para completar la meta:
                  </span>
                  <span className={`text-sm font-black font-['Fredoka',sans-serif] ${textColor}`}>
                    Faltan {data.pointsRemaining} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl ${badgeColor} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                    <span className="text-lg font-black font-['Fredoka',sans-serif]">
                      {data.tasksRemainingToGoal}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-800 leading-tight">
                      Faltan solo <span className={`font-black underline decoration-2 ${textColor}`}>{data.tasksRemainingToGoal} {data.tasksRemainingToGoal === 1 ? 'tarea' : 'tareas'}</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Equivalen a ~{data.pointsRemaining} pts para cobrar los <strong>$100 MXN</strong> completos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Completadas</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {data.completedTasksCount}
                </span>
                <span className="text-[9px] text-slate-400 block">esta semana</span>
              </div>

              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Puntos hoy</span>
                <span className={`text-sm font-extrabold ${textColor}`}>
                  {data.regularPoints}
                </span>
                <span className="text-[9px] text-slate-400 block">de 350 pts</span>
              </div>

              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Recompensa</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  ${data.baseAllowanceEarned}
                </span>
                <span className="text-[9px] text-slate-400 block">de $100 MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Fill Progress Bar with Visual Milestone Markers */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
            <span>Progreso acumulado:</span>
            <span className={textColor}>
              {data.routinePercent}% ({data.regularPoints} / {data.targetPoints} pts)
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 relative border border-slate-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, data.routinePercent)}%` }}
            />
            {/* 50% milestone pin */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-xs z-10" 
              style={{ left: '50%' }}
              title="50% ($50 MXN)"
            />
          </div>

          {/* Milestones Labels */}
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
            <span>0 pts ($0)</span>
            <span className="text-slate-500">175 pts ($50)</span>
            <span className={`font-bold ${data.isGoalReached ? 'text-emerald-700' : 'text-slate-700'}`}>
              350 pts ($100 MXN) 🏁
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="weekly-goal-progress-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-['Fredoka',sans-serif] text-slate-800">
              Meta Semanal de Puntos ($100 Pesos)
            </h3>
            <p className="text-xs text-slate-500">
              Avance visual de rutinas y cuántas tareas faltan para ganar los $100 pesos de la semana.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Meta: 350 pts = $100 MXN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {showRomina && renderGoalCard(rominaGoal)}
        {showRegina && renderGoalCard(reginaGoal)}
      </div>
    </div>
  );
};
