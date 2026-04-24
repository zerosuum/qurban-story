import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const potential = error as { ApiResponse?: { status_message?: string } };
    if (potential.ApiResponse?.status_message) {
      return potential.ApiResponse.status_message;
    }
  }

  return "Terjadi kesalahan pada proses checkout.";
}

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
      include: {
        promos: { where: { isActive: true } },
        species: {
          select: {
            maxParticipants: true,
          },
        },
      },
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

    const grossAmount = Math.max(1, Math.round(finalPrice));

    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
      return NextResponse.json(
        { message: "Konfigurasi Midtrans belum lengkap di server." },
        { status: 500 },
      );
    }

    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const maxParticipants = product.species.maxParticipants;
        const isSharedQurban = maxParticipants > 1;

        let targetGroupId: string | null = null;

        if (isSharedQurban) {
          let openGroup = await tx.animalGroup.findFirst({
            where: {
              productId: product.id,
              status: "OPEN",
              currentSlot: {
                lt: maxParticipants,
              },
            },
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              currentSlot: true,
              maxSlot: true,
            },
          });

          if (!openGroup) {
            openGroup = await tx.animalGroup.create({
              data: {
                productId: product.id,
                maxSlot: maxParticipants,
                status: "OPEN",
              },
              select: {
                id: true,
                currentSlot: true,
                maxSlot: true,
              },
            });
          }

          targetGroupId = openGroup.id;
        }

        const newOrder = await tx.order.create({
          data: {
            userId: session.user.id,
            productId: product.id,
            animalGroupId: targetGroupId,
            donorName,
            donorPhone,
            totalPrice: grossAmount,
            status: "PAYMENT_PENDING",
          },
        });

        if (targetGroupId) {
          const groupState = await tx.animalGroup.findUnique({
            where: { id: targetGroupId },
            select: {
              currentSlot: true,
              maxSlot: true,
            },
          });

          const nextSlot = (groupState?.currentSlot ?? 0) + 1;
          const nextStatus =
            nextSlot >= (groupState?.maxSlot ?? maxParticipants)
              ? "FULL"
              : "OPEN";

          await tx.animalGroup.update({
            where: { id: targetGroupId },
            data: {
              currentSlot: nextSlot,
              status: nextStatus,
            },
          });
        }

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
      },
    );

    const midtransOrderId = order.id;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: donorName,
        email: session.user.email ?? undefined,
        phone: donorPhone,
      },
      item_details: [
        {
          id: product.id,
          price: grossAmount,
          quantity: 1,
          name: product.name.substring(0, 50),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(parameter);

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          snapToken: snapResponse.token,
        },
      });
    } catch (error) {
      const isMissingSnapTokenColumn =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2022";
      const isSnapTokenValidationError =
        error instanceof Prisma.PrismaClientValidationError &&
        error.message.toLowerCase().includes("snaptoken");

      if (!isMissingSnapTokenColumn && !isSnapTokenValidationError) {
        throw error;
      }
    }

    return NextResponse.json({
      token: snapResponse.token,
      orderId: order.id,
    });
  } catch (error) {
    const message = getReadableErrorMessage(error);
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}
