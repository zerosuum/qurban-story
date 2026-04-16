import {
    handleGetTransactionById,
    handleUpdateTransactionDocumentations,
} from "@/lib/transactions/transaction.controller";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
    const { id } = await params;
    return handleGetTransactionById(id);
}

export async function PATCH(request: Request, { params }: Params) {
    const { id } = await params;
    return handleUpdateTransactionDocumentations(id, request);
}
