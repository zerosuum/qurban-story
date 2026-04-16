import {
    handleBulkUpdateReportingStatus,
    handleListTransactions,
} from "@/lib/transactions/transaction.controller";

export async function GET(request: Request) {
    return handleListTransactions(request);
}

export async function PATCH(request: Request) {
    return handleBulkUpdateReportingStatus(request);
}
