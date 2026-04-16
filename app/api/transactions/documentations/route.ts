import {
    handleDistributeDocumentations,
    handleListDocumentationDistributionYears,
    handleUploadSlaughterDocumentations,
} from "@/lib/transactions/transaction.controller";

export async function GET(request: Request) {
    return handleListDocumentationDistributionYears(request);
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "slaughter") {
        return handleUploadSlaughterDocumentations(request);
    }

    return handleDistributeDocumentations(request);
}
