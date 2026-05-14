import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const PATCH = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { amount, category, walletId, imageUrl, note, mood, location, aiSummary } = body;

    const expense = await prisma.expense.update({
      where: { 
        id,
        userId: req.auth.user.id 
      },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        walletId,
        imageUrl,
        note,
        mood,
        location,
        aiSummary,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
