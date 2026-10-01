import React from 'react';

interface KeepChatLogoProps {
  size?: number;
  variant?: 'icon' | 'full';
  className?: string;
  showText?: boolean;
}

export const KeepChatLogo: React.FC<KeepChatLogoProps> = ({
  size = 36,
  variant = 'icon',
  className = '',
  showText = variant === 'full',
}) => {
  // If variant === 'full', we compute height to accommodate typography comfortably
  const isFull = variant === 'full' || showText;
  const viewBoxWidth = isFull ? 240 : 200;
  const viewBoxHeight = isFull ? 250 : 200;
  const displayWidth = size;
  const displayHeight = isFull ? Math.round(size * 1.05) : size;

  return (
    <svg
      width={displayWidth}
      height={displayHeight}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
      aria-label="KeepChat Logo"
    >
      <defs>
        {/* Medallion Radial Gradient */}
        <radialGradient
          id="kc-medallion-grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(100 95) rotate(90) scale(85)"
        >
          <stop offset="0%" stopColor="#25553b" />
          <stop offset="60%" stopColor="#173a27" />
          <stop offset="100%" stopColor="#0b2216" />
        </radialGradient>

        {/* Ambient Outer Halo */}
        <radialGradient
          id="kc-halo-grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(100 95) rotate(90) scale(95)"
        >
          <stop offset="65%" stopColor="#8be296" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8be296" stopOpacity="0" />
        </radialGradient>

        {/* Golden Key Gradient */}
        <linearGradient id="kc-gold-grad" x1="80" y1="30" x2="120" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7dc9f" />
          <stop offset="35%" stopColor="#d9a557" />
          <stop offset="70%" stopColor="#b47833" />
          <stop offset="100%" stopColor="#7a4a1b" />
        </linearGradient>

        {/* Inner Speech Bubble Interior Gradient */}
        <linearGradient id="kc-bubble-grad" x1="100" y1="45" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86ce6c" />
          <stop offset="55%" stopColor="#4f9a46" />
          <stop offset="100%" stopColor="#2e6c2f" />
        </linearGradient>

        {/* Arrow Glow Gradient */}
        <linearGradient id="kc-arrow-grad" x1="85" y1="95" x2="115" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#24602f" />
          <stop offset="50%" stopColor="#7be184" />
          <stop offset="100%" stopColor="#c7f998" />
        </linearGradient>

        {/* Drop shadow filter for 3D realism */}
        <filter id="kc-shadow" x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#05140b" floodOpacity="0.4" />
        </filter>
        <filter id="kc-key-shadow" x="40" y="20" width="120" height="170" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Main Group Centered on 100, 95 */}
      <g transform={isFull ? 'translate(20, 0)' : ''}>
        {/* Soft Ambient Glow */}
        <circle cx="100" cy="95" r="92" fill="url(#kc-halo-grad)" />

        {/* Dark Forest Green Circular Medallion with Outer Ring */}
        <circle
          cx="100"
          cy="95"
          r="78"
          fill="url(#kc-medallion-grad)"
          stroke="#427d58"
          strokeWidth="3.5"
          filter="url(#kc-shadow)"
        />

        {/* Inner concentric ring border */}
        <circle
          cx="100"
          cy="95"
          r="72"
          fill="none"
          stroke="#1d4831"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Laurel Wreath Foliage (Left Side) */}
        <g fill="#295b3e" opacity="0.85">
          <path d="M48 95 C43 85 45 74 53 66 C53 74 51 86 48 95 Z" />
          <path d="M54 70 C49 61 53 51 63 45 C61 54 58 64 54 70 Z" />
          <path d="M66 50 C62 41 69 33 80 29 C77 38 72 46 66 50 Z" />
          <path d="M49 105 C44 115 47 126 55 132 C54 123 52 113 49 105 Z" />
          <path d="M57 128 C53 138 60 146 70 149 C67 141 62 133 57 128 Z" />
          <path d="M70 148 C68 156 77 161 88 160 C83 154 77 149 70 148 Z" />
        </g>

        {/* Laurel Wreath Foliage (Right Side) */}
        <g fill="#295b3e" opacity="0.85">
          <path d="M152 95 C157 85 155 74 147 66 C147 74 149 86 152 95 Z" />
          <path d="M146 70 C151 61 147 51 137 45 C139 54 142 64 146 70 Z" />
          <path d="M134 50 C138 41 131 33 120 29 C123 38 128 46 134 50 Z" />
          <path d="M151 105 C156 115 153 126 145 132 C146 123 148 113 151 105 Z" />
          <path d="M143 128 C147 138 140 146 130 149 C133 141 138 133 143 128 Z" />
          <path d="M130 148 C132 156 123 161 112 160 C117 154 123 149 130 148 Z" />
        </g>

        {/* THE KEY (Feather Quill Shaft + Speech Bubble Bow) with Drop Shadow */}
        <g filter="url(#kc-key-shadow)">
          {/* Feather Quill Shaft (Bottom part of key) */}
          {/* Central Stem */}
          <path
            d="M98 108 L100 166 L102 166 L102 108 Z"
            fill="#e8ba6e"
            stroke="#875322"
            strokeWidth="0.8"
          />

          {/* Feather Left Barbs */}
          <path
            d="M99 110 C93 115 88 123 88 132 C93 130 98 127 99 123 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />
          <path
            d="M99 125 C92 130 87 138 88 146 C93 144 98 140 99 136 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />
          <path
            d="M99 138 C94 143 91 150 93 158 C96 156 99 152 100 148 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />
          <path
            d="M100 150 C97 155 96 160 100 168 C100 163 100 157 100 150 Z"
            fill="#dfb164"
          />

          {/* Feather Right Barbs */}
          <path
            d="M101 110 C107 115 112 123 112 132 C107 130 102 127 101 123 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />
          <path
            d="M101 125 C108 130 113 138 112 146 C107 144 102 140 101 136 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />
          <path
            d="M101 138 C106 143 109 150 107 158 C104 156 101 152 100 148 Z"
            fill="url(#kc-gold-grad)"
            stroke="#663c12"
            strokeWidth="0.8"
          />

          {/* Feather Quill Nib Point */}
          <polygon points="98,165 102,165 100,172" fill="#58320c" />

          {/* Golden Collar / Bolster Rings */}
          <rect
            x="88"
            y="102"
            width="24"
            height="5"
            rx="2.5"
            fill="url(#kc-gold-grad)"
            stroke="#7a4a1b"
            strokeWidth="1"
          />
          <rect
            x="91"
            y="106"
            width="18"
            height="3"
            rx="1.5"
            fill="#f7dc9f"
            stroke="#7a4a1b"
            strokeWidth="0.8"
          />

          {/* Speech Bubble Key Head (Outer Gold Frame with speech pointer notch) */}
          <path
            d="M100 35 
               C123 35 141 53 141 75 
               C141 97 123 114 100 114 
               C95 114 91 113 87 111 
               L76 117 
               L79 105 
               C74 97 71 86 71 75 
               C71 53 89 35 100 35 Z"
            fill="url(#kc-gold-grad)"
            stroke="#693e15"
            strokeWidth="2.5"
          />

          {/* Speech Bubble Green Interior */}
          <path
            d="M100 42 
               C119 42 134 57 134 75 
               C134 93 119 107 100 107 
               C96 107 92 106 88 104 
               L81 108 
               L83 99 
               C79 92 77 84 77 75 
               C77 57 91 42 100 42 Z"
            fill="url(#kc-bubble-grad)"
            stroke="#1c552a"
            strokeWidth="1.5"
          />

          {/* Dynamic Curved Leaf-Arrow pointing up-right inside bubble */}
          {/* Arrow Tail / Curve */}
          <path
            d="M87 91 
               C89 82 94 74 103 69 
               C109 66 114 65 118 64 
               L116 71 
               C112 72 107 73 103 76 
               C96 80 93 86 91 92 Z"
            fill="url(#kc-arrow-grad)"
          />
          {/* Arrow Head (Curved Leaf Shape) */}
          <path
            d="M113 58 
               L126 62 
               L120 75 
               L117 68 
               L108 67 Z"
            fill="#d2f9a2"
            stroke="#1d5f29"
            strokeWidth="1.2"
          />
        </g>
      </g>

      {/* Optional Full Typography "KeepChat" */}
      {isFull && (
        <g transform="translate(0, 202)">
          {/* "Keep" in Deep Forest Green */}
          <text
            x="24"
            y="32"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="34"
            fontWeight="800"
            fill="#1e4d32"
            className="dark:fill-[#2dd4bf]"
            letterSpacing="-0.5"
          >
            Keep
          </text>

          {/* "Chat" in Warm Golden Caramel */}
          <text
            x="110"
            y="32"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="34"
            fontWeight="800"
            fill="#c08642"
            className="dark:fill-[#f3b567]"
            letterSpacing="-0.5"
          >
            Chat
          </text>

          {/* Arrow swoosh through Chat 'a' & 't' */}
          <path
            d="M174 28 C182 25 190 20 200 15 M200 15 L192 14 M200 15 L197 22"
            stroke="#c08642"
            className="dark:stroke-[#f3b567]"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};
