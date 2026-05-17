"use client";
import { useState } from "react";
import { CardWithRetention, CATEGORIES } from "@/lib/srs";
import { X, Link, Check, Globe } from "lucide-react";

interface ShareDeckModalProps {
  cards: CardWithRetention[];
  onClose: () => void;
}

export function ShareDeckModal({ cards, onClose }: ShareDeckModalProps) {
  const [name, setName] = useState("My Study Deck");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(cards.map((c) => c.id)));
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleCard = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedIds.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          cardIds: Array.from(selectedIds),
          isPublic: true,
        }),
      });
      const deck = await res.json();
      const url = `${window.location.origin}/deck/${deck.shareId}`;
      setShareUrl(url);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,5,8,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "20px",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#10101e",
          border: "1px solid rgba(124,106,255,0.2)",
          borderRadius: "20px",
          padding: "28px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 0 60px rgba(124,106,255,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Globe size={18} color="#7c6aff" />
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 500, color: "#e2e8f0" }}>
              Share a deck
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        {!shareUrl ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  Deck name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                  Description (optional)
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this deck about?"
                  style={inputStyle}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", color: "#64748b" }}>
                    Cards to include ({selectedIds.size}/{cards.length})
                  </label>
                  <button
                    onClick={() =>
                      selectedIds.size === cards.length
                        ? setSelectedIds(new Set())
                        : setSelectedIds(new Set(cards.map((c) => c.id)))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#7c6aff",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {selectedIds.size === cards.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {cards.map((card) => {
                    const cat = CATEGORIES.find((c) => c.id === card.category);
                    const sel = selectedIds.has(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: sel ? "rgba(124,106,255,0.08)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${sel ? "rgba(124,106,255,0.25)" : "rgba(255,255,255,0.04)"}`,
                          transition: "background 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            border: `1.5px solid ${sel ? "#7c6aff" : "rgba(255,255,255,0.15)"}`,
                            background: sel ? "#7c6aff" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {sel && <Check size={10} color="white" />}
                        </div>
                        <span style={{ fontSize: "11px" }}>{cat?.icon}</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim() || selectedIds.size === 0}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background:
                  !loading && name.trim() && selectedIds.size > 0
                    ? "linear-gradient(135deg, #7c6aff, #4f43d4)"
                    : "rgba(255,255,255,0.05)",
                color: !loading && name.trim() && selectedIds.size > 0 ? "#fff" : "#475569",
                fontSize: "14px",
                fontWeight: 500,
                cursor: loading || !name.trim() || selectedIds.size === 0 ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? "Creating..." : "Generate share link →"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
            <h3 style={{ margin: "0 0 6px", color: "#e2e8f0", fontSize: "17px" }}>
              Deck is live!
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "13px" }}>
              Anyone with this link can view your deck
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "16px",
                alignItems: "center",
              }}
            >
              <Link size={14} color="#475569" />
              <span
                style={{
                  flex: 1,
                  fontSize: "12px",
                  color: "#7c6aff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "rgba(52,211,153,0.15)" : "rgba(124,106,255,0.15)",
                  border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(124,106,255,0.3)"}`,
                  borderRadius: "6px",
                  padding: "4px 10px",
                  color: copied ? "#34d399" : "#a898ff",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 0 }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "10px 14px",
  color: "#e2e8f0",
  fontSize: "14px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
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
  marginTop: "8px",
};
