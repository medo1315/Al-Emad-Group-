export function OliveBranchDecor({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main Stem */}
      <path
        d="M100 20 Q105 60 100 100 Q95 140 100 180"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />

      {/* Left Leaves */}
      <ellipse cx="80" cy="40" rx="8" ry="15" fill="currentColor" opacity="0.2" transform="rotate(-30 80 40)" />
      <ellipse cx="75" cy="70" rx="8" ry="15" fill="currentColor" opacity="0.25" transform="rotate(-25 75 70)" />
      <ellipse cx="80" cy="100" rx="8" ry="15" fill="currentColor" opacity="0.2" transform="rotate(-30 80 100)" />
      <ellipse cx="75" cy="130" rx="8" ry="15" fill="currentColor" opacity="0.25" transform="rotate(-25 75 130)" />
      <ellipse cx="80" cy="160" rx="8" ry="15" fill="currentColor" opacity="0.2" transform="rotate(-30 80 160)" />

      {/* Right Leaves */}
      <ellipse cx="120" cy="50" rx="8" ry="15" fill="currentColor" opacity="0.25" transform="rotate(30 120 50)" />
      <ellipse cx="125" cy="80" rx="8" ry="15" fill="currentColor" opacity="0.2" transform="rotate(25 125 80)" />
      <ellipse cx="120" cy="110" rx="8" ry="15" fill="currentColor" opacity="0.25" transform="rotate(30 120 110)" />
      <ellipse cx="125" cy="140" rx="8" ry="15" fill="currentColor" opacity="0.2" transform="rotate(25 125 140)" />
      <ellipse cx="120" cy="170" rx="8" ry="15" fill="currentColor" opacity="0.25" transform="rotate(30 120 170)" />

      {/* Olives */}
      <circle cx="78" cy="55" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="122" cy="65" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="73" cy="115" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="127" cy="125" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
