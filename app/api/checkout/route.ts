import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, donorName, donorPhone, participants } = body;

    if (!productId || !donorName || !donorPhone) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
        status: "PAYMENT_PENDING",
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          message:
            "Anda masih memiliki transaksi yang menunggu pembayaran untuk produk ini. Silakan cek Riwayat Transaksi.",
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { promos: { where: { isActive: true } } },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const activePromo = product.promos[0];
    let finalPrice = Number(product.price);
    if (activePromo) {
      if (activePromo.discountType === "NOMINAL") {
        finalPrice -= Number(activePromo.discountValue);
      } else if (activePromo.discountType === "PERCENTAGE") {
        finalPrice -= (finalPrice * Number(activePromo.discountValue)) / 100;
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          productId: product.id,
          donorName,
          donorPhone,
          totalPrice: finalPrice,
          status: "PAYMENT_PENDING",
        },
      });

      if (
        participants &&
        Array.isArray(participants) &&
        participants.length > 0
      ) {
        await tx.orderParticipant.createMany({
          data: participants.map((name: string) => ({
            orderId: newOrder.id,
            participantName: name,
          })),
        });
      }

      return newOrder;
    });

    const midtransOrderId = order.id;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: finalPrice,
      },
      customer_details: {
        first_name: donorName,
        email: session.user.email,
        phone: donorPhone,
      },
      item_details: [
        {
          id: product.id,
          price: finalPrice,
          quantity: 1,
          name: product.name.substring(0, 50),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: snapResponse.token,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
