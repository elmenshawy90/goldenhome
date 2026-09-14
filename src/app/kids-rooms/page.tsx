import CategoryPage, { makeMetadata } from "@/components/CategoryPage";

export const metadata = makeMetadata("kids-rooms", "غرف الأطفال", "غرف أطفال عملية وآمنة بسراير دورين ومكاتب.");

export default function Page() {
  return <CategoryPage slug="kids-rooms" title="غرف الأطفال" />;
}
