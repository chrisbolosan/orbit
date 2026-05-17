"use client";
import { useState } from "react";
import { CardWithRetention, Difficulty, getStatus } from "@/lib/srs";
import { RetentionRing } from "./RetentionRing";
import { X, ChevronRight, RotateCcw } from "lucide-react";

interface ReviewSessionProps {
  cards: CardWithRetention[];
  onReview: (id: string, difficulty: Difficulty, retention: number) => void;
  onClose: () => void;
}

const DIFFICULTY_BUTTONS: {
  key: Difficulty;
  label: string;
  emoji: string;
  color: string;
  description: string;
}[] = [
  { key: "blackhole", label: "Blackhole", emoji: "🕳️", color: "#f87171", description: "Complete blank" },
  { key: "hard", label: "Hard", emoji: "😤", color: "#fb923c", description: "Barely recalled" },
  { key: "ok", label: "OK", emoji: "😐", color: "#fbbf24", description: "Got it with effort" },
  { key: "easy", label: "Easy", emoji: "😊", color: "#34d399", description: "Recalled well" },
  { key: "mastered", label: "Mastered", emoji: "🚀", color: "#7c6aff", description: "Instant recall" },
];

export function ReviewSession({ cards, onReview, onClose }: ReviewSessionProps) {
  const dueCards = cards.filter((c) => {
    const s = getStatus(c);
    return s === "due" || s === "new";
  });

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    { title: string; difficulty: Difficulty; color: string }[]
  >([]);

  const current = dueCards[index];
  const progress = dueCards.length > 0 ? (index / dueCards.length) * 100 : 100;

  const handleDifficulty = (difficulty: Difficulty) => {
    if (!current) return;
    onReview(current.id, difficulty, current.retention);
    const btn = DIFFICULTY_BUTTONS.find((b) => b.key === difficulty)!;
    setSessionResults((prev) => [
      ...prev,
      { title: current.title, difficulty, color: btn.color },
    ]);

    if (index + 1 >= dueCards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  if (dueCards.length === 0) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <button onClick={onClose} style={closeBtn}>
            <X size={18} />
          </button>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🌟</div>
            <h2 style={{ margin: "0 0 8px", fontSize: "22px", color: "#e2e8f0" }}>
              All caught up!
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
              No cards due right now. Come back later to keep your streak going.
            </p>
            <button onClick={onClose} style={primaryBtn}>
              Back to orbit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const counts = DIFFICULTY_BUTTONS.map((b) => ({
      ...b,
      count: sessionResults.filter((r) => r.difficulty === b.key).length,
    })).filter((b) => b.count > 0);

    return (
      <div style={overlayStyle}>
        <div style={{ ...panelStyle, maxWidth: "520px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎉</div>
            <h2 style={{ margin: "0 0 6px", fontSize: "22px", color: "#e2e8f0" }}>
              Session complete!
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              You reviewed {sessionResults.length} card
              {sessionResults.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
            {counts.map((b) => (
              <div
                key={b.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: b.color + "12",
                  border: `1px solid ${b.color}25`,
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{b.emoji}</span>
                <span style={{ flex: 1, color: "#94a3b8", fontSize: "13px" }}>{b.label}</span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: b.color,
                  }}
                >
                  {b.count}
                </span>
                <div
                  style={{
                    width: `${(b.count / sessionResults.length) * 80}px`,
                    height: "4px",
                    background: b.color,
                    borderRadius: "2px",
                    minWidth: "4px",
                  }}
                />
              </div>
            ))}
          </div>

          <button onClick={onClose} style={primaryBtn}>
            Back to orbit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #7c6aff, #34d399)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "24px",
          right: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            color: "#475569",
          }}
        >
          {index + 1} / {dueCards.length}
        </span>
        <button onClick={onClose} style={closeBtn}>
          <X size={16} />
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "80px 24px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "rgba(16,16,30,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "36px",
            boxShadow: "0 0 60px rgba(124,106,255,0.08)",
            marginBottom: "24px",
          }}
        >
          {/* Category + retention */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#475569",
                fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {current.category}
            </span>
            <RetentionRing retention={current.retention} size={44} />
          </div>

          {/* Question */}
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "22px",
              fontWeight: 500,
              color: "#e2e8f0",
              lineHeight: 1.4,
            }}
          >
            {current.title}
          </h2>

          {/* Divider / reveal */}
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid rgba(124,106,255,0.3)",
                background: "rgba(124,106,255,0.08)",
                color: "#a898ff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Reveal notes <ChevronRight size={16} />
            </button>
          ) : (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#94a3b8",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {current.description || (
                <span style={{ color: "#334155", fontStyle: "italic" }}>No notes added.</span>
              )}
            </div>
          )}
        </div>

        {/* Difficulty buttons */}
        {revealed && (
          <div style={{ width: "100%", maxWidth: "560px" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#475569",
                margin: "0 0 12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              How well did you recall this?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {DIFFICULTY_BUTTONS.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleDifficulty(btn.key)}
                  style={{
                    flex: 1,
                    padding: "12px 6px",
                    borderRadius: "12px",
                    border: `1px solid ${btn.color}30`,
                    background: `${btn.color}10`,
                    color: btn.color,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "background 0.15s, transform 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = `${btn.color}20`)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = `${btn.color}10`)
                  }
                >
                  <span style={{ fontSize: "20px" }}>{btn.emoji}</span>
                  <span style={{ fontSize: "11px", fontWeight: 500 }}>{btn.label}</span>
                  <span style={{ fontSize: "10px", color: btn.color + "90" }}>{btn.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared styles
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(5,5,8,0.97)",
  zIndex: 300,
  backdropFilter: "blur(16px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(16,16,30,0.98)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "32px",
  width: "100%",
  maxWidth: "460px",
  position: "relative",
  boxShadow: "0 0 80px rgba(124,106,255,0.1)",
};

const closeBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#64748b",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #7c6aff, #4f43d4)",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
