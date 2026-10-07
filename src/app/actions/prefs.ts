"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, THEME_COOKIE } from "@/lib/i18n/server";

const YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: string) {
  const v = locale === "en" ? "en" : "fr";
  (await cookies()).set(LOCALE_COOKIE, v, { maxAge: YEAR, path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function setTheme(theme: string) {
  const v = theme === "light" || theme === "dark" ? theme : "system";
  (await cookies()).set(THEME_COOKIE, v, { maxAge: YEAR, path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}
