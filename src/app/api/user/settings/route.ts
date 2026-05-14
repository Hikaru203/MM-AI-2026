import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.user.id },
      select: { monthlyGoal: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});

export const PATCH = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { monthlyGoal } = body;

    const user = await prisma.user.update({
      where: { id: req.auth.user.id },
      data: {
        monthlyGoal: monthlyGoal !== undefined ? parseFloat(monthlyGoal) : undefined,
      },
      select: { monthlyGoal: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
