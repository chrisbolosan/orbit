export type Difficulty = "blackhole" | "hard" | "ok" | "easy" | "mastered";

export interface CardWithRetention {
  id: string;
  title: string;
  description: string;
  category: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastReviewed: string | null;
  createdAt: string;
  deckId: string | null;
  reviews: ReviewRecord[];
  retention: number;
}

export interface ReviewRecord {
  id: string;
  difficulty: Difficulty;
  retentionAtReview: number;
  intervalAfter: number;
  reviewedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const DIFFICULTY_QUALITY: Record<Difficulty, number> = {
  blackhole: 0,
  hard: 1,
  ok: 3,
  easy: 4,
  mastered: 5,
};

export function sm2(
  intervalDays: number,
  easeFactor: number,
  repetitions: number,
  difficulty: Difficulty
): { intervalDays: number; easeFactor: number; repetitions: number; nextReviewDate: Date } {
  const quality = DIFFICULTY_QUALITY[difficulty];
  let ef = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let interval = intervalDays;
  let reps = repetitions;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps += 1;
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);
  return { intervalDays: interval, easeFactor: ef, repetitions: reps, nextReviewDate: next };
}

export function computeRetention(lastReviewed: string | null, intervalDays: number): number {
  if (!lastReviewed) return 100;
  const daysSince = (Date.now() - new Date(lastReviewed).getTime()) / 86_400_000;
  // 1.06 places retention at ~39% when a card comes due (exp(-1/1.06) ≈ 0.39)
  const stability = Math.max(1, intervalDays * 1.06);
  return Math.max(0, Math.min(100, Math.exp(-daysSince / stability) * 100));
}

export function getStatus(card: CardWithRetention): "due" | "upcoming" | "learned" | "new" {
  if (!card.lastReviewed) return "new";
  const d = getDaysUntil(card);
  if (d <= 0) return "due";
  if (d <= 3) return "upcoming";
  return "learned";
}

export function getDaysUntil(card: CardWithRetention): number {
  return Math.ceil((new Date(card.nextReview).getTime() - Date.now()) / 86_400_000);
}

export function generateCurve(
  card: CardWithRetention,
  days = 365
): { day: number; date: string; retention: number; isReviewDay: boolean }[] {
  const stability = Math.max(1, card.intervalDays * 1.06);
  const daysSince = card.lastReviewed
    ? (Date.now() - new Date(card.lastReviewed).getTime()) / 86_400_000
    : 0;
  const daysUntilNext = getDaysUntil(card);
  const points = [];

  for (let d = 0; d <= days; d++) {
    const t = daysSince + d;
    const date = new Date();
    date.setDate(date.getDate() + d);
    points.push({
      day: d,
      date: date.toISOString().slice(0, 10),
      retention: Math.max(0, Math.min(100, Math.exp(-t / stability) * 100)),
      isReviewDay: d === daysUntilNext,
    });
  }
  return points;
}

export const CATEGORIES: Category[] = [
  { id: "programming", name: "Programming", color: "#7c6aff", icon: "💻" },
  { id: "math",        name: "Mathematics", color: "#34d399", icon: "📐" },
  { id: "language",    name: "Language",    color: "#fbbf24", icon: "🗣️"  },
  { id: "science",     name: "Science",     color: "#60a5fa", icon: "🔬" },
  { id: "history",     name: "History",     color: "#f87171", icon: "📜" },
  { id: "other",       name: "Other",       color: "#a78bfa", icon: "✨" },
];
