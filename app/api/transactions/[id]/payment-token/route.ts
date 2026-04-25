import { handleRegenerateTransactionPaymentToken } from "@/lib/transactions/transaction.controller";

type Params = {
    params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
    const { id } = await params;
    return handleRegenerateTransactionPaymentToken(id);
}
