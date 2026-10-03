import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { plexMono, plexSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UzCode — ishga suhbat uchun algoritm masalalari",
    template: "%s · UzCode",
  },
  description:
    "Ishga suhbatda so'raladigan algoritm masalalari o'zbek tilida. Yechimni Python, JavaScript yoki C++ da brauzerning o'zida yozing va darhol tekshiring.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions add their own attributes to <html> before React
    // hydrates; without this the dev overlay reports a hydration error.
    <html
      lang="uz"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
