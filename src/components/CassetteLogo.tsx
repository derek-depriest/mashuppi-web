export function CassetteLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cassetteBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="tapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f093fb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f5576c', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="labelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#ffeaa7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fdcb6e', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Cassette body */}
      <rect x="50" y="80" width="400" height="240" rx="16" fill="url(#cassetteBody)" />
      
      {/* Label area */}
      <rect x="80" y="110" width="340" height="100" rx="8" fill="url(#labelGradient)" />
      
      {/* Label text */}
      <text x="250" y="170" fontFamily="Impact, Arial Black, sans-serif" 
            fontSize="42" fontWeight="900" fill="#2d3748" textAnchor="middle" letterSpacing="4">
        MASHUPPI
      </text>
      
      {/* Reels */}
      <circle cx="150" cy="260" r="45" fill="#2d3748" opacity="0.8"/>
      <circle cx="150" cy="260" r="38" fill="url(#tapeGradient)"/>
      <circle cx="150" cy="260" r="20" fill="#1a1a1a"/>
      <circle cx="150" cy="260" r="15" fill="#2d3748"/>
      
      <circle cx="350" cy="260" r="45" fill="#2d3748" opacity="0.8"/>
      <circle cx="350" cy="260" r="38" fill="url(#tapeGradient)"/>
      <circle cx="350" cy="260" r="20" fill="#1a1a1a"/>
      <circle cx="350" cy="260" r="15" fill="#2d3748"/>
      
      {/* Tape window */}
      <rect x="185" y="245" width="130" height="30" rx="4" fill="#1a1a1a" opacity="0.6"/>
      
      {/* Screws */}
      <circle cx="70" cy="100" r="6" fill="#2d3748" opacity="0.5"/>
      <circle cx="430" cy="100" r="6" fill="#2d3748" opacity="0.5"/>
      <circle cx="70" cy="300" r="6" fill="#2d3748" opacity="0.5"/>
      <circle cx="430" cy="300" r="6" fill="#2d3748" opacity="0.5"/>
    </svg>
  );
}