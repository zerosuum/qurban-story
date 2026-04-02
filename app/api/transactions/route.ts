import { handleListTransactions } from "@/lib/transactions/transaction.controller";

export async function GET(request: Request) {
    return handleListTransactions(request);
}
