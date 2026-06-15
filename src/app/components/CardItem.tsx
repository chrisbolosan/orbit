"use client";
import { CardWithRetention, CATEGORIES, getStatus, getDaysUntil, Difficulty } from "@/lib/srs";
import { RetentionRing } from "./RetentionRing";
import { ForgettingCurveMini } from "./ForgettingCurve";
import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, TrendingUp, Pencil, Check, X } from "lucide-react";

interface CardItemProps {
  card: CardWithRetention;
  onReview: (id: string, difficulty: Difficulty, retention: number) => void;
  onUpdate: (id: string, fields: { title?: string; description?: string; category?: string }) => void;
  onDelete: (id: string) => void;
  onOpenCurve: (card: CardWithRetention) => void;
}

const STATUS_CONFIG = {
  due:      { dot: "#f87171", bg: "rgba(248,113,113,0.1)", text: "#fca5a5" },
  upcoming: { dot: "#fbbf24", bg: "rgba(251,191,36,0.1)",  text: "#fcd34d" },
  learned:  { dot: "#34d399", bg: "rgba(52,211,153,0.1)",  text: "#6ee7b7" },
  new:      { dot: "#7c6aff", bg: "rgba(124,106,255,0.1)", text: "#a898ff" },
};

const DIFFICULTY_BUTTONS: { key: Difficulty; label: string; emoji: string; color: string }[] = [
  { key: "blackhole", label: "Blackhole", emoji: "🕳️", color: "#f87171" },
  { key: "hard",      label: "Hard",      emoji: "😤", color: "#fb923c" },
  { key: "ok",        label: "OK",        emoji: "😐", color: "#fbbf24" },
  { key: "easy",      label: "Easy",      emoji: "😊", color: "#34d399" },
  { key: "mastered",  label: "Mastered",  emoji: "🚀", color: "#7c6aff" },
];

export function CardItem({ card, onReview, onUpdate, onDelete, onOpenCurve }: CardItemProps) {
  const [reviewing, setReviewing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [noteDraft, setNoteDraft] = useState(card.description);
  const [categoryDraft, setCategoryDraft] = useState(card.category);

  const startEdit = () => {
    setTitleDraft(card.title);
    setNoteDraft(card.description);
    setCategoryDraft(card.category);
    setEditing(true);
    setExpanded(true);
  };

  const saveEdit = () => {
    const fields: { title?: string; description?: string; category?: string } = {};
    const title = titleDraft.trim();
    const description = noteDraft.trim();
    if (title && title !== card.title) fields.title = title;
    if (description !== card.description) fields.description = description;
    if (categoryDraft !== card.category) fields.category = categoryDraft;
    if (Object.keys(fields).length > 0) onUpdate(card.id, fields);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const status = getStatus(card);
  const cfg = STATUS_CONFIG[status];
  const category = CATEGORIES.find((c) => c.id === card.category);
  const daysUntil = getDaysUntil(card);

  const handleReview = (d: Difficulty) => {
    onReview(card.id, d, card.retention);
    setReviewing(false);
    setExpanded(false);
  };

  return (
    <div
      className="card-hover"
      style={{
        background: "rgba(16,16,30,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "16px",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {status === "due" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, #f87171, #fb923c)",
        }} />
      )}

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <RetentionRing retention={card.retention} size={52} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px" }}>{category?.icon}</span>
            <h3 style={{
              fontSize: "14px", fontWeight: 500, color: "#e2e8f0", margin: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {card.title}
            </h3>
          </div>

          {card.description && (
            <p style={{
              fontSize: "12px", color: "#64748b", margin: "0 0 8px",
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: expanded ? "normal" : "nowrap",
            }}>
              {card.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "11px", fontWeight: 500, color: cfg.text,
              background: cfg.bg, padding: "2px 8px", borderRadius: "6px",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
              {status === "due" ? "Review now!" : status === "new" ? "New card" : `In ${daysUntil}d`}
            </span>
            <span style={{ fontSize: "11px", color: "#475569", fontFamily: "'DM Mono', monospace" }}>
              ×{card.repetitions}
            </span>
            <span style={{ fontSize: "11px", color: "#475569" }}>
              {card.intervalDays}d interval
            </span>
          </div>
        </div>

        {/* Right: curve + actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          <button
            onClick={() => onOpenCurve(card)}
            title="View full curve"
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0, display: "block",
            }}
          >
            <ForgettingCurveMini card={card} width={80} height={32} />
          </button>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => onOpenCurve(card)}
              title="Full curve view"
              style={{
                background: "rgba(124,106,255,0.06)", border: "1px solid rgba(124,106,255,0.12)",
                borderRadius: "8px", width: "28px", height: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#7c6aff",
              }}
            >
              <TrendingUp size={12} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", width: "28px", height: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#64748b",
              }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button
              onClick={() => onDelete(card.id)}
              style={{
                background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)",
                borderRadius: "8px", width: "28px", height: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#f87171",
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded review panel */}
      {expanded && (
        <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
          {/* Card editor */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Details</span>
              {!editing && (
                <button
                  onClick={startEdit}
                  title="Edit card"
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#7c6aff", fontSize: "11px", padding: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Pencil size={11} /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Topic</label>
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    placeholder="Topic"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(124,106,255,0.25)", borderRadius: "10px",
                      padding: "8px 12px", color: "#e2e8f0", fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Notes</label>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="What do you want to remember about this?"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(124,106,255,0.25)", borderRadius: "10px",
                      padding: "10px 12px", color: "#e2e8f0", fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "6px" }}>Category</label>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryDraft(cat.id)}
                        style={{
                          padding: "5px 10px", borderRadius: "8px",
                          border: `1px solid ${categoryDraft === cat.id ? cat.color + "60" : "rgba(255,255,255,0.08)"}`,
                          background: categoryDraft === cat.id ? cat.color + "20" : "rgba(255,255,255,0.03)",
                          color: categoryDraft === cat.id ? cat.color : "#64748b",
                          fontSize: "11px", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "flex", alignItems: "center", gap: "4px",
                        }}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", marginTop: "2px", justifyContent: "flex-end" }}>
                  <button
                    onClick={cancelEdit}
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      padding: "6px 12px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                      color: "#94a3b8", fontSize: "12px", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={!titleDraft.trim()}
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      padding: "6px 12px", borderRadius: "8px", border: "none",
                      background: titleDraft.trim() ? "linear-gradient(135deg, #7c6aff, #4f43d4)" : "rgba(255,255,255,0.05)",
                      color: titleDraft.trim() ? "#fff" : "#475569",
                      fontSize: "12px", fontWeight: 500,
                      cursor: titleDraft.trim() ? "pointer" : "not-allowed",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <Check size={12} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p style={{
                fontSize: "13px", color: card.description ? "#94a3b8" : "#475569",
                margin: 0, whiteSpace: "pre-wrap", fontStyle: card.description ? "normal" : "italic",
              }}>
                {card.description || "No notes yet."}
              </p>
            )}
          </div>

          {!reviewing ? (
            <button
              onClick={() => setReviewing(true)}
              style={{
                width: "100%", padding: "10px", borderRadius: "10px",
                border: "1px solid rgba(124,106,255,0.3)", background: "rgba(124,106,255,0.1)",
                color: "#a898ff", fontSize: "13px", fontWeight: 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Mark as reviewed →
            </button>
          ) : (
            <div>
              <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", textAlign: "center" }}>
                How well did you recall this?
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                {DIFFICULTY_BUTTONS.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => handleReview(btn.key)}
                    title={btn.label}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: "10px",
                      border: `1px solid ${btn.color}30`, background: `${btn.color}10`,
                      color: btn.color, fontSize: "11px", fontWeight: 500,
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: "2px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{btn.emoji}</span>
                    <span style={{ fontSize: "10px" }}>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
