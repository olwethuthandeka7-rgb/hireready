"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type AuthFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

type LoginFormProps = {
  next?: string;
  confirmationFailed: boolean;
};

export function LoginForm({ next, confirmationFailed }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    logIn,
    {},
  );

  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-3 text-graphite">
        Log in to see your CVs and applications.
      </p>

      {state.message ? (
        <FormAlert>{state.message}</FormAlert>
      ) : (
        confirmationFailed && (
          <FormAlert>
            That confirmation link didn&apos;t work. It may have expired or
            already been used. Try logging in, or sign up again to get a new
            link.
          </FormAlert>
        )
      )}

      <form action={formAction} className="mt-8 space-y-5" noValidate>
        {/* Remembers the page the user was trying to open */}
        <input type="hidden" name="next" value={next ?? ""} />

        <FormField id="email" label="Email" error={emailError}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            required
          />
        </FormField>

        <FormField id="password" label="Password" error={passwordError}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : undefined}
            required
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          pending={pending}
          pendingText="Logging in…"
        >
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-graphite">
        New to HireReady?{" "}
        <Link
          href="/signup"
          className="font-semibold text-ink underline decoration-highlight decoration-4 underline-offset-4 transition-colors hover:decoration-gap"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}