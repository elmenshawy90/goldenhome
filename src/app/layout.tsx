import type { Metadata } from "next";
import { Cairo, Rakkas } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

// خط عربي كلاسيك أرابيسك للعناوين واللوجو
const rakkas = Rakkas({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  variable: "--font-arabesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "جولدن هوم | أثاث منزلي ومراتب فاخرة",
    template: "%s | جولدن هوم",
  },
  description:
    "جولدن هوم — متجر الأثاث المنزلي: غرف نوم، غرف أطفال، ركن، انتريهات ومراتب طبية بضمان وأسعار منافسة.",
  openGraph: {
    title: "جولدن هوم | أثاث منزلي ومراتب",
    description: "غرف نوم • أطفال • ركن • انتريهات • مراتب — جودة تستحقها بيتك.",
    type: "website",
    locale: "ar_EG",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([
    getSession().catch(() => null),
    getSettings().catch(() => null),
  ]);
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${rakkas.variable}`}>
      <body className="font-sans antialiased">
        <Header loggedIn={Boolean(session)} topStrip={settings?.topStrip} phone={settings?.phone} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
