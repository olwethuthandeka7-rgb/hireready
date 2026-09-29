"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { logInSchema, signUpSchema } from "@/lib/validation/auth";

// What a form gets back when something needs fixing.
export type AuthFormState = {
  message?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password", string[]>>;
  // Returned so the form can keep what the user typed.
  // The password is never sent back.
  values?: { fullName?: string; email?: string };
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

// Works out our site's address (localhost now, the real domain later).
async function getSiteOrigin() {
  const headerList = await headers();
  return (
    headerList.get("origin") ?? `https://${headerList.get("host") ?? ""}`
  );
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    fullName: text(formData.get("fullName")),
    email: text(formData.get("email")),
    password: text(formData.get("password")),
  };
  const values = { fullName: input.fullName, email: input.email };

  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();
  const origin = await getSiteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return {
        fieldErrors: {
          password: ["Choose a stronger password with letters and numbers."],
        },
        values,
      };
    }
    if (error.code === "over_email_send_rate_limit") {
      return {
        message:
          "Too many sign-up emails were sent recently. Wait a few minutes and try again.",
        values,
      };
    }
    return {
      message: "We couldn't create your account. Try again in a moment.",
      values,
    };
  }

  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && data.user.identities?.length === 0) {
    return {
      fieldErrors: {
        email: ["An account with this email already exists. Log in instead."],
      },
      values,
    };
  }

  redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
}

export async function logIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = {
    email: text(formData.get("email")),
    password: text(formData.get("password")),
  };
  const values = { email: input.email };

  const parsed = logInSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Confirm your email first. Check your inbox for the link we sent you.",
        values,
      };
    }
    if (error.code === "invalid_credentials") {
      return {
        message: "That email and password don't match. Check them and try again.",
        values,
      };
    }
    return {
      message: "We couldn't log you in. Try again in a moment.",
      values,
    };
  }

  redirect(safeRedirectPath(text(formData.get("next"))));
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}