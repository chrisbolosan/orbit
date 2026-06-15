import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/userId";

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card || card.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: { title?: string; description?: string; category?: string } = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.category === "string") data.category = body.category;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const updated = await prisma.card.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card || card.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete reviews first (relationMode: prisma doesn't cascade)
  await prisma.review.deleteMany({ where: { cardId: params.id } });
  await prisma.card.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
