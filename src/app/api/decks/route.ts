import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/userId";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json([]);

  const decks = await prisma.deck.findMany({
    where: { userId },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, cardIds, isPublic } = await req.json();

  const deck = await prisma.deck.create({
    data: {
      userId,
      name: name?.trim() || "My Deck",
      description: description?.trim() ?? "",
      isPublic: isPublic ?? true,
      shareId: uuidv4().slice(0, 8), // short share slug
    },
  });

  // Assign selected cards to this deck
  if (cardIds?.length) {
    await prisma.card.updateMany({
      where: { id: { in: cardIds }, userId },
      data: { deckId: deck.id },
    });
  }

  return NextResponse.json(deck, { status: 201 });
}
