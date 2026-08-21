"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession, getAccessToken, getRefreshToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!phoneNumber || !password) {
    return { error: "Enter your phone number and password." };
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach the server. Try again shortly." };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return { error: data?.detail ?? "Invalid phone number or password." };
  }

  if (!data?.user?.is_staff) {
    return { error: "This account does not have admin access." };
  }

  await createSession({ access: data.access, refresh: data.refresh });
  redirect("/");
}

export async function logout() {
  const [access, refresh] = await Promise.all([getAccessToken(), getRefreshToken()]);
  if (access && refresh) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
    } catch {
      // Best-effort — proceed to clear the local session regardless.
    }
  }

  await deleteSession();
  redirect("/login");
}
