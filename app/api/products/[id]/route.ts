import {
  handleDeleteProduct,
  handleGetProduct,
  handleUpdateProduct,
} from "@/lib/products/product.controller";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  return handleGetProduct(id);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return handleUpdateProduct(id, request);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  return handleDeleteProduct(id);
}
