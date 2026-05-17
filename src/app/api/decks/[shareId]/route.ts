import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { shareId: string } }) {
  const deck = await prisma.deck.findUnique({
    where: { shareId: params.shareId },
    include: {
      cards: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          repetitions: true,
          intervalDays: true,
          createdAt: true,
        },
      },
    },
  });

  if (!deck || !deck.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(deck);
}
