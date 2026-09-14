import { getCategories } from "@/lib/data";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} />;
}
