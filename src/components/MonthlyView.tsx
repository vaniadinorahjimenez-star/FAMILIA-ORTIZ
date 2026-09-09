import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Heart, 
  Medal, 
  Home, 
  Dog, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FamilyActivity, ChildId } from '../types';
import { isLunaDutyDay, formatDateKey } from '../utils/scheduleGenerator';
import { soundFX } from '../utils/audio';

interface MonthlyViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  familyActivities: FamilyActivity[];
  onOpenFamilyModal: () => void;
  selectedChild: ChildId | 'both';
  completions: Record<string, boolean>;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  onSelectDate,
  familyActivities,
  onOpenFamilyModal,
  selectedChild,
}) => {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    soundFX.playPop();
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    soundFX.playPop();
  };

  // Calendar grid calculation (Monday first)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week for 1st of month: 0=Sun, 1=Mon... we want Mon=0, Tue=1... Sun=6
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month trailing days
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthDays = [];
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i);
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getFamilyActivityForDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return familyActivities.find((a) => a.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelectedDay = (day: number) => {
    return (
      currentDate.getDate() === day &&
      currentDate.getMonth() === viewMonth &&
      currentDate.getFullYear() === viewYear
    );
  };

  // Extract all Thursday activities in the month
  const thursdaysInMonth: { day: number; dateStr: string; activity?: FamilyActivity }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    if (dateObj.getDay() === 4) {
      const dateStr = formatDateKey(dateObj);
      const activity = familyActivities.find((a) => a.date === dateStr);
      thursdaysInMonth.push({ day: d, dateStr, activity });
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigation & Legend Bar */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold font-['Fredoka',sans-serif] text-slate-800">
              {monthNames[viewMonth]} {viewYear}
            </h2>

            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Activity Badges Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              <Medal className="w-3.5 h-3.5 text-purple-600" />
              Gimnasia (Lun, Mié, Vie)
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Jueves Familiar
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              Aseo Cuarto (Dom)
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Dog className="w-3.5 h-3.5 text-amber-600" />
              Agua/Comida Luna
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-5 text-center">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, index) => (
            <div
              key={d}
              className={`py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl ${
                index === 3
                  ? 'text-rose-700 bg-rose-50/70 font-extrabold'
                  : index === 0 || index === 2 || index === 4
                  ? 'text-purple-700 bg-purple-50/50'
                  : index === 6
                  ? 'text-emerald-700 bg-emerald-50/50'
                  : 'text-slate-500 bg-slate-50'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
          {/* Previous month trailing cells */}
          {prevMonthDays.map((d) => (
            <div
              key={`prev-${d}`}
              className="min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl bg-slate-50/50 border border-transparent text-slate-300 select-none"
            >
              <span className="text-xs font-semibold">{d}</span>
            </div>
          ))}

          {/* Current month days */}
          {daysArray.map((day) => {
            const dateObj = new Date(viewYear, viewMonth, day);
            const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
            const isGym = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
            const isThu = dayOfWeek === 4;
            const isSun = dayOfWeek === 0;
            const hasLuna = isLunaDutyDay(dateObj);
            const famAct = getFamilyActivityForDay(day);
            const today = isToday(day);
            const selected = isSelectedDay(day);

            return (
              <div
                key={`day-${day}`}
                onClick={() => {
                  onSelectDate(dateObj);
                  soundFX.playPop();
                }}
                className={`min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  selected
                    ? 'ring-2 ring-amber-500 bg-amber-50/90 border-amber-300 shadow-sm'
                    : today
                    ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                    : 'bg-white hover:bg-amber-50/30 border-slate-100 hover:border-amber-200'
                }`}
              >
                {/* Day number & Today Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold rounded-lg px-1.5 py-0.5 ${
                      today
                        ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                        : isThu
                        ? 'text-rose-600 font-extrabold'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>

                  {today && (
                    <span className="hidden sm:inline text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">
                      Hoy
                    </span>
                  )}
                </div>

                {/* Day Badges Stack */}
                <div className="space-y-1 my-1">
                  {/* Gymnastics Badge */}
                  {isGym && (
                    <div className="text-[10px] sm:text-[11px] font-semibold text-purple-800 bg-purple-100/90 px-1.5 py-0.5 rounded-md flex items-center gap-1 truncate">
                      <Medal className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      <span className="hidden sm:inline">Gimnasia</span>
                    </div>
                  )}

                  {/* Thursday Family Badge */}
                  {isThu && (
                    <div className="text-[10px] sm:text-[11px] font-semibold text-rose-800 bg-rose-100/90 px-1.5 py-0.5 rounded-md flex items-center gap-1 truncate">
                      <Heart className="w-3 h-3 text-rose-600 fill-rose-500 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">
                        {famAct ? famAct.title.replace(/^[^\w\s]+/, '') : 'Familia'}
                      </span>
                      <span className="sm:hidden">Familia</span>
                    </div>
                  )}

                  {/* Sunday Room Cleaning Badge */}
                  {isSun && (
                    <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md flex items-center gap-1 truncate">
                      <Home className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="hidden sm:inline">Aseo</span>
                    </div>
                  )}

                  {/* Luna Every 2-Day duty */}
                  {hasLuna && (
                    <div className="text-[9px] text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md hidden sm:flex items-center gap-1 truncate">
                      <Dog className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span className="truncate">Luna agua/comida</span>
                    </div>
                  )}
                </div>

                {/* Micro CTA */}
                <div className="text-[9px] text-slate-400 group-hover:text-amber-700 flex items-center justify-end">
                  <span className="hidden sm:inline">Ver día &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thursday Family Activities of the Month */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 p-6 rounded-3xl border border-rose-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-sm">
              <Heart className="w-6 h-6 fill-white/80" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Fredoka',sans-serif] text-slate-800">
                Jueves en Familia de {monthNames[viewMonth]}
              </h3>
              <p className="text-xs text-rose-800 font-medium">
                Lecturas compartidas, caminatas mágicas con Luna, noches de cocina y diversión
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFamilyModal}
            className="flex items-center gap-1.5 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Proponer o Modificar Actividad
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {thursdaysInMonth.map(({ day, dateStr, activity }) => {
            const isCompleted = activity?.completed;

            return (
              <div
                key={dateStr}
                className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Jueves {day} de {monthNames[viewMonth]}
                    </span>
                    {activity?.time && (
                      <span className="text-xs text-slate-500 font-medium">
                        {activity.time}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    {activity ? activity.title : 'Actividad por planear'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activity
                      ? activity.description
                      : '¡Elige una actividad padre de la lista para este jueves!'}
                  </p>

                  {activity?.suggestedBy && (
                    <div className="mt-2 text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                      Idea de: {activity.suggestedBy}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectDate(new Date(viewYear, viewMonth, day));
                      soundFX.playPop();
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <span>Ir a este día</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onOpenFamilyModal}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
