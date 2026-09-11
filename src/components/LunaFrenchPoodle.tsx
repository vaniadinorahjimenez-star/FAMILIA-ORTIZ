import React from 'react';

export type LunaActivityVariant = 
  | 'default'
  | 'teeth'      // Lavarse los dientes / cara: Sonrisa gigante con dientes brillantes y cepillo
  | 'gym'        // Gimnasia: Luna con banda deportiva haciendo pesas
  | 'homework'   // Tareas: Luna nerd con lentes, lápiz y librito
  | 'piano'      // Piano: Luna con moñito elegante y teclas musicales
  | 'duolingo'   // Duolingo: Luna con boina y mundo
  | 'sleep'      // Pijama / dormir: Luna con gorrito de dormir y roncando "Zzz"
  | 'walk'       // Paseo / cuidados: Luna con gafas de sol y patitas felices
  | 'cleaning';  // Aseo del cuarto: Luna con plumero de limpieza

interface LunaFrenchPoodleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: LunaActivityVariant;
  showBark?: boolean;
}

export const LunaFrenchPoodle: React.FC<LunaFrenchPoodleProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
  showBark = true,
}) => {
  const sizeMap = {
    xs: 'w-16 h-16',
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  };

  // Activity-specific dialogue or exclamation
  // "RENDIRSE ES PARA LOS DEBILES SOLO EN LA FRASE DE LA GIMNASIA"
  const barkTextMap: Record<LunaActivityVariant, { text: string; icon: string }> = {
    default: { text: '¡Guau, felicidades!', icon: '🐩💖' },
    teeth: { text: '¡Sonrisa reluciente!', icon: '🪥✨' },
    gym: { text: '¡Rendirse es para los débiles!', icon: '💪🤸‍♀️' },
    homework: { text: '¡Mente brillante!', icon: '🤓💡' },
    piano: { text: '¡Qué bella melodía!', icon: '🎹🎶' },
    duolingo: { text: '¡Bravo genio!', icon: '🦉🌍' },
    sleep: { text: 'Dulces sueños...', icon: '🌙💤' },
    walk: { text: '¡El mejor paseo!', icon: '🐕‍🦺🐾' },
    cleaning: { text: '¡Cuarto impecable!', icon: '🧹✨' },
  };

  const badge = barkTextMap[variant] || barkTextMap.default;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* Dynamic Animated Speech Bubble */}
      {showBark && (
        <div className="absolute -top-3.5 -right-2.5 z-20 animate-bounce">
          <span className="bg-white border-2 border-pink-400 text-pink-700 font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <span>{badge.text}</span>
            <span>{badge.icon}</span>
          </span>
        </div>
      )}

      {/* Floating Animated Props based on variant */}
      {variant === 'teeth' && (
        <>
          <div className="absolute -top-1 -left-2 text-cyan-400 text-sm animate-ping">✨</div>
          <div className="absolute top-1/2 -right-3 text-sky-400 text-xs animate-bounce">🧼</div>
          <div className="absolute -bottom-1 -left-1 text-cyan-500 text-xs animate-pulse">🫧</div>
        </>
      )}

      {variant === 'gym' && (
        <>
          <div className="absolute -top-2 -left-2 text-amber-500 text-sm animate-bounce">🔥</div>
          <div className="absolute top-2 -right-3 text-purple-500 text-xs animate-pulse">⚡</div>
          <div className="absolute -bottom-1 right-0 text-yellow-500 text-xs font-black animate-ping">100%</div>
        </>
      )}

      {variant === 'homework' && (
        <>
          <div className="absolute -top-2 -left-2 text-amber-500 text-xs font-black animate-bounce">2+2=4</div>
          <div className="absolute top-1 -right-3 text-indigo-500 text-xs font-black animate-pulse">A+ ⭐</div>
          <div className="absolute -bottom-1 -left-2 text-yellow-500 text-sm animate-spin">💡</div>
        </>
      )}

      {variant === 'piano' && (
        <>
          <div className="absolute -top-2 -left-2 text-violet-500 text-sm animate-bounce">♪</div>
          <div className="absolute top-1 -right-2 text-pink-500 text-sm animate-pulse">♫</div>
          <div className="absolute bottom-1 -left-2 text-rose-400 text-xs animate-ping">💖</div>
        </>
      )}

      {variant === 'sleep' && (
        <>
          <div className="absolute -top-2 -left-1 text-indigo-400 text-xs font-bold animate-pulse">Zzz...</div>
          <div className="absolute top-2 -right-2 text-purple-400 text-xs animate-bounce">🌙</div>
        </>
      )}

      {variant === 'walk' && (
        <>
          <div className="absolute -top-2 -left-2 text-emerald-500 text-xs animate-bounce">💨</div>
          <div className="absolute top-2 -right-2 text-amber-500 text-sm animate-pulse">🦴</div>
          <div className="absolute -bottom-1 left-0 text-emerald-600 text-xs">🐾</div>
        </>
      )}

      {variant === 'cleaning' && (
        <>
          <div className="absolute -top-2 -left-2 text-teal-400 text-sm animate-ping">✨</div>
          <div className="absolute top-1 -right-2 text-emerald-500 text-xs animate-bounce">🧼</div>
        </>
      )}

      {/* SVG Character Rendering - Pure white fluffy French Poodle with BLACK EARS (Orejitas Negritas) */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Lively custom CSS keyframe animations */}
        <defs>
          <style>{`
            @keyframes poodleTailWag {
              0%, 100% { transform: rotate(-10deg); }
              50% { transform: rotate(18deg); }
            }
            @keyframes earLeftWiggle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-5deg) translateY(-2px); }
            }
            @keyframes earRightWiggle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(5deg) translateY(-2px); }
            }
            @keyframes gymWeightLift {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-16px) rotate(-2deg); }
            }
            @keyframes toothbrushScrub {
              0%, 100% { transform: translateX(0px) rotate(0deg); }
              50% { transform: translateX(7px) rotate(9deg); }
            }
            @keyframes sparkleFlash {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.3); }
            }
            @keyframes glassesWiggle {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-2px); }
            }
            @keyframes tonguePant {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15) translateY(1px); }
            }
            .anim-tail {
              transform-origin: 48px 135px;
              animation: poodleTailWag 0.4s ease-in-out infinite;
            }
            .anim-ear-left {
              transform-origin: 62px 72px;
              animation: earLeftWiggle 1.4s ease-in-out infinite;
            }
            .anim-ear-right {
              transform-origin: 138px 72px;
              animation: earRightWiggle 1.4s ease-in-out infinite;
            }
            .anim-weights {
              transform-origin: 100px 145px;
              animation: gymWeightLift 0.65s ease-in-out infinite;
            }
            .anim-brush {
              transform-origin: 125px 95px;
              animation: toothbrushScrub 0.35s ease-in-out infinite;
            }
            .anim-sparkle {
              animation: sparkleFlash 0.55s ease-in-out infinite;
            }
            .anim-glasses {
              animation: glassesWiggle 1s ease-in-out infinite;
            }
            .anim-tongue {
              transform-origin: 100px 101px;
              animation: tonguePant 0.8s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* 1. Fluffy White Poodle Tail with wagging animation */}
        <g className="anim-tail">
          <path
            d="M48 140 C20 130 15 105 32 95 C45 88 55 105 48 125 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          {/* Fluffy tail puff */}
          <circle cx="28" cy="98" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
          <circle cx="36" cy="92" r="7.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        </g>

        {/* 2. Hind Paws with Fluffy Poodle Curls */}
        <ellipse cx="65" cy="165" rx="14" ry="12" fill="#F8FAFC" />
        <ellipse cx="65" cy="172" rx="12" ry="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
        <circle cx="60" cy="173" r="2" fill="#E2E8F0" />
        <circle cx="65" cy="174" r="2" fill="#E2E8F0" />
        <circle cx="70" cy="173" r="2" fill="#E2E8F0" />

        <ellipse cx="135" cy="165" rx="14" ry="12" fill="#F8FAFC" />
        <ellipse cx="135" cy="172" rx="12" ry="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
        <circle cx="130" cy="173" r="2" fill="#E2E8F0" />
        <circle cx="135" cy="174" r="2" fill="#E2E8F0" />
        <circle cx="140" cy="173" r="2" fill="#E2E8F0" />

        {/* 3. Fluffy Snow-White Poodle Body (Pure White, Super Fluffy) */}
        <path
          d="M60 145 C48 122 62 98 90 98 C120 98 142 118 140 145 C138 165 112 172 98 172 C80 172 65 160 60 145 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="3"
        />
        {/* Soft curly chest puff layers */}
        <circle cx="86" cy="132" r="10" fill="#F8FAFC" opacity="0.8" />
        <circle cx="100" cy="130" r="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="114" cy="132" r="10" fill="#F8FAFC" opacity="0.8" />

        {/* 4. Collar & Pendant */}
        {variant === 'piano' ? (
          /* Concert Bowtie for Piano */
          <g>
            <path d="M78 120 L122 120 L120 125 L80 125 Z" fill="#0F172A" />
            <polygon points="90,118 90,132 100,125" fill="#DC2626" />
            <polygon points="110,118 110,132 100,125" fill="#DC2626" />
            <circle cx="100" cy="125" r="4" fill="#FBBF24" />
          </g>
        ) : (
          /* Standard Pink Collar with Gold Luna Medallion */
          <g>
            <path
              d="M74 116 C85 123 115 123 126 116 C128 119 126 123 124 125 C112 131 88 131 76 125 Z"
              fill="#F43F5E"
              stroke="#E11D48"
              strokeWidth="2"
            />
            <circle cx="100" cy="128" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            {/* Tiny paw on gold tag */}
            <circle cx="100" cy="127.5" r="2" fill="#B45309" />
            <circle cx="98.5" cy="125.5" r="0.8" fill="#B45309" />
            <circle cx="101.5" cy="125.5" r="0.8" fill="#B45309" />
          </g>
        )}

        {/* 5. OREJITAS NEGRITAS (AMBAS OREJAS NEGRAS ESPONJOSAS DE FRENCH POODLE) */}
        {/* Left Ear (Fluffy Black Poodle Ear with subtle curls) */}
        <g className="anim-ear-left">
          {/* Main ear flap */}
          <path
            d="M62 70 C44 72 36 92 42 116 C48 128 66 124 72 108 C76 94 74 74 62 70 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="3"
          />
          {/* Fluffy poodle curl lobes */}
          <circle cx="44" cy="95" r="9" fill="#1E293B" />
          <circle cx="48" cy="112" r="10" fill="#1E293B" />
          <circle cx="60" cy="116" r="9" fill="#1E293B" />
          {/* Soft dark highlights to give fluffy texture */}
          <path d="M46 92 C48 84 58 80 62 82" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M48 106 C52 100 62 102 65 106" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Right Ear (Fluffy Black Poodle Ear with subtle curls) */}
        <g className="anim-ear-right">
          {/* Main ear flap */}
          <path
            d="M138 70 C156 72 164 92 158 116 C152 128 134 124 128 108 C124 94 126 74 138 70 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="3"
          />
          {/* Fluffy poodle curl lobes */}
          <circle cx="156" cy="95" r="9" fill="#1E293B" />
          <circle cx="152" cy="112" r="10" fill="#1E293B" />
          <circle cx="140" cy="116" r="9" fill="#1E293B" />
          {/* Soft dark highlights to give fluffy texture */}
          <path d="M154 92 C152 84 142 80 138 82" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M152 106 C148 100 138 102 135 106" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 6. Fluffy Snow-White Head (Cloud-like Curls, NO black eye patch!) */}
        <ellipse cx="100" cy="85" rx="38" ry="34" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />

        {/* Big Fluffy White Afro / Top-Knot Pom-poms (just like the cute puppy photo!) */}
        <circle cx="78" cy="54" r="15" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="94" cy="46" r="17" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="110" cy="47" r="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="124" cy="55" r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="86" cy="62" r="12" fill="#FFFFFF" />
        <circle cx="114" cy="62" r="12" fill="#FFFFFF" />

        {/* Fluffy White Cheeks */}
        <circle cx="68" cy="90" r="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="132" cy="90" r="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* VARIANT-SPECIFIC HEADGEAR */}
        {/* GYM: Sporty Sweatband */}
        {variant === 'gym' && (
          <g>
            <path d="M68 62 C85 55 115 55 132 62 L130 70 C115 63 85 63 70 70 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
            <path d="M69 65 C85 58 115 58 131 65" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {/* HOMEWORK: Scholar Graduation Cap */}
        {variant === 'homework' && (
          <g>
            <polygon points="100,26 126,36 100,44 74,36" fill="#1E293B" />
            <polygon points="85,40 115,40 112,48 88,48" fill="#0F172A" />
            <line x1="100" y1="34" x2="124" y2="42" stroke="#FBBF24" strokeWidth="2" />
            <circle cx="124" cy="44" r="3" fill="#FBBF24" />
          </g>
        )}

        {/* DUOLINGO: Cute Emerald / French Artist Beret */}
        {variant === 'duolingo' && (
          <g>
            <ellipse cx="108" cy="46" rx="24" ry="12" fill="#059669" stroke="#047857" strokeWidth="1.5" transform="rotate(-10 108 46)" />
            <circle cx="104" cy="38" r="3" fill="#047857" />
          </g>
        )}

        {/* SLEEP: Cozy Striped Sleeping Nightcap */}
        {variant === 'sleep' && (
          <g>
            <path d="M78 50 C95 35 135 30 150 50 C145 60 135 60 115 56 Z" fill="#818CF8" stroke="#4F46E5" strokeWidth="1.5" />
            <path d="M92 45 C110 38 128 42 142 48" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="152" cy="52" r="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}

        {/* WALK: Sporty Sunglasses */}
        {variant === 'walk' && (
          <g>
            <rect x="73" y="75" width="23" height="15" rx="5" fill="#0F172A" />
            <rect x="104" y="75" width="23" height="15" rx="5" fill="#0F172A" />
            <path d="M95 81 L105 81" stroke="#0F172A" strokeWidth="3" />
            <line x1="76" y1="78" x2="84" y2="86" stroke="#38BDF8" strokeWidth="2" />
            <line x1="107" y1="78" x2="115" y2="86" stroke="#38BDF8" strokeWidth="2" />
          </g>
        )}

        {/* 7. Big Glossy Puppy Eyes (Soulful & Sweet, like the photo!) */}
        {variant !== 'walk' && (
          <>
            {variant === 'sleep' ? (
              /* Sleeping smiling closed eyes (^‿^) */
              <>
                <path d="M78 82 Q84 88 90 82" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M110 82 Q116 88 122 82" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              /* Big dark expressive puppy eyes with bright reflections */
              <>
                {/* Left Eye */}
                <ellipse cx="83" cy="81" rx="6.5" ry="7.5" fill="#0F172A" />
                <circle cx="81" cy="78" r="2.8" fill="#FFFFFF" />
                <circle cx="85.5" cy="83.5" r="1.3" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="117" cy="81" rx="6.5" ry="7.5" fill="#0F172A" />
                <circle cx="115" cy="78" r="2.8" fill="#FFFFFF" />
                <circle cx="119.5" cy="83.5" r="1.3" fill="#FFFFFF" />
              </>
            )}
          </>
        )}

        {/* HOMEWORK: Hilarious Big Round Nerd Glasses on top of eyes */}
        {variant === 'homework' && (
          <g className="anim-glasses">
            <circle cx="83" cy="81" r="13" fill="none" stroke="#0F172A" strokeWidth="3.5" />
            <circle cx="117" cy="81" r="13" fill="none" stroke="#0F172A" strokeWidth="3.5" />
            <line x1="96" y1="81" x2="104" y2="81" stroke="#0F172A" strokeWidth="3.5" />
            {/* Little white tape on bridge of glasses */}
            <rect x="98" y="79" width="4" height="5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
          </g>
        )}

        {/* 8. Fluffy White Muzzle & Cute Black Button Nose */}
        <ellipse cx="90" cy="98" rx="13" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <ellipse cx="110" cy="98" rx="13" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <ellipse cx="100" cy="94" rx="11" ry="8" fill="#FFFFFF" />

        {/* Black shiny button nose */}
        <path d="M94 92 C94 88 106 88 106 92 C106 96 101 98 100 98 C99 98 94 96 94 92 Z" fill="#0F172A" />
        <ellipse cx="98" cy="90.5" rx="2" ry="1" fill="#FFFFFF" />

        {/* 9. MOUTH & SMILE WITH CUTE PINK TONGUE (Matching photo!) */}
        {variant === 'teeth' ? (
          /* HILARIOUS GIANT SPARKLING TOOTHY SMILE! */
          <g>
            {/* Open wide smiling mouth */}
            <path d="M84 98 Q100 120 116 98 Z" fill="#991B1B" stroke="#0F172A" strokeWidth="2.5" />
            {/* Row of sparkling pearly white teeth */}
            <path d="M86 98 L114 98 L112 105 L88 105 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="93" y1="98" x2="93" y2="105" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="100" y1="98" x2="100" y2="105" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="107" y1="98" x2="107" y2="105" stroke="#CBD5E1" strokeWidth="1" />
            {/* Lower teeth */}
            <path d="M92 110 L108 110 L104 114 L96 114 Z" fill="#FFFFFF" />
            {/* SPARKLE GLINTS ON TEETH! */}
            <g className="anim-sparkle">
              <polygon points="90,95 92,100 97,102 92,104 90,109 88,104 83,102 88,100" fill="#38BDF8" />
              <polygon points="112,98 113,101 116,102 113,103 112,106 111,103 108,102 111,101" fill="#FBBF24" />
            </g>
            {/* Toothpaste bubbles around mouth */}
            <circle cx="82" cy="104" r="4" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
            <circle cx="118" cy="106" r="3.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
            <circle cx="114" cy="112" r="2.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
          </g>
        ) : (
          /* Normal sweet smiling mouth with cute pink tongue peeking out just like the puppy photo! */
          <g>
            <path d="M93 99 C96 103 100 103 100 100 C100 103 104 103 107 99" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
            {/* Cute Little Pink Tongue (Animated) */}
            <g className="anim-tongue">
              <path d="M97 100 C97 106 103 106 103 100 Z" fill="#FB7185" stroke="#F43F5E" strokeWidth="1" />
              <line x1="100" y1="100" x2="100" y2="104" stroke="#E11D48" strokeWidth="0.8" />
            </g>
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="75" cy="98" r="6" fill="#FDA4AF" opacity="0.65" />
        <circle cx="125" cy="98" r="6" fill="#FDA4AF" opacity="0.65" />

        {/* 10. FRONT LEGS & INTERACTIVE PROPS */}

        {/* GYM VARIANT: LUNA LIFTING WEIGHTS UP AND DOWN! */}
        {variant === 'gym' && (
          <g className="anim-weights">
            {/* Barbell metal bar */}
            <line x1="50" y1="140" x2="150" y2="140" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            {/* Left Weight Plates */}
            <rect x="42" y="125" width="10" height="30" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="34" y="128" width="8" height="24" rx="2" fill="#E11D48" stroke="#BE123C" strokeWidth="1.5" />
            {/* Right Weight Plates */}
            <rect x="148" y="125" width="10" height="30" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="158" y="128" width="8" height="24" rx="2" fill="#E11D48" stroke="#BE123C" strokeWidth="1.5" />
            {/* Paws gripping the bar */}
            <circle cx="78" cy="140" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="122" cy="140" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Weight labels */}
            <text x="36" y="143" fill="#FFFFFF" fontSize="7" fontWeight="bold">5</text>
            <text x="160" y="143" fill="#FFFFFF" fontSize="7" fontWeight="bold">5</text>
          </g>
        )}

        {/* TEETH VARIANT: LUNA HOLDING ANIMATED SCRUBBING TOOTHBRUSH */}
        {variant === 'teeth' && (
          <g className="anim-brush">
            {/* Pink toothbrush */}
            <path d="M120 120 L135 90" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" />
            {/* White bristles with blue toothpaste */}
            <rect x="130" y="85" width="12" height="7" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M130 85 Q136 80 142 85" fill="#38BDF8" />
            {/* Paw holding toothbrush */}
            <circle cx="123" cy="115" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Normal left paw */}
            <rect x="76" y="145" width="16" height="28" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}

        {/* HOMEWORK VARIANT: LUNA HOLDING A BIG PENCIL & OPEN BOOK */}
        {variant === 'homework' && (
          <g>
            {/* Yellow pencil across paw */}
            <polygon points="120,115 155,90 158,94 123,119" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <polygon points="155,90 162,85 158,94" fill="#FDE68A" />
            <polygon points="160,86 162,85 161,88" fill="#0F172A" />
            <rect x="117" y="117" width="5" height="5" fill="#F43F5E" />
            {/* Paw holding pencil */}
            <circle cx="128" cy="115" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Left paw resting on a little book */}
            <rect x="70" y="148" width="28" height="18" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
            <path d="M84 148 L84 166" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="78" cy="148" r="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>
        )}

        {/* PIANO VARIANT: LUNA TAPPING PIANO KEYS */}
        {variant === 'piano' && (
          <g>
            {/* Mini piano keyboard in front */}
            <rect x="68" y="152" width="64" height="20" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <line x1="78" y1="152" x2="78" y2="172" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="88" y1="152" x2="88" y2="172" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="98" y1="152" x2="98" y2="172" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="108" y1="152" x2="108" y2="172" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="118" y1="152" x2="118" y2="172" stroke="#0F172A" strokeWidth="1.5" />
            {/* Black keys */}
            <rect x="74" y="152" width="5" height="11" fill="#0F172A" />
            <rect x="84" y="152" width="5" height="11" fill="#0F172A" />
            <rect x="104" y="152" width="5" height="11" fill="#0F172A" />
            <rect x="114" y="152" width="5" height="11" fill="#0F172A" />
            {/* Paws on keys */}
            <ellipse cx="80" cy="154" rx="8" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <ellipse cx="112" cy="154" rx="8" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>
        )}

        {/* CLEANING VARIANT: LUNA HOLDING A COLORFUL FEATHER DUSTER */}
        {variant === 'cleaning' && (
          <g>
            {/* Feather duster handle */}
            <line x1="120" y1="145" x2="148" y2="105" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            {/* Feathers */}
            <circle cx="148" cy="102" r="9" fill="#06B6D4" opacity="0.8" />
            <circle cx="152" cy="98" r="8" fill="#EC4899" opacity="0.8" />
            <circle cx="144" cy="95" r="8" fill="#F59E0B" opacity="0.8" />
            {/* Paws */}
            <rect x="76" y="145" width="16" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="124" cy="138" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}

        {/* DEFAULT & WALK LEGS (Fluffy white paws) */}
        {variant !== 'gym' && variant !== 'teeth' && variant !== 'homework' && variant !== 'piano' && variant !== 'cleaning' && (
          <g>
            <rect x="78" y="145" width="16" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <ellipse cx="86" cy="175" rx="10" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <rect x="106" y="145" width="16" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <ellipse cx="114" cy="175" rx="10" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
