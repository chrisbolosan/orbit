"use client";
import { useMemo } from "react";

export function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur: (Math.random() * 4 + 2).toFixed(1),
      delay: (Math.random() * 4).toFixed(1),
      minOp: (Math.random() * 0.1 + 0.05).toFixed(2),
      maxOp: (Math.random() * 0.5 + 0.3).toFixed(2),
    }));
  }, []);

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--dur": `${s.dur}s`,
            "--delay": `${s.delay}s`,
            "--min-op": s.minOp,
            "--max-op": s.maxOp,
          } as React.CSSProperties}
        />
      ))}
      {/* Nebula blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(124,106,255,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: "400px",
          height: "250px",
          background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
