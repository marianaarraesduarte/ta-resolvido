"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MONTH_COOKIE_NAME } from "@/lib/month-cookie";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function goToMonth(path: string, monthKey: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MONTH_COOKIE_NAME, monthKey, { maxAge: COOKIE_MAX_AGE, path: "/app" });
  redirect(`${path}?mes=${monthKey}`);
}

export async function clearMonthSelection(path: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MONTH_COOKIE_NAME);
  redirect(path);
}
