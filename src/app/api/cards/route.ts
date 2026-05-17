import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { COOKIE_NAME } from "@/lib/userId";

function getUserId(): string {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value ?? "";
}

export async function GET(req: NextRequest) {
  let userId = getUserId();
  let isNew = false;

  if (!userId) {
    userId = uuidv4();
    isNew = true;
  }

  const cards = await prisma.card.findMany({
    where: { userId },
    include: {
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 50,
      },
    },
    orderBy: { nextReview: "asc" },
  });

  const res = NextResponse.json(cards);

  if (isNew) {
    res.cookies.set(COOKIE_NAME, userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return res;
}

export async function POST(req: NextRequest) {
  let userId = getUserId();
  let isNew = false;

  if (!userId) {
    userId = uuidv4();
    isNew = true;
  }

  const body = await req.json();
  const { title, description, category, deckId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const card = await prisma.card.create({
    data: {
      userId,
      title: title.trim(),
      description: description?.trim() ?? "",
      category: category ?? "other",
      deckId: deckId ?? null,
    },
    include: { reviews: true },
  });

  const res = NextResponse.json(card, { status: 201 });

  if (isNew) {
    res.cookies.set(COOKIE_NAME, userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return res;
}
