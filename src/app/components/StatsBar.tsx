"use client";
import { CardWithRetention, getStatus } from "@/lib/srs";
import { useMemo } from "react";

interface StatsProps { cards: CardWithRetention[]; }

export function StatsBar({ cards }: StatsProps) {
  const stats = useMemo(() => {
    const due = cards.filter((c) => getStatus(c) === "due").length;
    const upcoming = cards.filter((c) => getStatus(c) === "upcoming").length;
    const learned = cards.filter((c) => getStatus(c) === "learned").length;
    const avgRetention = cards.length > 0 ? Math.round(cards.reduce((s, c) => s + c.retention, 0) / cards.length) : 0;
    return { due, upcoming, learned, avgRetention, total: cards.length };
  }, [cards]);

  const metrics = [
    { label: "Due now",       value: stats.due,              color: "#f87171", bg: "rgba(248,113,113,0.08)", urgent: stats.due > 0 },
    { label: "Upcoming",      value: stats.upcoming,         color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
    { label: "In orbit",      value: stats.learned,          color: "#34d399", bg: "rgba(52,211,153,0.08)" },
    { label: "Avg retention", value: `${stats.avgRetention}%`, color: "#7c6aff", bg: "rgba(124,106,255,0.08)" },
    { label: "Total cards",   value: stats.total,            color: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
  ];

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {metrics.map((m) => (
        <div key={m.label} style={{
          flex: "1 1 100px", background: m.bg,
          border: `1px solid ${m.color}20`, borderRadius: "12px",
          padding: "14px 16px", position: "relative", overflow: "hidden",
        }}>
          {(m as any).urgent && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: m.color }} />
          )}
          <div style={{ fontSize: "22px", fontWeight: 600, color: m.color, fontFamily: "'DM Mono', monospace", lineHeight: 1, marginBottom: "4px" }}>
            {m.value}
          </div>
          <div style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
