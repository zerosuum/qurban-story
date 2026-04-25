export const dynamic = "force-dynamic";

import {
  handleCreateProduct,
  handleListProducts,
} from "@/lib/products/product.controller";

export async function GET(request: Request) {
  return handleListProducts(request);
}

export async function POST(request: Request) {
  return handleCreateProduct(request);
}
