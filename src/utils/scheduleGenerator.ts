import { RoutineTask, ChildId, ScreenFreeBonus } from '../types';

// Anchor date for alternating 2-day duties (September 8, 2026 is an active day)
const ANCHOR_DATE = new Date('2026-09-08T00:00:00');

export function isLunaDutyDay(date: Date): boolean {
  const diffTime = date.getTime() - ANCHOR_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % 2 === 0;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function getWeekKey(date: Date): string {
  // ISO week format or standard weekly tracking Monday-Sunday
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekRange(date: Date): { start: Date; end: Date; weekLabel: string } {
  const curr = new Date(date);
  const day = curr.getDay();
  // Monday is start of week
  const diffToMonday = curr.getDate() - (day === 0 ? 6 : day - 1);
  const start = new Date(curr.setDate(diffToMonday));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const weekLabel = `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;

  return { start, end, weekLabel };
}

export function generateDailySchedule(date: Date): RoutineTask[] {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isGymDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Lun, Mié, Vie
  const isTueThu = dayOfWeek === 2 || dayOfWeek === 4; // Mar, Jue
  const isSunday = dayOfWeek === 0;
  const isThursday = dayOfWeek === 4;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const hasLuna2DayDuty = isLunaDutyDay(date);

  const tasks: RoutineTask[] = [];

  // ================= MORNING =================
  // 1. Romina Morning Walk with Luna (Daily 7:00 - 8:00 AM)
  tasks.push({
    id: 'romina-luna-morning',
    title: 'Paseo matutino con Luna 🐶',
    description: 'Sacar a Luna entre 7 y 8 am a hacer popó y estirar sus patitas.',
    timeSlot: '07:00 - 08:00',
    timeCategory: 'morning',
    assignedTo: 'romina',
    category: 'luna',
    points: 15,
    iconName: 'Dog',
  });

  // 2. Morning Teeth Brushing (Daily, before school / starting day)
  tasks.push({
    id: 'teeth-morning',
    title: 'Cepillado de dientes de la mañana 🪥',
    description: isWeekend 
      ? 'Lavarse muy bien los dientes al levantarse antes de desayunar.' 
      : 'Lavarse los dientes antes de salir a la escuela con sonrisa brillante.',
    timeSlot: isWeekend ? '08:30 - 09:00' : '07:30 - 08:00',
    timeCategory: 'morning',
    assignedTo: 'both',
    category: 'hygiene',
    points: 5,
    iconName: 'Sparkles',
  });

  // 3. Every 2 days Luna Care: Romina water & Regina food
  if (hasLuna2DayDuty) {
    tasks.push({
      id: 'romina-luna-water',
      title: 'Ponerle agua fresca a Luna 💧',
      description: 'Lavar su tazón y llenarlo con agua limpia y fresca para el día.',
      timeSlot: '08:00 - 08:30',
      timeCategory: 'morning',
      assignedTo: 'romina',
      category: 'luna',
      points: 10,
      iconName: 'Droplet',
      isEveryTwoDays: true,
    });

    tasks.push({
      id: 'regina-luna-food',
      title: 'Rellenar bote de comida de Luna 🥣',
      description: 'Verificar y rellenar el bote de croquetas de Luna para que no le falte.',
      timeSlot: '08:00 - 08:30',
      timeCategory: 'morning',
      assignedTo: 'regina',
      category: 'luna',
      points: 10,
      iconName: 'Utensils',
      isEveryTwoDays: true,
    });
  }

  // 4. Sunday Morning Room Cleaning
  if (isSunday) {
    tasks.push({
      id: 'sunday-room-cleaning',
      title: 'Aseo general de su cuarto 🧹',
      description: 'Tender camas, guardar juguetes, doblar ropa limpia y dejar el cuarto impecable.',
      timeSlot: '10:00 - 11:30',
      timeCategory: 'morning',
      assignedTo: 'both',
      category: 'cleaning',
      points: 25,
      iconName: 'Home',
    });
  }

  // ================= AFTERNOON =================
  // Weekend practice slot if not weekday
  if (isWeekend) {
    tasks.push({
      id: 'romina-piano-weekend',
      title: 'Lección y práctica de Piano 🎹',
      description: 'Repasar piezas y escalas musicales del piano 30 minutos.',
      timeSlot: '11:30 - 12:15',
      timeCategory: 'morning',
      assignedTo: 'romina',
      category: 'music_lang',
      points: 15,
      iconName: 'Music',
    });

    tasks.push({
      id: 'regina-duolingo-weekend',
      title: 'Práctica diaria de Duolingo 🦉',
      description: 'Completar lección del día en Duolingo y mantener la racha activa.',
      timeSlot: '11:30 - 12:15',
      timeCategory: 'morning',
      assignedTo: 'regina',
      category: 'music_lang',
      points: 15,
      iconName: 'Globe',
    });
  }

  // Regina Afternoon Walk with Luna (Daily 3:00 - 4:00 PM)
  tasks.push({
    id: 'regina-luna-afternoon',
    title: 'Paseo de la tarde con Luna 🐕',
    description: 'Regina saca a pasear a Luna de 3 a 4 pm, con su correa y bolsitas.',
    timeSlot: '15:00 - 16:00',
    timeCategory: 'afternoon',
    assignedTo: 'regina',
    category: 'luna',
    points: 15,
    iconName: 'Dog',
  });

  // Tuesday & Thursday afternoon: Romina Piano & Regina Duolingo 3:00 - 4:00 PM
  if (isTueThu) {
    tasks.push({
      id: 'romina-piano-tuethu',
      title: 'Lección de Piano de Romina 🎹',
      description: 'Práctica concentrada de piano de 3:00 a 4:00 pm.',
      timeSlot: '15:00 - 16:00',
      timeCategory: 'afternoon',
      assignedTo: 'romina',
      category: 'music_lang',
      points: 15,
      iconName: 'Music',
    });

    tasks.push({
      id: 'regina-duolingo-tuethu',
      title: 'Lección de Duolingo de Regina 🦉',
      description: 'Completar objetivos diarios y ejercicios de idiomas.',
      timeSlot: '16:00 - 16:45',
      timeCategory: 'afternoon',
      assignedTo: 'regina',
      category: 'music_lang',
      points: 15,
      iconName: 'Globe',
    });
  }

  // Gymnastics Preparation & Class (Monday, Wednesday, Friday)
  if (isGymDay) {
    tasks.push({
      id: 'gym-prep-5pm',
      title: 'Mochila lista para Gimnasia (5:00 PM) 🎒',
      description: 'A las 5:00 pm listas con: leotardo puesto, bote con agua, magnesia y dientes lavados.',
      timeSlot: '17:00 - 17:30',
      timeCategory: 'afternoon',
      assignedTo: 'both',
      category: 'gym',
      points: 15,
      iconName: 'CheckCircle2',
    });

    tasks.push({
      id: 'gym-class',
      title: 'Clase de Gimnasia (6:00 a 8:00 PM) 🤸‍♀️',
      description: 'Entrenamiento de gimnasia: fuerza, flexibilidad, aparatos y diversión.',
      timeSlot: '18:00 - 20:00',
      timeCategory: 'afternoon',
      assignedTo: 'both',
      category: 'gym',
      points: 25,
      iconName: 'Medal',
    });
  }

  // Thursday Family Activity
  if (isThursday) {
    tasks.push({
      id: 'family-thursday-activity',
      title: '🌟 Actividad Especial en Familia de los Jueves',
      description: 'Tiempo juntos: lectura compartida, caminata mágica, juegos de mesa o cine casero.',
      timeSlot: '18:00 - 19:30',
      timeCategory: 'afternoon',
      assignedTo: 'both',
      category: 'family',
      points: 20,
      iconName: 'Heart',
    });
  }

  // ================= EVENING =================
  // Post-gym Piano & Duolingo at 8:30 PM on Mon, Wed, Fri
  if (isGymDay) {
    tasks.push({
      id: 'romina-piano-gymday',
      title: 'Piano de Romina (8:30 PM) 🎹',
      description: 'Lección de piano antes de dormir tras volver de gimnasia.',
      timeSlot: '20:30 - 21:00',
      timeCategory: 'evening',
      assignedTo: 'romina',
      category: 'music_lang',
      points: 15,
      iconName: 'Music',
    });

    tasks.push({
      id: 'regina-duolingo-gymday',
      title: 'Duolingo de Regina (8:30 PM) 🦉',
      description: 'Completar racha de Duolingo antes de acostarse.',
      timeSlot: '20:30 - 21:00',
      timeCategory: 'evening',
      assignedTo: 'regina',
      category: 'music_lang',
      points: 15,
      iconName: 'Globe',
    });
  }

  // Daily Bedtime Routine: Pijama y cepillado de dientes
  tasks.push({
    id: 'teeth-bedtime',
    title: 'Pijama y cepillado de dientes 🌙',
    description: 'Ponerse pijama limpia, lavarse los dientes a fondo y dejar todo listo para dormir.',
    timeSlot: '21:00 - 21:30',
    timeCategory: 'evening',
    assignedTo: 'both',
    category: 'hygiene',
    points: 10,
    iconName: 'Moon',
  });

  return tasks;
}

export const SCREEN_FREE_BONUSES: ScreenFreeBonus[] = [
  {
    id: 'bonus-read-book',
    title: 'Leer 30 minutos un libro o cuento',
    description: 'Lectura concentrada sin pantallas, sumergiéndose en una historia.',
    points: 15,
    pesosReward: 8,
    iconName: 'BookOpen',
    category: 'Lectura',
  },
  {
    id: 'bonus-make-bed',
    title: 'Tender la cama con almohadas alineadas',
    description: 'Sabanas estiradas, almohadas acomodadas y cobija lisa.',
    points: 10,
    pesosReward: 5,
    iconName: 'Bed',
    category: 'Hogar',
  },
  {
    id: 'bonus-dishes',
    title: 'Lavar o secar los trastes de la comida',
    description: 'Ayudar a limpiar los vasos, platos y cubiertos con cuidado.',
    points: 15,
    pesosReward: 8,
    iconName: 'UtensilsCrossed',
    category: 'Hogar',
  },
  {
    id: 'bonus-craft-art',
    title: 'Crear una pintura, dibujo o manualidad',
    description: 'Diseñar una obra de arte con colores, plastilina o cartón.',
    points: 15,
    pesosReward: 8,
    iconName: 'Palette',
    category: 'Creatividad',
  },
  {
    id: 'bonus-puzzle-boardgame',
    title: 'Armar un rompecabezas o jugar juego de mesa',
    description: 'Completar piezas o jugar con hermana/papás sin pantallas.',
    points: 20,
    pesosReward: 10,
    iconName: 'Puzzle',
    category: 'Juegos',
  },
  {
    id: 'bonus-brush-play-luna',
    title: 'Cepillar a Luna y jugar 20 min en el patio',
    description: 'Cepillar su pelaje y lanzarle la pelota a Luna con cariño.',
    points: 15,
    pesosReward: 8,
    iconName: 'Dog',
    category: 'Luna',
  },
  {
    id: 'bonus-water-plants',
    title: 'Regar las plantitas y cuidar el jardín',
    description: 'Ponerles agua a las macetas de la casa o flores del patio.',
    points: 10,
    pesosReward: 5,
    iconName: 'Flower2',
    category: 'Naturaleza',
  },
  {
    id: 'bonus-bike-skate',
    title: 'Paseo en bicicleta, patines o saltar cuerda',
    description: '30 minutos de ejercicio al aire libre y juego activo.',
    points: 20,
    pesosReward: 10,
    iconName: 'Bike',
    category: 'Deporte',
  },
  {
    id: 'bonus-cook-helper',
    title: 'Ayudar a preparar una receta en la cocina',
    description: 'Pelar frutas, batir mezcla de hot cakes o armar ensalada.',
    points: 15,
    pesosReward: 8,
    iconName: 'ChefHat',
    category: 'Cocina',
  },
  {
    id: 'bonus-write-story',
    title: 'Escribir un cuento corto o historieta',
    description: 'Inventar personajes, un nudo divertido y un final feliz.',
    points: 20,
    pesosReward: 10,
    iconName: 'PenTool',
    category: 'Escritura',
  },
  {
    id: 'bonus-backpack-org',
    title: 'Organizar mochila, cuadernos y estuche',
    description: 'Sacar punta a lápices y tener todo ordenado para mañana.',
    points: 10,
    pesosReward: 5,
    iconName: 'Briefcase',
    category: 'Escuela',
  }
];

export const INSPIRING_FAMILY_ACTIVITIES = [
  {
    title: '🁓 Gran Partida de Dominó en Familia',
    description: 'Reta a mamá y papá a armar parejas de dominó, sumando puntos y haciendo jugadas maestras.',
  },
  {
    title: '🧩 Reto Familiar de Rompecabezas',
    description: 'Poner un rompecabezas en la mesa y colaborar todos para buscar esquinas, bordes y completar la imagen.',
  },
  {
    title: '🍳 Preparar la Cena Juntos en Equipo',
    description: 'Todos colaboramos en la cocina preparando la cena familiar, poniendo la mesa y platicando de nuestro día.',
  },
  {
    title: '📚 Noche de Cuentacuentos con Linternas',
    description: 'Apagar las luces de la sala, acomodar cojines y leer historias divertidas o inventadas por turnos.',
  },
  {
    title: '🎲 Gran Torneo de Juegos de Mesa y Cartas',
    description: 'Partidas emocionantes de Uno, memorama, Jenga o juegos de destreza mental en familia.',
  },
  {
    title: '🎭 Noche de Caras y Gestos (Charadas)',
    description: 'Adivinar películas, animales y personajes usando sólo mímica y risas en equipo.',
  },
  {
    title: '🚶‍♀️ Caminata Mágica con Luna al Atardecer',
    description: 'Recorrido por el parque buscando hojas curiosas y disfrutando el aire fresco en familia.',
  },
  {
    title: '🎬 Noche de Cine en Casa con Pijamas',
    description: 'Elegir una película divertida, acomodarse con cobijas en la sala y disfrutar juntos.',
  },
  {
    title: '🎨 Taller de Juegos de Papel y Creatividad',
    description: 'Jugar Basta (Stop), gato, ahorcado y dibujar retratos chistosos entre nosotros.',
  },
];
