import CategoryPage, { makeMetadata } from "@/components/CategoryPage";

export const metadata = makeMetadata("mattresses", "المراتب", "مراتب طبية وسوست منفصلة براحة مضمونة وضمان حتى 10 سنوات.");

export default function Page() {
  return <CategoryPage slug="mattresses" title="المراتب" />;
}
