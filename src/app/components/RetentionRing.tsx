"use client";

interface RetentionRingProps {
  retention: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function RetentionRing({ retention, size = 56, strokeWidth = 4, showLabel = true }: RetentionRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, retention));
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#7c6aff" : pct >= 60 ? "#34d399" : pct >= 35 ? "#fbbf24" : "#f87171";
  const textColor = pct >= 80 ? "#a898ff" : pct >= 60 ? "#6ee7b7" : pct >= 35 ? "#fcd34d" : "#fca5a5";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }} />
      </svg>
      {showLabel && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono', monospace", fontSize: size > 48 ? "13px" : "10px", fontWeight: 500, color: textColor,
        }}>
          {Math.round(pct)}%
        </div>
      )}
    </div>
  );
}
