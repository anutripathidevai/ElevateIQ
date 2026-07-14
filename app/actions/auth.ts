"use server";

import { signIn, signOut } from "@/lib/auth";

export async function login(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
