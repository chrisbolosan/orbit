import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/userId";
import { sm2, Difficulty } from "@/lib/srs";

//force dynamic route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card || card.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { difficulty, retentionAtReview }: { difficulty: Difficulty; retentionAtReview: number } =
    await req.json();

  const { intervalDays, easeFactor, repetitions, nextReviewDate } = sm2(
    card.intervalDays,
    card.easeFactor,
    card.repetitions,
    difficulty
  );

  const now = new Date();

  const [updated] = await prisma.$transaction([
    prisma.card.update({
      where: { id: params.id },
      data: {
        intervalDays,
        easeFactor,
        repetitions,
        nextReview: nextReviewDate,
        lastReviewed: now,
      },
      include: { reviews: { orderBy: { reviewedAt: "desc" }, take: 50 } },
    }),
    prisma.review.create({
      data: {
        cardId: params.id,
        difficulty,
        retentionAtReview: Math.round(retentionAtReview),
        intervalAfter: intervalDays,
        reviewedAt: now,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
