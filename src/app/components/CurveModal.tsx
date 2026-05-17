"use client";
import { CardWithRetention, generateCurve, CATEGORIES } from "@/lib/srs";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts";

interface CurveModalProps {
  card: CardWithRetention;
  onClose: () => void;
}

type Range = 30 | 90 | 180 | 365;

const RANGE_LABELS: { value: Range; label: string }[] = [
  { value: 30, label: "30d" },
  { value: 90, label: "3mo" },
  { value: 180, label: "6mo" },
  { value: 365, label: "1yr" },
];

const DIFF_COLORS: Record<string, string> = {
  blackhole: "#f87171",
  hard: "#fb923c",
  ok: "#fbbf24",
  easy: "#34d399",
  mastered: "#7c6aff",
};

const DIFF_EMOJI: Record<string, string> = {
  blackhole: "🕳️", hard: "😤", ok: "😐", easy: "😊", mastered: "🚀",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: "#10101e",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "12px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ color: "#94a3b8", marginBottom: "4px" }}>{d.date}</div>
      <div style={{ color: "#e2e8f0", fontWeight: 500 }}>
        Retention: <span style={{ color: "#7c6aff" }}>{Math.round(d.retention)}%</span>
      </div>
      {d.isReviewDay && (
        <div style={{ color: "#34d399", marginTop: "4px" }}>📅 Next review</div>
      )}
    </div>
  );
}

export function CurveModal({ card, onClose }: CurveModalProps) {
  const [range, setRange] = useState<Range>(90);
  const category = CATEGORIES.find((c) => c.id === card.category);

  const curveData = useMemo(() => generateCurve(card, range), [card, range]);

  const retColor =
    card.retention >= 80 ? "#7c6aff"
    : card.retention >= 60 ? "#34d399"
    : card.retention >= 35 ? "#fbbf24"
    : "#f87171";

  // Build historical scatter points from review records
  const historyPoints = useMemo(() => {
    if (!card.reviews?.length) return [];
    return card.reviews.map((r) => ({
      date: new Date(r.reviewedAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
      retention: Math.round(r.retentionAtReview),
      difficulty: r.difficulty,
      color: DIFF_COLORS[r.difficulty] ?? "#64748b",
      interval: r.intervalAfter,
    }));
  }, [card.reviews]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,5,8,0.92)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(16px)",
        overflow: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ maxWidth: "960px", width: "100%", margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>{category?.icon}</span>
              <span style={{
                fontSize: "12px", fontWeight: 500, color: category?.color ?? "#7c6aff",
                background: (category?.color ?? "#7c6aff") + "20",
                padding: "3px 10px", borderRadius: "6px",
              }}>
                {category?.name}
              </span>
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 600, color: "#e2e8f0" }}>
              {card.title}
            </h2>
            {card.description && (
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>{card.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#64748b", flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          {[
            { label: "Current retention", value: `${Math.round(card.retention)}%`, color: retColor },
            { label: "Current interval", value: `${card.intervalDays} days`, color: "#60a5fa" },
            { label: "Times reviewed", value: `${card.repetitions}×`, color: "#34d399" },
            { label: "Ease factor", value: card.easeFactor.toFixed(2), color: "#fbbf24" },
            { label: "Next review", value: `In ${Math.max(0, Math.ceil((new Date(card.nextReview).getTime() - Date.now()) / 86_400_000))}d`, color: "#a898ff" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: "1 1 120px",
              background: "rgba(16,16,30,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}>
              <div style={{ fontSize: "20px", fontWeight: 600, color: s.color, fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Range selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Forgetting curve
          </h3>
          <div style={{ display: "flex", gap: "4px" }}>
            {RANGE_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                style={{
                  padding: "5px 12px", borderRadius: "8px",
                  border: `1px solid ${range === value ? "rgba(124,106,255,0.5)" : "rgba(255,255,255,0.06)"}`,
                  background: range === value ? "rgba(124,106,255,0.15)" : "rgba(16,16,30,0.6)",
                  color: range === value ? "#a898ff" : "#475569",
                  fontSize: "12px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main curve chart */}
        <div style={{
          background: "rgba(10,10,18,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          padding: "24px 16px 16px",
          marginBottom: "24px",
        }}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={retColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={retColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#334155", fontSize: 11, fontFamily: "'DM Mono'" }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(curveData.length / 6)}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#334155", fontSize: 11, fontFamily: "'DM Mono'" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* 80% threshold line */}
              <ReferenceLine y={80} stroke="rgba(124,106,255,0.2)" strokeDasharray="4 4"
                label={{ value: "80%", fill: "#7c6aff", fontSize: 10, position: "insideTopRight" }} />
              {/* 50% threshold line */}
              <ReferenceLine y={50} stroke="rgba(251,191,36,0.2)" strokeDasharray="4 4"
                label={{ value: "50%", fill: "#fbbf24", fontSize: 10, position: "insideTopRight" }} />
              {/* Next review marker */}
              {curveData.find((p) => p.isReviewDay) && (
                <ReferenceLine
                  x={curveData.find((p) => p.isReviewDay)?.date}
                  stroke="#34d399"
                  strokeDasharray="4 4"
                  label={{ value: "Review →", fill: "#34d399", fontSize: 10, position: "insideTopLeft" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="retention"
                stroke={retColor}
                strokeWidth={2}
                fill="url(#retGrad)"
                dot={false}
                activeDot={{ r: 4, fill: retColor, stroke: "#050508", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", gap: "16px", marginTop: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { color: retColor, label: "Retention curve" },
              { color: "#7c6aff", label: "80% threshold", dashed: true },
              { color: "#fbbf24", label: "50% threshold", dashed: true },
              { color: "#34d399", label: "Next review", dashed: true },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#475569" }}>
                <div style={{ width: 24, height: 2,
                  background: l.dashed ? "none" : l.color,
                  opacity: l.dashed ? 0.5 : 1,
                  borderTop: l.dashed ? `2px dashed ${l.color}` : "none" }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Review history */}
        {historyPoints.length > 0 && (
          <>
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Review history ({historyPoints.length} sessions)
            </h3>
            <div style={{
              background: "rgba(10,10,18,0.9)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Date", "Rating", "Retention at review", "Interval set"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: "left",
                        color: "#475569", fontWeight: 500, fontSize: "11px",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyPoints.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "10px 16px", color: "#94a3b8", fontFamily: "'DM Mono'" }}>{r.date}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          color: r.color, fontSize: "12px", fontWeight: 500,
                          background: r.color + "15", padding: "2px 8px", borderRadius: "6px",
                        }}>
                          {DIFF_EMOJI[r.difficulty]} {r.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontFamily: "'DM Mono'", color: "#e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: `${r.retention}%`, maxWidth: "80px", height: "4px",
                            background: r.color, borderRadius: "2px", transition: "width 0.3s",
                          }} />
                          {r.retention}%
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#64748b", fontFamily: "'DM Mono'" }}>
                        {r.interval}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {historyPoints.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "#334155" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
            <p style={{ margin: 0, fontSize: "13px" }}>No review history yet — start reviewing to see your progress here</p>
          </div>
        )}
      </div>
    </div>
  );
}
