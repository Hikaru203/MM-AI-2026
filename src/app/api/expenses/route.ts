import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.auth.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, category, walletId, imageUrl, note, mood, location, aiSummary, createdAt } = body;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        walletId,
        imageUrl,
        note,
        mood,
        location,
        aiSummary,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        userId: req.auth.user.id,
      },
    });

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          decrement: parseFloat(amount),
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
