"use client";
import { useEffect, useState } from "react";

interface HeatmapData {
  streak: number;
  heatmap: { date: string; count: number }[];
  totalReviews: number;
}

function getColor(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.04)";
  if (count === 1) return "rgba(124,106,255,0.25)";
  if (count <= 3) return "rgba(124,106,255,0.45)";
  if (count <= 6) return "rgba(124,106,255,0.7)";
  return "#7c6aff";
}

export function ActivityHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  // Build a 52-week grid (364 days back from today)
  const today = new Date();
  const days: { date: string; count: number; dayOfWeek: number }[] = [];

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = data?.heatmap.find((h) => h.date === key)?.count ?? 0;
    days.push({ date: key, count, dayOfWeek: d.getDay() });
  }

  // Pad start to Sunday
  const firstDow = days[0].dayOfWeek;
  const padded = [...Array(firstDow).fill(null), ...days];

  // Group into weeks of 7
  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d !== null);
    if (first) {
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({
          label: new Date(first.date).toLocaleDateString("en", { month: "short" }),
          weekIdx: wi,
        });
        lastMonth = m;
      }
    }
  });

  const CELL = 12;
  const GAP = 3;
  const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div
      style={{
        background: "rgba(16,16,30,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Activity
        </h3>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#fbbf24",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
            >
              {data?.streak ?? 0}
            </div>
            <div style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              day streak 🔥
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#7c6aff",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
            >
              {data?.totalReviews ?? 0}
            </div>
            <div style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              total reviews
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "fit-content" }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 20, marginBottom: 4 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.weekIdx === wi);
              return (
                <div
                  key={wi}
                  style={{
                    width: CELL + GAP,
                    fontSize: "9px",
                    color: "#334155",
                    fontFamily: "'DM Mono', monospace",
                    whiteSpace: "nowrap",
                    overflow: "visible",
                  }}
                >
                  {ml?.label ?? ""}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 0 }}>
            {/* Day-of-week labels */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: GAP,
                marginRight: 4,
                paddingTop: 1,
              }}
            >
              {DOW_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: CELL,
                    fontSize: "9px",
                    color: i % 2 === 0 ? "#334155" : "transparent",
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: `${CELL}px`,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: GAP }}
              >
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.date}: ${day.count} review${day.count !== 1 ? "s" : ""}` : ""}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      background: day ? getColor(day.count) : "transparent",
                      cursor: day ? "default" : "default",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              justifyContent: "flex-end",
            }}
          >
            <span style={{ fontSize: "10px", color: "#334155" }}>Less</span>
            {[0, 1, 3, 5, 8].map((c) => (
              <div
                key={c}
                style={{ width: CELL, height: CELL, borderRadius: 3, background: getColor(c) }}
              />
            ))}
            <span style={{ fontSize: "10px", color: "#334155" }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
