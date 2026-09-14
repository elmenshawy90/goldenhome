import CategoryPage, { makeMetadata } from "@/components/CategoryPage";

export const metadata = makeMetadata("corners", "الركن", "ركن مودرن حرف L بخامات متينة وسحارة تخزين.");

export default function Page() {
  return <CategoryPage slug="corners" title="الركن" />;
}
