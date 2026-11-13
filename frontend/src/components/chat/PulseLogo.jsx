export default function PulseLogo({ size = 44, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-hidden ${className}`}
      aria-label="PulseChat Logo"
    >
      <defs>
        {/* Purple squircle gradient */}
        <linearGradient
          id="pulse-squircle"
          x1="0"
          y1="0"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7E65FF" />
          <stop offset="1" stopColor="#5337DF" />
        </linearGradient>

        {/* Royal blue bubble gradient */}
        <linearGradient
          id="pulse-bubble"
          x1="6"
          y1="7"
          x2="38"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2E4DF6" />
          <stop offset="1" stopColor="#1B33D4" />
        </linearGradient>

        {/* Cyan glow filter */}
        <filter
          id="cyan-glow"
          x="7"
          y="12"
          width="30"
          height="15"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="1.2"
            floodColor="#00F5FF"
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      {/* 1. Purple Squircle Container */}
      <rect width="44" height="44" rx="14" fill="url(#pulse-squircle)" />

      {/* 2. Scaled-up Royal Blue Speech Bubble */}
      <path
        d="M22 7C13.72 7 7 12.37 7 19C7 22.64 9.07 25.88 12.31 27.9L11.05 32.42C10.81 33.27 11.62 34 12.43 33.6L18.18 30.75C19.4 30.93 20.65 31.02 22 31.02C30.28 31.02 37 25.65 37 19C37 12.37 30.28 7 22 7Z"
        fill="url(#pulse-bubble)"
      />

      {/* 3. Scaled-up Cyan Pulse Nodes (●─●─●) */}
      <g filter="url(#cyan-glow)">
        {/* Connecting pulse line */}
        <line
          x1="15"
          y1="19"
          x2="29"
          y2="19"
          stroke="#00F5FF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Left Pulse Node */}
        <circle cx="15" cy="19" r="3.2" fill="#00F5FF" />

        {/* Center Pulse Node */}
        <circle cx="22" cy="19" r="3.2" fill="#00F5FF" />

        {/* Right Pulse Node */}
        <circle cx="29" cy="19" r="3.2" fill="#00F5FF" />
      </g>
    </svg>
  );
}
