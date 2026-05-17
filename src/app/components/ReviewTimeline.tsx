"use client";
import { CardWithRetention, getDaysUntil, getStatus } from "@/lib/srs";
import { useMemo } from "react";

interface TimelineProps { cards: CardWithRetention[]; }

export function ReviewTimeline({ cards: allCards }: TimelineProps) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en", { weekday: "short", day: "numeric" });
      const dayCards = allCards.filter((c) => {
        const until = getDaysUntil(c);
        return i === 0 ? until <= 0 : until === i;
      });
      return { label, count: dayCards.length, isToday: i === 0 };
    });
  }, [allCards]);

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div style={{ background: "rgba(16,16,30,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(12px)" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Upcoming reviews
      </h3>
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "60px" }}>
        {days.map((day, i) => {
          const heightPct = day.count > 0 ? Math.max(20, (day.count / maxCount) * 100) : 4;
          const barColor = day.isToday && day.count > 0 ? "#f87171" : i <= 2 ? "#fbbf24" : "#7c6aff";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }} title={`${day.label}: ${day.count} cards`}>
              <div style={{
                width: "100%", height: `${heightPct}%`,
                background: day.count > 0 ? barColor + (day.isToday ? "cc" : "66") : "rgba(255,255,255,0.04)",
                borderRadius: "4px 4px 2px 2px", minHeight: "3px",
                border: day.isToday ? `1px solid ${barColor}` : "none",
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
        {days.map((day, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", fontSize: "9px",
            color: i === 0 ? "#a898ff" : "#334155",
            fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", overflow: "hidden",
          }}>
            {i === 0 ? "Today" : i <= 6 ? day.label.slice(0, 3) : "·"}
          </div>
        ))}
      </div>
    </div>
  );
}
