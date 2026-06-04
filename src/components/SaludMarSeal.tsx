import React from 'react';

interface SaludMarSealProps {
  className?: string;
  size?: number;
}

export const SaludMarSeal: React.FC<SaludMarSealProps> = ({
  className = '',
  size = 110
}) => {
  return (
    <div 
      style={{ width: size, height: size * 1.15 }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300 hover:scale-[1.03]"
      >
        <defs>
          {/* Subtle elegant drop shadow to make the vector pop */}
          <filter id="sealSophisticatedShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#082b4d" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#d9a51c" floodOpacity="0.07" />
          </filter>

          {/* Premium gold gradients mapping precisely to the brand's aesthetic */}
          <linearGradient id="sealGoldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d9a51c" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Luxury core metallic gold radial gradient */}
          <radialGradient id="sealCoreGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffdf5" />
            <stop offset="70%" stopColor="#fefaf0" />
            <stop offset="100%" stopColor="#faf2db" />
          </radialGradient>

          {/* Deep corporate academic blue gradient */}
          <linearGradient id="sealBlueAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="60%" stopColor="#082b4d" />
            <stop offset="100%" stopColor="#031526" />
          </linearGradient>
        </defs>

        {/* ELEGANT HANGING RIBBONS (Directly inspired by the user's ribbon-medal image structure) */}
        <g id="medal-ribbon-tails" filter="url(#sealSophisticatedShadow)">
          {/* Left Ribbon Tail (Brand Blue with thin Gold edging) */}
          <path
            d="M 82,110 L 52,215 L 75,200 L 98,215 L 98,126 Z"
            fill="url(#sealBlueAccent)"
            stroke="#d9a51c"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Inner accent strip on left ribbon */}
          <path
            d="M 62,130 L 72,198 M 70,130 L 80,198"
            stroke="#d9a51c"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />

          {/* Right Ribbon Tail (Classic Medal Gold with Deep Orange accent stripes) */}
          <path
            d="M 102,126 L 102,215 L 125,200 L 148,215 L 118,110 Z"
            fill="url(#sealGoldAccent)"
            stroke="#d9a51c"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Middle accent shadow on right ribbon */}
          <path
            d="M 125,126 L 125,200"
            stroke="#b45309"
            strokeWidth="1.5"
            opacity="0.25"
          />
        </g>

        {/* MAIN ROSETTE MEDALLION BODY */}
        <g id="rosette-head" filter="url(#sealSophisticatedShadow)">
          {/* Background shield/circle - blocks anything from underneath */}
          <circle cx="100" cy="85" r="76" fill="#ffffff" />
          
          {/* Very elegant outer thin gold frame circle (Just like the user's photo!) */}
          <circle cx="100" cy="85" r="75" stroke="#d9a51c" strokeWidth="1.5" />
          
          {/* Subtle concentric rings for high security looks */}
          <circle cx="100" cy="85" r="72" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="100" cy="85" r="69" stroke="#082b4d" strokeWidth="0.7" strokeDasharray="3 2" opacity="0.15" />

          {/* Elegant gold dots inside the golden perimeter line, framing the entire medallion */}
          <g opacity="0.6">
            <circle cx="100" cy="11.5" r="1.5" fill="#d9a51c" />
            <circle cx="100" cy="158.5" r="1.5" fill="#d9a51c" />
            <circle cx="26.5" cy="85" r="1.5" fill="#d9a51c" />
            <circle cx="173.5" cy="85" r="1.5" fill="#d9a51c" />
            
            {/* Diagonals */}
            <circle cx="48" cy="33" r="1.2" fill="#d9a51c" />
            <circle cx="152" cy="137" r="1.2" fill="#d9a51c" />
            <circle cx="152" cy="33" r="1.2" fill="#d9a51c" />
            <circle cx="48" cy="137" r="1.2" fill="#d9a51c" />

            {/* Intermediates */}
            <circle cx="71" cy="17" r="1" fill="#d9a51c" />
            <circle cx="129" cy="17" r="1" fill="#d9a51c" />
            <circle cx="168" cy="47" r="1" fill="#d9a51c" />
            <circle cx="168" cy="123" r="1" fill="#d9a51c" />
            <circle cx="129" cy="153" r="1" fill="#d9a51c" />
            <circle cx="71" cy="153" r="1" fill="#d9a51c" />
            <circle cx="32" cy="123" r="1" fill="#d9a51c" />
            <circle cx="32" cy="47" r="1" fill="#d9a51c" />
          </g>

          {/* Inner Plate Core with luxury soft radial aura */}
          <circle cx="100" cy="85" r="58" fill="url(#sealCoreGold)" />
          {/* Inner core framing ring */}
          <circle cx="100" cy="85" r="56" stroke="#082b4d" strokeWidth="1" opacity="0.8" />
          <circle cx="100" cy="85" r="53" stroke="#d9a51c" strokeWidth="0.8" strokeDasharray="3 1.5" opacity="0.5" />

          {/* WRAPPED PREMIUM TYPOGRAPHY inside the upper arc */}
          <path id="sealTopTextArc" d="M 52,85 A 48,48 0 0,1 148,85" fill="none" />
          <text fill="#082b4d" fontSize="7.8" fontWeight="950" letterSpacing="0.8px" fontFamily="'Plus Jakarta Sans', sans-serif" className="uppercase font-black select-none tracking-widest">
            <textPath href="#sealTopTextArc" startOffset="50%" textAnchor="middle">
              REGISTRO OFICIAL
            </textPath>
          </text>

          {/* WRAPPED PREMIUM TYPOGRAPHY inside the lower arc */}
          <path id="sealBottomTextArc" d="M 148,85 A 48,48 0 0,1 52,85" fill="none" />
          <text fill="#082b4d" fontSize="7.8" fontWeight="950" letterSpacing="0.8px" fontFamily="'Plus Jakarta Sans', sans-serif" className="uppercase font-black select-none tracking-widest">
            <textPath href="#sealBottomTextArc" startOffset="50%" textAnchor="middle">
              ACADEMIA SALUD-MAR
            </textPath>
          </text>

          {/* Small Gold Divider Stars on the sides separating Top and Bottom texts */}
          <polygon points="49,85 50.2,87.2 52.8,87.2 50.7,88.7 51.5,91.2 49,89.7 46.5,91.2 47.3,88.7 45.2,87.2 47.8,87.2" fill="#d9a51c" />
          <polygon points="151,85 152.2,87.2 154.8,87.2 152.7,88.7 153.5,91.2 151,89.7 148.5,91.2 149.3,88.7 147.2,87.2 149.8,87.2" fill="#d9a51c" />

          {/* CENTER UNIONS: OFFICIAL SALUD-MAR SACRED SYMBOL OF MEDICINE */}
          {/* Rod of Asclepius and Snake nested inside the core plate with exquisite golden/blue highlights */}
          <g id="official-asclepius-medallion" transform="translate(68, 51) scale(0.128)">
            {/* The Staff - Royal deep blue */}
            <rect x="244" y="20" width="12" height="310" rx="4" fill="#082b4d" />
            {/* Golden top sphere */}
            <circle cx="250" cy="18" r="16" fill="#d9a51c" />
            {/* Golden crescent chalice base */}
            <path d="M 230,34 C 230,48 270,48 270,34 L 263,34 C 263,43 237,43 237,34 Z" fill="#d9a51c" />

            {/* Sleek Golden Serpent coiling gracefully around the staff */}
            <path 
              d="M 250,295 
                 C 215,290 195,260 215,235 
                 C 235,210 275,200 270,175 
                 C 265,150 190,140 215,110 
                 C 230,90  265,85  285,100
                 C 295,108 305,108 310,113" 
              stroke="#d9a51c" 
              strokeWidth="20" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
            />
            {/* Outer brand blue glow outline for the body to ensure premium contrast */}
            <path 
              d="M 250,295 
                 C 215,290 195,260 215,235 
                 C 235,210 275,200 270,175 
                 C 265,150 190,140 215,110 
                 C 230,90  265,85  285,100
                 C 295,108 305,108 310,113" 
              stroke="#082b4d" 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
            />

            {/* Snake Head looking right */}
            <path 
              d="M 310,113 C 315,116 322,118 327,117 C 334,115 342,109 344,103 C 345,98 340,94 332,94 C 322,94 312,102 310,113 Z" 
              fill="#082b4d" 
            />
            <path 
              d="M 310,113 C 315,116 322,118 327,117 C 334,115 342,109 344,103 C 345,98 340,94 332,94 C 322,94 312,102 310,113 Z" 
              stroke="#d9a51c" 
              strokeWidth="3"
              fill="none"
            />
            {/* Serpent Eye */}
            <circle cx="332" cy="101" r="3.5" fill="#d9a51c" />

            {/* Golden Forked Tongue */}
            <path 
              d="M 344,103 Q 352,105 358,110 M 344,103 Q 354,100 360,98" 
              stroke="#d9a51c" 
              strokeWidth="3" 
              strokeLinecap="round" 
              fill="none" 
            />
          </g>

          {/* Classy Underlay Laurels - Symbolizing Excellence and Professional Completion */}
          <g opacity="0.15" transform="translate(100, 85)" className="text-amber-800">
            {/* Left branch */}
            <path d="M -32,32 C -46,21 -46,-4 -32,-21" stroke="#d9a51c" strokeWidth="2.5" fill="none" />
            <path d="M -37,18 C -45,15 -42,3 -34,6 Z" fill="#d9a51c" />
            <path d="M -36,-1 C -44,-4 -41,-16 -33,-13 Z" fill="#d9a51c" />
            {/* Right branch */}
            <path d="M 32,32 C 46,21 46,-4 32,-21" stroke="#d9a51c" strokeWidth="2.5" fill="none" />
            <path d="M 37,18 C 45,15 42,3 34,6 Z" fill="#d9a51c" />
            <path d="M 36,-1 C 44,-4 41,-16 33,-13 Z" fill="#d9a51c" />
          </g>

          {/* Innermost Delicate Ring */}
          <circle cx="100" cy="85" r="30" stroke="#d9a51c" strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
