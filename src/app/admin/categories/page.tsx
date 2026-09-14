import { getCategories } from "@/lib/data";
import CategoriesManager from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesManager initial={categories} />;
}
