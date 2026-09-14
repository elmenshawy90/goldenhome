import CategoryPage, { makeMetadata } from "@/components/CategoryPage";

export const metadata = makeMetadata("living-rooms", "الانتريهات", "انتريهات وصالونات فاخرة للمعيشة والضيوف.");

export default function Page() {
  return <CategoryPage slug="living-rooms" title="الانتريهات" />;
}
