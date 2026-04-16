import { handleGetDocumentationDistributionYearDetail } from "@/lib/transactions/transaction.controller";

type Params = {
    params: Promise<{ year: string }>;
};

export async function GET(_: Request, { params }: Params) {
    const { year } = await params;
    return handleGetDocumentationDistributionYearDetail(year);
}
