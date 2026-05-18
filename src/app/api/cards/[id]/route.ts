import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/userId";

export const dynamic = 'force-dynamic';
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
