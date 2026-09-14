import CategoryPage, { makeMetadata } from "@/components/CategoryPage";

export const metadata = makeMetadata("bedrooms", "غرف النوم", "غرف نوم مودرن وكلاسيك بتشطيب فاخر وضمان 5 سنوات.");

export default function Page() {
  return <CategoryPage slug="bedrooms" title="غرف النوم" />;
}
