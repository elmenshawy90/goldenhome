import { getSettings } from "@/lib/data";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsManager initial={settings} />;
}
