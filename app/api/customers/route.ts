import { handleListCustomers } from "@/lib/customers/customer.controller";

export async function GET(request: Request) {
    return handleListCustomers(request);
}