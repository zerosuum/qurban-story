import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const statusMap: Record<
  string,
  "PAID" | "PAYMENT_PENDING" | "FAILED" | "EXPIRED"
> = {
  settlement: "PAID",
  capture: "PAID",
  pending: "PAYMENT_PENDING",
  deny: "FAILED",
  cancel: "FAILED",
  expire: "EXPIRED",
  failure: "FAILED",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      payment_type,
    } = body;

    console.log("[MIDTRANS_WEBHOOK_RECEIVED]", {
      order_id,
      transaction_status,
      gross_amount,
    });

    // 1. Verifikasi Signature Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      console.error("[MIDTRANS_WEBHOOK] Invalid Signature!", { order_id });
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 },
      );
    }

    // 2. Extract Order ID
    // Retry payment may use suffix, e.g. <uuid>-retry-<timestamp>.
    const realOrderId =
      typeof order_id === "string"
        ? (order_id.match(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
        )?.[0] ?? order_id)
        : "";

    if (!realOrderId) {
      return NextResponse.json({ message: "Order ID kosong" }, { status: 400 });
    }

    // 3. Validasi Amount dan Ambil Status Lama
    const order = await prisma.order.findUnique({
      where: { id: realOrderId },
    });

    if (!order) {
      console.error("[MIDTRANS_WEBHOOK] Order not found in DB", {
        realOrderId,
      });
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (
      Math.round(Number(order.totalPrice)) !== Math.round(Number(gross_amount))
    ) {
      console.error("[MIDTRANS_WEBHOOK] Amount mismatch!", {
        dbAmount: order.totalPrice,
        midtransAmount: gross_amount,
      });
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const dbStatus = statusMap[transaction_status] || "PAYMENT_PENDING";

    // 4. Update Database secara Atomic
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Upsert tabel Payment
      await tx.payment.upsert({
        where: { orderId: realOrderId },
        create: {
          orderId: realOrderId,
          midtransTransactionId: transaction_id,
          paymentType: payment_type,
          grossAmount: Number(gross_amount),
          transactionStatus: transaction_status,
          rawResponse: body,
        },
        update: {
          midtransTransactionId: transaction_id,
          paymentType: payment_type,
          transactionStatus: transaction_status,
          rawResponse: body,
        },
      });

      await tx.order.update({
        where: { id: realOrderId },
        data: {
          status: dbStatus,
          paidAt: dbStatus === "PAID" ? new Date() : undefined,
        },
      });

      if (order.status !== "PAID" && dbStatus === "PAID") {
        await tx.product.update({
          where: { id: order.productId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }
    });

    console.log("[MIDTRANS_WEBHOOK_SUCCESS] Order updated & Stock Deducted:", {
      realOrderId,
      dbStatus,
    });

    if (dbStatus === "PAID") {
      revalidatePath("/produk");
      revalidatePath(`/produk/${order.productId}`);
    }
    
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[MIDTRANS_WEBHOOK_ERROR]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
