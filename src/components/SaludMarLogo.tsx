import React from 'react';

interface SaludMarLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  width?: string | number;
  height?: string | number;
  symbolOnly?: boolean;
}

export const SaludMarLogo: React.FC<SaludMarLogoProps> = ({ 
  className = '', 
  size = 'md',
  width,
  height,
  symbolOnly = false
}) => {
  // Determine dimensions based on size pre-settings
  let dims = { w: 140, h: 140 };
  if (size === 'xs') dims = { w: 50, h: 50 };
  if (size === 'sm') dims = { w: 90, h: 90 };
  if (size === 'md') dims = { w: 140, h: 140 };
  if (size === 'lg') dims = { w: 220, h: 220 };
  if (size === 'xl') dims = { w: 320, h: 320 };
  if (size === 'custom' && width && height) {
    dims = { w: Number(width), h: Number(height) };
  }

  // If symbolOnly, we narrow the viewBox to focus exclusively on the Rod of Asclepius and serpent.
  // The serpent extends from X: 195 to X: 360, Y: 10 to Y: 320.
  const viewBox = symbolOnly ? "185 10 175 315" : "0 0 500 500";

  return (
    <svg 
      width={dims.w} 
      height={dims.h} 
      viewBox={viewBox} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rod of Asclepius (Staff) */}
      {/* Main Spear/Rod */}
      <rect x="245" y="15" width="10" height="310" rx="3" fill="#000000" />
      {/* Top Sphere Knob */}
      <circle cx="250" cy="18" r="14" fill="#000000" />
      {/* Top Crescent / Cup */}
      <path d="M 232,32 C 232,46 268,46 268,32 L 263,32 C 263,41 237,41 237,32 Z" fill="#000000" />

      {/* Sleek Serpent Body */}
      {/* Coiling left and right around the rod */}
      <path 
        d="M 250,295 
           C 215,290 195,260 215,235 
           C 235,210 275,200 270,175 
           C 265,150 190,140 215,110 
           C 230,90  265,85  285,100
           C 295,108 305,108 310,113" 
        stroke="#000000" 
        strokeWidth="15" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      
      {/* Serpent Head looking to the right */}
      <path 
        d="M 310,113 C 315,116 322,118 327,117 C 334,115 342,109 344,103 C 345,98 340,94 332,94 C 322,94 312,102 310,113 Z" 
        fill="#000000" 
      />
      
      {/* Serpent Eye */}
      <circle cx="332" cy="101" r="2.5" fill="#ffffff" />
      
      {/* Forked Tongue */}
      <path d="M 344,103 Q 352,105 358,110 M 344,103 Q 354,100 360,98" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />

      {!symbolOnly && (
        <>
          {/* Typography: SALUD (Gold #d9a51c) & MAR (Deep Blue #082b4d) */}
          <text 
            x="90" 
            y="275" 
            fill="#d9a51c" 
            fontFamily="'Plus Jakarta Sans', sans-serif" 
            fontWeight="bold" 
            fontSize="54" 
            letterSpacing="2"
          >
            SALUD
          </text>

          <text 
            x="280" 
            y="304" 
            fill="#0b5c8c" 
            fontFamily="'Plus Jakarta Sans', sans-serif" 
            fontWeight="bold" 
            fontSize="54" 
            letterSpacing="2"
          >
            MAR
          </text>

          {/* Golden Horizontal Line under SALUD */}
          <line x1="170" y1="285" x2="330" y2="285" stroke="#d9a51c" strokeWidth="4" />
          
          {/* Blue Horizontal Line under MAR */}
          <line x1="170" y1="315" x2="330" y2="315" stroke="#082b4d" strokeWidth="4" />

          {/* Services and Trainings Text (Centered) */}
          <text 
            x="250" 
            y="360" 
            fill="#111111" 
            fontFamily="Georgia, serif" 
            fontWeight="bold" 
            fontSize="25" 
            textAnchor="middle"
          >
            Servicios Médicos
          </text>

          <text 
            x="250" 
            y="390" 
            fill="#111111" 
            fontFamily="Georgia, serif" 
            fontWeight="normal" 
            fontSize="21" 
            textAnchor="middle"
            fontStyle="italic"
          >
            y
          </text>

          <text 
            x="250" 
            y="428" 
            fill="#111111" 
            fontFamily="Georgia, serif" 
            fontWeight="bold" 
            fontSize="25" 
            textAnchor="middle"
          >
            Capacitaciones
          </text>

          {/* Bottom Ornamental Divider */}
          <line x1="90" y1="465" x2="220" y2="465" stroke="#777777" strokeWidth="1" />
          <line x1="280" y1="465" x2="410" y2="465" stroke="#777777" strokeWidth="1" />
          
          {/* Infinity/Loop ornament at center */}
          <path 
            d="M 230,465 C 235,461 240,461 245,465 C 250,469 255,469 260,465 C 265,461 270,461 275,465 M 230,465 C 235,469 240,469 245,465 C 250,461 255,461 260,465 C 265,469 270,469 275,465" 
            stroke="#000000" 
            strokeWidth="2" 
            fill="none" 
          />
        </>
      )}
    </svg>
  );
};
