import type { Metadata } from "next";
import { Figtree, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getDict, getTheme } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "ENITJobs", template: "%s · ENITJobs" },
  description: "Local-first, AI-assisted job and internship search companion for ENIT students.",
  icons: { icon: "/icon.svg" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [{ locale, t }, theme] = await Promise.all([getDict(), getTheme()]);
  return (
    <html
      lang={locale}
      data-theme={theme === "system" ? undefined : theme}
      className={`${fraunces.variable} ${figtree.variable} ${jetbrains.variable} h-full`}
    >
      <body className="grain min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn btn-primary"
        >
          {t.nav.skipToContent}
        </a>
        <I18nProvider locale={locale} t={t}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
