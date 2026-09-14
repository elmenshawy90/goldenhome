import { notFound } from "next/navigation";
import { getCategories, getProductBySlug } from "@/lib/data";
import { readDb } from "@/lib/store";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [categories, bySlug] = await Promise.all([getCategories(), getProductBySlug(params.id)]);
  let product = bySlug;
  if (!product) {
    const db = readDb();
    const found = db.products.find((p) => p.id === params.id);
    product = (found ? { ...found, category: db.categories.find((c) => c.id === found.categoryId) ?? null } : null) as typeof bySlug;
  }
  if (!product) return notFound();
  return <ProductForm categories={categories} initial={product} editId={product.id} />;
}
