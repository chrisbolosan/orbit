"use client";
import { useState, useEffect, useCallback } from "react";
import { CardWithRetention, computeRetention, Difficulty } from "./srs";

export function useCards() {
  const [cards, setCards] = useState<CardWithRetention[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/cards");
      if (!res.ok) throw new Error("Failed to load");
      const data: CardWithRetention[] = await res.json();
      setCards(data.map((c) => ({ ...c, retention: computeRetention(c.lastReviewed, c.intervalDays) })));
    } catch (e) {
      setError("Could not load cards");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const addCard = useCallback(async (card: { title: string; description: string; category: string; deckId?: string }) => {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    if (res.ok) await fetchCards();
  }, [fetchCards]);

  const reviewCard = useCallback(async (id: string, difficulty: Difficulty, retentionAtReview: number) => {
    const res = await fetch(`/api/cards/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, retentionAtReview }),
    });
    if (res.ok) {
      const updated: CardWithRetention = await res.json();
      setCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...updated, retention: 100, reviews: c.reviews } : c
        )
      );
    }
  }, []);

  const updateCard = useCallback(async (id: string, fields: { title?: string; description?: string; category?: string }) => {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      const updated: CardWithRetention = await res.json();
      setCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...updated, retention: c.retention, reviews: c.reviews } : c
        )
      );
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { cards, loaded, error, addCard, reviewCard, updateCard, deleteCard, refetch: fetchCards };
}
