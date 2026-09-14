import { getCategories, getProducts } from "@/lib/data";
import ProductsTable from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts({}), getCategories()]);
  return <ProductsTable products={products} categories={categories} />;
}
