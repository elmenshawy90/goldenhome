import { getOffers, getProducts } from "@/lib/data";
import OffersManager from "./OffersManager";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const [offers, products] = await Promise.all([getOffers(false), getProducts({})]);
  return <OffersManager initial={offers} products={products} />;
}
