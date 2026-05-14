import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Soft delete all expenses
    await prisma.expense.updateMany({
      where: { userId },
      data: { status: 'HIDDEN' }
    });

    // Soft delete all wallets (except maybe the default one, or hide all)
    await prisma.wallet.updateMany({
      where: { userId },
      data: { status: 'HIDDEN' }
    });

    return NextResponse.json({ message: "Dữ liệu đã được ẩn thành công" });
  } catch (error) {
    console.error("Clear data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
