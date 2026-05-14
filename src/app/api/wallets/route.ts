import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let wallets = await prisma.wallet.findMany({
      where: { userId: req.auth.user.id },
    });

    // If user has no wallets, create defaults
    if (wallets.length === 0) {
      const defaultWallets = [
        { name: "Tiền mặt", balance: 0, type: "Cash", userId: req.auth.user.id },
        { name: "Momo", balance: 0, type: "Digital", userId: req.auth.user.id },
        { name: "Techcombank", balance: 0, type: "Bank", userId: req.auth.user.id },
      ];

      await prisma.wallet.createMany({
        data: defaultWallets,
      });

      wallets = await prisma.wallet.findMany({
        where: { userId: req.auth.user.id },
      });
    }

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});

export const PATCH = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, balance, type } = body;

    const wallet = await prisma.wallet.update({
      where: { 
        id,
        userId: req.auth.user.id // Security: ensure user owns the wallet
      },
      data: {
        name,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        type,
      },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
