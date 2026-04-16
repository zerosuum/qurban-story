import { handleGetCustomerById } from "@/lib/customers/customer.controller";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
    const { id } = await params;
    return handleGetCustomerById(id);
}