import { handleGetDashboardTransactionMetrics } from "@/lib/transactions/transaction.controller";

export async function GET() {
    return handleGetDashboardTransactionMetrics();
}
