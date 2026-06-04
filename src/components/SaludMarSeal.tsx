import React from 'react';

interface SaludMarSealProps {
  className?: string;
  size?: number;
}

export const SaludMarSeal: React.FC<SaludMarSealProps> = ({
  className = '',
  size = 85
}) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_8px_rgba(217,165,28,0.15)] hover:drop-shadow-[0_4px_12px_rgba(217,165,28,0.25)] transition-all duration-300"
      >
        <defs>
          {/* Subtle concentric gold gradient for shiny premium ring edges */}
          <linearGradient id="premiumGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" /> {/* Tailwind yellow-200 */}
            <stop offset="30%" stopColor="#d9a51c" /> {/* Brand Gold */}
            <stop offset="70%" stopColor="#b48310" /> {/* Darker Gold */}
            <stop offset="100%" stopColor="#a3760a" />
          </linearGradient>

          {/* Clean, high-prestige circular path for engraving text wrapping */}
          <path
            id="sealCircularTextPath"
            d="M 32,100 A 68,68 0 1,1 168,100 A 68,68 0 1,1 32,100"
          />
        </defs>

        {/* 1. SOLID CLASSY BACKGROUND PLATE (Protects the certificate paper background text grid) */}
        <circle cx="100" cy="100" r="92" fill="#ffffff" />
        {/* Soft elegant creamy luster radial gradient background */}
        <circle cx="100" cy="100" r="92" fill="radial-gradient(circle, rgba(255,253,245,1) 0%, rgba(255,255,255,1) 100%)" />

        {/* 2. DUAL CONCENTRIC GOLD OUTLINES */}
        {/* Outer security border with continuous premium dot accents representing official registry */}
        <circle cx="100" cy="100" r="91" stroke="url(#premiumGoldBorder)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="88" stroke="url(#premiumGoldBorder)" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.8" />
        
        {/* Main bold golden dividing ring */}
        <circle cx="100" cy="100" r="76" stroke="url(#premiumGoldBorder)" strokeWidth="1.8" />
        
        {/* Innermost crisp gold guide ring */}
        <circle cx="100" cy="100" r="54" stroke="url(#premiumGoldBorder)" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
        <circle cx="100" cy="100" r="51" stroke="#d9a51c" strokeWidth="0.8" opacity="0.4" />

        {/* 3. WRAPPED SECURITY ENGRAVING TEXT */}
        {/* Elegant typography in capital letters wrapping around the circular border */}
        <text 
          fill="#082b4d" 
          fontSize="9.5" 
          fontWeight="900" 
          letterSpacing="1.8" 
          fontFamily="'Plus Jakarta Sans', sans-serif" 
          className="select-none tracking-widest font-black uppercase opacity-90"
        >
          <textPath href="#sealCircularTextPath" startOffset="0%">
            SALUD-MAR ACADEMY • REGISTRO DE VALIDEZ •
          </textPath>
        </text>

        {/* 4. CLASSICAL GOLDEN LAURELS (HONORARY BRANCHES SYMBOL OF EXCELLENCE) */}
        {/* Masterfully drawn classical academic leaves hugging both sides of the center symbol */}
        <g id="laurel-leaves" opacity="0.35" className="text-amber-600">
          {/* Left Laurel Branch */}
          <path d="M 60,140 C 48,125 48,95 62,75" stroke="#d9a51c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 52,130 C 44,124 45,116 52,120 Z" fill="#d9a51c" />
          <path d="M 49,114 C 41,108 42,100 49,104 Z" fill="#d9a51c" />
          <path d="M 51,98 C 43,92 44,84 51,88 Z" fill="#d9a51c" />
          <path d="M 55,82 C 48,76 49,68 56,72 Z" fill="#d9a51c" />
          
          {/* Right Laurel Branch */}
          <path d="M 140,140 C 152,125 152,95 138,75" stroke="#d9a51c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 148,130 C 156,124 155,116 148,120 Z" fill="#d9a51c" />
          <path d="M 151,114 C 159,108 158,100 151,104 Z" fill="#d9a51c" />
          <path d="M 149,98 C 157,92 156,84 149,88 Z" fill="#d9a51c" />
          <path d="M 145,82 C 152,76 151,68 144,72 Z" fill="#d9a51c" />
        </g>

        {/* 5. BRAND SYMBOL AS THE CORE PIECE (COILED SERPENT ON STAFF OF ASCLEPIUS) */}
        {/* Beautifully rendered inside the innermost gold framing */}
        <g id="core-emblem-rod" transform="translate(68, 48) scale(0.128)" className="pointer-events-none select-none">
          {/* The Rod (Staff) in deep elite brand blue */}
          <rect x="244" y="20" width="12" height="310" rx="3" fill="#082b4d" />
          {/* Top Sphere Knob in gold */}
          <circle cx="250" cy="22" r="16" fill="#d9a51c" />
          {/* Crest Cup in gold */}
          <path d="M 230,36 C 230,50 270,50 270,36 L 264,36 C 264,45 236,45 236,36 Z" fill="#d9a51c" />

          {/* Coiling Serpent Body in brand blue */}
          <path 
            d="M 250,295 
               C 215,290 195,260 215,235 
               C 235,210 275,200 270,175 
               C 265,150 190,140 215,110 
               C 230,90  265,85  285,100
               C 295,108 305,108 310,113" 
            stroke="#082b4d" 
            strokeWidth="24" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          
          {/* Serpent Head and Eye */}
          <path 
            d="M 310,113 C 315,116 322,118 327,117 C 334,115 342,109 344,103 C 345,98 340,94 332,94 C 322,94 312,102 310,113 Z" 
            fill="#082b4d" 
          />
          <circle cx="332" cy="101" r="3.5" fill="#fef08a" />
          
          {/* Golden double-forked tongue */}
          <path 
            d="M 344,103 Q 352,105 358,110 M 344,103 Q 354,100 360,98" 
            stroke="#d9a51c" 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill="none" 
          />
        </g>

        {/* 6. EMBOSSED THREE TRIPLE ACADEMIC STARS */}
        {/* Small cluster of 3 premium gold stars at bottom center indicating level of certification */}
        <g id="bottom-stars-row" transform="translate(100, 142)" className="text-[#d9a51c]">
          {/* Center Star */}
          <polygon points="0,-4 1.2,-1 4.5,-1 1.8,1 2.8,4 0,2.2 -2.8,4 -1.8,1 -4.5,-1 -1.2,-1" fill="currentColor" transform="scale(1.15)" />
          {/* Left Star */}
          <polygon points="0,-4 1.2,-1 4.5,-1 1.8,1 2.8,4 0,2.2 -2.8,4 -1.8,1 -4.5,-1 -1.2,-1" fill="currentColor" transform="translate(-10, 1) scale(0.8)" />
          {/* Right Star */}
          <polygon points="0,-4 1.2,-1 4.5,-1 1.8,1 2.8,4 0,2.2 -2.8,4 -1.8,1 -4.5,-1 -1.2,-1" fill="currentColor" transform="translate(10, 1) scale(0.8)" />
        </g>
      </svg>
    </div>
  );
};
