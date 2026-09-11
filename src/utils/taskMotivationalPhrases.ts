import { RoutineTask, ChildId } from '../types';
import { LunaActivityVariant } from '../components/LunaFrenchPoodle';

export interface ActivityCelebrationInfo {
  categoryType: 'homework' | 'hygiene' | 'bedtime' | 'luna' | 'gym' | 'piano' | 'duolingo' | 'cleaning' | 'general';
  lunaVariant: LunaActivityVariant;
  themeColor: string;
  themeGradient: string;
  animationEmoji: string;
  badgeLabel: string;
  motivationalPhrase: string;
  subPhrase: string;
  actionSummary: string;
  lunaReaction: string;
}

export function getActivityCelebrationInfo(task: RoutineTask, childId: ChildId): ActivityCelebrationInfo {
  const titleLower = task.title.toLowerCase();
  const descLower = task.description.toLowerCase();
  const idLower = task.id.toLowerCase();
  const childName = childId === 'romina' ? 'Romina' : 'Regina';

  // 1. GIMNASIA (Gymnastics) - ¡Rendirse es para los débiles SOLO AQUÍ!
  if (
    titleLower.includes('gimnasia') ||
    descLower.includes('gimnasia') ||
    idLower.includes('gym') ||
    task.category === 'gym'
  ) {
    return {
      categoryType: 'gym',
      lunaVariant: 'gym',
      themeColor: 'purple',
      themeGradient: 'from-purple-600 via-fuchsia-600 to-pink-500',
      animationEmoji: '🤸‍♀️🔥🏅',
      badgeLabel: 'Gimnasia & Disciplina',
      motivationalPhrase: '«¡Rendirse es para los débiles!» 🤸‍♀️💪',
      subPhrase: `¡Fuerza, flexibilidad y corazón de campeona! Cada pirueta y esfuerzo te lleva al podio más alto, ${childName}.`,
      actionSummary: 'Entrenamiento de gimnasia completado con éxito',
      lunaReaction: '¡Luna levantando pesitas con su banda deportiva gritando: ¡Una más, tú puedes! 🐩🏋️‍♀️🔥',
    };
  }

  // 2. LUNA - PASEOS (Paseo matutino, paseo de la tarde con Luna)
  if (
    (task.category === 'luna' || titleLower.includes('luna') || idLower.includes('luna')) &&
    (titleLower.includes('paseo') || titleLower.includes('sacar') || descLower.includes('sacar a luna') || idLower.includes('walk') || idLower.includes('morning') || idLower.includes('afternoon'))
  ) {
    return {
      categoryType: 'luna',
      lunaVariant: 'walk',
      themeColor: 'rose',
      themeGradient: 'from-rose-500 via-pink-500 to-amber-400',
      animationEmoji: '🐕‍🦺🐾🌳',
      badgeLabel: 'Paseo Mágico con Luna',
      motivationalPhrase: '«¡Patitas felices y colita alegre! 🐾🌳»',
      subPhrase: `¡El mejor paseo del mundo! Respirar aire fresco y caminar juntas llena a Luna de felicidad y amor, ${childName}.`,
      actionSummary: 'Paseo divertido y popó recogida con bolsita',
      lunaReaction: '¡Luna con sus lentes oscuros y orejitas negritas da brincos de alegría por su paseo! 🐩🐾💨',
    };
  }

  // 3. LUNA - AGUA Y COMIDA (Comida, croquetas, tazón de agua)
  if (
    task.category === 'luna' ||
    titleLower.includes('luna') ||
    idLower.includes('luna')
  ) {
    return {
      categoryType: 'luna',
      lunaVariant: 'walk',
      themeColor: 'amber',
      themeGradient: 'from-amber-500 via-orange-500 to-rose-400',
      animationEmoji: '🥣💧🦴',
      badgeLabel: 'Cuidado & Amor por Luna',
      motivationalPhrase: '«¡Amor puro de cuatro patitas! 🥣💧»',
      subPhrase: `Pancita llena y agua fresca. Cuidar a Luna te hace una niña noble, cariñosa y responsable, ${childName}.`,
      actionSummary: 'Comida y agua limpia para Luna',
      lunaReaction: '¡Luna saborea feliz y mueve su colita agradeciendo tu gran cuidado! 🐩😋💖',
    };
  }

  // 4. TAREA ESCOLAR (Homework) - Mente brillante y curiosa
  if (
    titleLower.includes('tarea') ||
    idLower.includes('homework') ||
    (descLower.includes('tarea') && !descLower.includes('tras la tarea'))
  ) {
    return {
      categoryType: 'homework',
      lunaVariant: 'homework',
      themeColor: 'amber',
      themeGradient: 'from-amber-500 via-orange-500 to-yellow-500',
      animationEmoji: '📚💡✏️',
      badgeLabel: 'Misión Escolar Cumplida',
      motivationalPhrase: '«¡Tu mente es brillante y curiosa! 💡📖»',
      subPhrase: `¡Excelente concentración, ${childName}! Cada cosa nueva que aprendes expande tu mundo y te hace imparable.`,
      actionSummary: 'Tarea escolar terminada y mochila lista',
      lunaReaction: '¡Luna se acomodó sus lentes redondos de genio para ponerte un 10 con estrellita dorada! 🤓⭐🐩',
    };
  }

  // 5. HIGIENE - CEPILLADO DE DIENTES / LAVARSE LA CARA
  if (
    titleLower.includes('cara') ||
    titleLower.includes('dientes') ||
    titleLower.includes('cepillado') ||
    descLower.includes('cara') ||
    descLower.includes('dientes') ||
    task.category === 'hygiene'
  ) {
    const isNight = titleLower.includes('noche') || titleLower.includes('pijama') || idLower.includes('bedtime');
    return {
      categoryType: 'hygiene',
      lunaVariant: 'teeth',
      themeColor: 'cyan',
      themeGradient: 'from-cyan-500 via-sky-500 to-teal-400',
      animationEmoji: '🪥✨🧼',
      badgeLabel: 'Sonrisa Radiante',
      motivationalPhrase: '«¡Sonrisa luminosa que alegra el día! ✨🪥»',
      subPhrase: isNight
        ? `¡Carita limpia, dientes como perlas y mente en calma! Cuidar tu cuerpo te hace sentir genial, ${childName}.`
        : `¡Dientes súper blancos y carita fresca! Tu sonrisa ilumina a toda la familia, ${childName}.`,
      actionSummary: 'Dientes limpios y carita fresca',
      lunaReaction: '¡Luna muestra su sonrisota blanca reluciente con su cepillo y burbujas brillantes! 🦷✨🐩',
    };
  }

  // 6. PIJAMA & DORMIR
  if (
    titleLower.includes('pijama') ||
    titleLower.includes('dormir') ||
    idLower.includes('bedtime')
  ) {
    return {
      categoryType: 'bedtime',
      lunaVariant: 'sleep',
      themeColor: 'indigo',
      themeGradient: 'from-indigo-600 via-purple-600 to-blue-500',
      animationEmoji: '🌙🧸💤',
      badgeLabel: 'Hora de Descansar',
      motivationalPhrase: '«¡Dulces sueños y magia para mañana! 🌙🧸»',
      subPhrase: `Pijama suavecita, mente en paz. A descansar profundamente para despertar llena de energía, ${childName}.`,
      actionSummary: 'Pijama lista y descanso merecido',
      lunaReaction: '¡Luna se puso su gorrito de dormir y ya está roncando calientita a tus pies! 🐩💤🌙',
    };
  }

  // 7. PIANO
  if (
    titleLower.includes('piano') ||
    descLower.includes('piano') ||
    idLower.includes('piano')
  ) {
    return {
      categoryType: 'piano',
      lunaVariant: 'piano',
      themeColor: 'violet',
      themeGradient: 'from-violet-600 via-rose-500 to-pink-400',
      animationEmoji: '🎹🎶💖',
      badgeLabel: 'Talento & Melodía',
      motivationalPhrase: '«¡La música sale de tu corazón! 🎹🎶»',
      subPhrase: `Tus manitas hacen magia en cada nota. Qué hermoso talento que llena de alegría el hogar, ${childName}.`,
      actionSummary: 'Práctica de piano completada con dulzura',
      lunaReaction: '¡Luna con su moño elegante aplaude con sus patitas al ritmo de tu melodía! 🐩🎼✨',
    };
  }

  // 8. DUOLINGO / IDIOMAS
  if (
    titleLower.includes('duolingo') ||
    descLower.includes('duolingo') ||
    idLower.includes('duolingo')
  ) {
    return {
      categoryType: 'duolingo',
      lunaVariant: 'duolingo',
      themeColor: 'emerald',
      themeGradient: 'from-emerald-500 via-teal-500 to-green-400',
      animationEmoji: '🦉🌍⭐',
      badgeLabel: 'Mente sin Fronteras',
      motivationalPhrase: '«¡Una pequeña genio del mundo! 🦉🌍»',
      subPhrase: `¡Cada palabra nueva que aprendes te conecta con el mundo entero! Tu inteligencia no tiene límites, ${childName}.`,
      actionSummary: 'Racha de Duolingo sumada y protegida',
      lunaReaction: '¡Luna con su boina francesa ladra diciendo: Félicitations championne! 🐩🇫🇷🥖',
    };
  }

  // 9. ASEO DE CUARTO / TENDER CAMA / ROPA
  if (
    titleLower.includes('cuarto') ||
    titleLower.includes('cama') ||
    titleLower.includes('ropa') ||
    task.category === 'cleaning'
  ) {
    return {
      categoryType: 'cleaning',
      lunaVariant: 'cleaning',
      themeColor: 'emerald',
      themeGradient: 'from-teal-500 via-emerald-500 to-cyan-400',
      animationEmoji: '🧹🛏️✨',
      badgeLabel: 'Orden & Paz en Casa',
      motivationalPhrase: '«¡Espacio ordenado, mente feliz! 🧹🌸»',
      subPhrase: `Tu cuarto luce hermoso, limpio y lleno de paz. ¡Nan y tus papás están súper orgullosos de tu orden, ${childName}!`,
      actionSummary: 'Cuarto reluciente y orden total',
      lunaReaction: '¡Luna inspecciona con su plumero y aprueba: 10/10, habitación de princesa impecable! 🐩🧹✨',
    };
  }

  // 10. GENERAL / CUALQUIER OTRA ACTIVIDAD
  return {
    categoryType: 'general',
    lunaVariant: 'default',
    themeColor: 'rose',
    themeGradient: 'from-rose-500 via-pink-500 to-amber-400',
    animationEmoji: '🌟💖🏆',
    badgeLabel: '¡Victoria Sumada!',
    motivationalPhrase: '«¡Paso a pasito logras cosas gigantes! 🌟💖»',
    subPhrase: `¡Cada meta cumplida con cariño demuestra lo maravillosa, dedicada y genial que eres, ${childName}!`,
    actionSummary: task.title,
    lunaReaction: '¡Luna da saltitos de emoción moviendo sus orejitas negritas para festejar contigo! 🐩🎉',
  };
}
