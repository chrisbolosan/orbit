"use client";
import { useState, useMemo } from "react";
import { useCards } from "@/lib/useCards";
import { StarField } from "./components/StarField";
import { CardItem } from "./components/CardItem";
import { AddCardModal } from "./components/AddCardModal";
import { ReviewTimeline } from "./components/ReviewTimeline";
import { StatsBar } from "./components/StatsBar";
import { CurveModal } from "./components/CurveModal";
import { ReviewSession } from "./components/ReviewSession";
import { ActivityHeatmap } from "./components/ActivityHeatmap";
import { ShareDeckModal } from "./components/ShareDeckModal";
import { getStatus, CATEGORIES, CardWithRetention } from "@/lib/srs";
import { Plus, Search, Play, Share2 } from "lucide-react";

type SortMode = "due" | "retention" | "recent" | "name";
type FilterStatus = "all" | "due" | "upcoming" | "learned" | "new";

export default function Home() {
  const { cards, loaded, error, addCard, reviewCard, updateCard, deleteCard } = useCards();
  const [showAdd, setShowAdd] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [curveCard, setCurveCard] = useState<CardWithRetention | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("due");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = useMemo(() => {
    let result = [...cards];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") result = result.filter((c) => getStatus(c) === filterStatus);
    if (filterCategory !== "all") result = result.filter((c) => c.category === filterCategory);

    result.sort((a, b) => {
      if (sortMode === "due") {
        const order = { due: 0, upcoming: 1, new: 2, learned: 3 };
        const diff = order[getStatus(a)] - order[getStatus(b)];
        if (diff !== 0) return diff;
        return a.retention - b.retention;
      }
      if (sortMode === "retention") return a.retention - b.retention;
      if (sortMode === "name") return a.title.localeCompare(b.title);
      if (sortMode === "recent") {
        const da = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
        const db = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
        return db - da;
      }
      return 0;
    });
    return result;
  }, [cards, search, sortMode, filterStatus, filterCategory]);

  const dueCount = cards.filter((c) => {
    const s = getStatus(c);
    return s === "due" || s === "new";
  }).length;

  if (!loaded) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", color: "#7c6aff",
        fontFamily: "'DM Mono', monospace", fontSize: "14px",
      }}>
        <StarField />
        <span style={{ position: "relative" }}>initializing orbit...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <StarField />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Header */}
        <header style={{
          padding: "32px 0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "28px",
          flexWrap: "wrap", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #a898ff, #4f43d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 0 20px rgba(124,106,255,0.4)",
            }}>🪐</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
                Orbit
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                Spaced repetition memory system
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {cards.length > 0 && (
              <button
                onClick={() => setShowShare(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 14px", borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)", color: "#94a3b8",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Share2 size={14} /> Share deck
              </button>
            )}
            {dueCount > 0 && (
              <button
                onClick={() => setShowSession(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "9px 16px", borderRadius: "12px",
                  border: "1px solid rgba(52,211,153,0.3)",
                  background: "rgba(52,211,153,0.1)", color: "#34d399",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Play size={13} fill="#34d399" />
                Review now ({dueCount})
              </button>
            )}
            <button
              onClick={() => setShowAdd(true)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 18px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #7c6aff, #4f43d4)",
                color: "#fff", fontSize: "13px", fontWeight: 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(124,106,255,0.3)",
              }}
            >
              <Plus size={15} /> Add card
            </button>
          </div>
        </header>

        {error && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "13px", color: "#fca5a5",
          }}>
            ⚠️ {error} — make sure your DATABASE_URL is set and the DB is reachable.
          </div>
        )}

        {/* Due banner */}
        {dueCount > 0 && (
          <div style={{
            background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)",
            borderRadius: "14px", padding: "14px 18px", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#fca5a5" }}>
                  {dueCount} card{dueCount > 1 ? "s" : ""} need review
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  Memories are fading — review now to strengthen them
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSession(true)}
              style={{
                padding: "8px 14px", borderRadius: "10px",
                border: "1px solid rgba(248,113,113,0.3)",
                background: "rgba(248,113,113,0.1)", color: "#fca5a5",
                fontSize: "12px", fontWeight: 500, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
              }}
            >
              Start session →
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ marginBottom: "16px" }}>
          <StatsBar cards={cards} />
        </div>

        {/* Timeline + heatmap side by side on wider screens */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <ReviewTimeline cards={cards} />
          <ActivityHeatmap />
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{
            flex: "1 1 200px", display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(16,16,30,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px", padding: "0 14px", backdropFilter: "blur(12px)",
          }}>
            <Search size={14} style={{ color: "#475569", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif", padding: "10px 0",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            {(["all", "due", "upcoming", "learned", "new"] as FilterStatus[]).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "7px 11px", borderRadius: "8px",
                border: `1px solid ${filterStatus === s ? "rgba(124,106,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                background: filterStatus === s ? "rgba(124,106,255,0.12)" : "rgba(16,16,30,0.6)",
                color: filterStatus === s ? "#a898ff" : "#475569",
                fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
              }}>{s}</button>
            ))}
          </div>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{
              background: "rgba(16,16,30,0.8)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px", color: "#94a3b8", fontSize: "12px",
              padding: "7px 12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          >
            <option value="due">Sort: Priority</option>
            <option value="retention">Sort: Retention</option>
            <option value="recent">Sort: Recent</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={() => setFilterCategory("all")} style={{
            padding: "5px 12px", borderRadius: "20px",
            border: `1px solid ${filterCategory === "all" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
            background: filterCategory === "all" ? "rgba(255,255,255,0.08)" : "transparent",
            color: filterCategory === "all" ? "#e2e8f0" : "#475569",
            fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>All</button>
          {CATEGORIES.map((cat) => {
            const count = cards.filter((c) => c.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button key={cat.id} onClick={() => setFilterCategory(filterCategory === cat.id ? "all" : cat.id)} style={{
                padding: "5px 12px", borderRadius: "20px",
                border: `1px solid ${filterCategory === cat.id ? cat.color + "60" : "rgba(255,255,255,0.06)"}`,
                background: filterCategory === cat.id ? cat.color + "20" : "transparent",
                color: filterCategory === cat.id ? cat.color : "#475569",
                fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                {cat.icon} {cat.name} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: "12px", fontSize: "12px", color: "#334155" }}>
          {filtered.length} card{filtered.length !== 1 ? "s" : ""} shown
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌌</div>
            <p style={{ fontSize: "16px", fontWeight: 500, color: "#475569", marginBottom: "8px" }}>
              {search || filterStatus !== "all" || filterCategory !== "all"
                ? "No cards match your filters"
                : "Your orbit is empty"}
            </p>
            <p style={{ fontSize: "14px", color: "#334155" }}>
              {search || filterStatus !== "all" || filterCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first card to start building long-term memory"}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "12px",
          }}>
            {filtered.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onReview={reviewCard}
                onUpdate={updateCard}
                onDelete={deleteCard}
                onOpenCurve={setCurveCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals / overlays */}
      {showAdd && <AddCardModal onAdd={addCard} onClose={() => setShowAdd(false)} />}
      {showSession && (
        <ReviewSession
          cards={cards}
          onReview={reviewCard}
          onClose={() => setShowSession(false)}
        />
      )}
      {curveCard && <CurveModal card={curveCard} onClose={() => setCurveCard(null)} />}
      {showShare && <ShareDeckModal cards={cards} onClose={() => setShowShare(false)} />}
    </div>
  );
}
