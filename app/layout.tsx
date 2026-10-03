import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { golos, jetbrainsMono, tektur } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UzCode — algoritmlarni o'zbek tilida mashq qiling",
    template: "%s · UzCode",
  },
  description:
    "Algoritm va dasturlash masalalari o'zbek tilida. Yechimni Python, JavaScript yoki C++ da brauzerning o'zida yozing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions add their own attributes to <html> before React
    // hydrates; without this the dev overlay reports a hydration error.
    <html
      lang="uz"
      className={`${golos.variable} ${tektur.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
