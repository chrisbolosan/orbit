import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/srs";

interface SharedCard {
  id: string;
  title: string;
  description: string;
  category: string;
  repetitions: number;
  intervalDays: number;
  createdAt: string;
}

interface SharedDeck {
  id: string;
  name: string;
  description: string | null;
  shareId: string;
  cards: SharedCard[];
  createdAt: string;
}

async function getDeck(shareId: string): Promise<SharedDeck | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/decks/${shareId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharedDeckPage({ params }: { params: { shareId: string } }) {
  const deck = await getDeck(params.shareId);
  if (!deck) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "28px" }}>🪐</span>
            <span style={{ fontSize: "13px", color: "#475569" }}>Shared via Orbit</span>
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 600, color: "#e2e8f0" }}>
            {deck.name}
          </h1>
          {deck.description && (
            <p style={{ margin: "0 0 12px", fontSize: "15px", color: "#64748b" }}>{deck.description}</p>
          )}
          <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#475569" }}>
            <span>{deck.cards.length} cards</span>
            <span>
              Shared {new Date(deck.createdAt).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {deck.cards.map((card) => {
            const cat = CATEGORIES.find((c) => c.id === card.category);
            return (
              <div
                key={card.id}
                style={{
                  background: "rgba(16,16,30,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    flexShrink: 0,
                    lineHeight: 1,
                    marginTop: "2px",
                  }}
                >
                  {cat?.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 500, color: "#e2e8f0" }}>
                    {card.title}
                  </h3>
                  {card.description && (
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                      {card.description}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "11px",
                    color: cat?.color ?? "#7c6aff",
                    background: (cat?.color ?? "#7c6aff") + "18",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat?.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
            padding: "32px",
            background: "rgba(124,106,255,0.06)",
            border: "1px solid rgba(124,106,255,0.15)",
            borderRadius: "16px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🚀</div>
          <h3 style={{ margin: "0 0 8px", fontSize: "17px", color: "#e2e8f0" }}>
            Want to track your own memory?
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b" }}>
            Orbit uses spaced repetition to help you remember anything, forever.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "11px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c6aff, #4f43d4)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Start for free →
          </a>
        </div>
      </div>
    </div>
  );
}
