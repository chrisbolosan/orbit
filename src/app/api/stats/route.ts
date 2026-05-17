import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/userId";

export async function GET() {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json({ streak: 0, heatmap: [], totalReviews: 0 });

  // Get all reviews for this user's cards over the past year
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const userCards = await prisma.card.findMany({
    where: { userId },
    select: { id: true },
  });

  const cardIds = userCards.map((c: { id: string }) => c.id);

  const reviews = await prisma.review.findMany({
    where: {
      cardId: { in: cardIds },
      reviewedAt: { gte: yearAgo },
    },
    select: { reviewedAt: true },
    orderBy: { reviewedAt: "desc" },
  });

  // Build heatmap: { date: "YYYY-MM-DD", count: N }
  const heatmap: Record<string, number> = {};
  for (const r of reviews) {
    const d = r.reviewedAt.toISOString().slice(0, 10);
    heatmap[d] = (heatmap[d] ?? 0) + 1;
  }

  // Streak: consecutive days with at least 1 review (from today going back)
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((heatmap[key] ?? 0) > 0) {
      streak++;
    } else if (i > 0) {
      break; // only break after day 0 (today might not have reviews yet)
    }
  }

  return NextResponse.json({
    streak,
    heatmap: Object.entries(heatmap).map(([date, count]) => ({ date, count })),
    totalReviews: reviews.length,
  });
}
