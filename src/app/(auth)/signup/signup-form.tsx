"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    {},
  );

  const nameError = state.fieldErrors?.fullName?.[0];
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">
        Create your account
      </h1>
      <p className="mt-3 text-graphite">
        Free to start. You can build or upload your CV right after.
      </p>

      {state.message && <FormAlert>{state.message}</FormAlert>}

      <form action={formAction} className="mt-8 space-y-5" noValidate>
        <FormField id="fullName" label="Full name" error={nameError}>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            defaultValue={state.values?.fullName}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "fullName-error" : undefined}
            required
          />
        </FormField>

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

        <FormField
          id="password"
          label="Password"
          hint="At least 8 characters."
          error={passwordError}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : "password-hint"}
            required
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          pending={pending}
          pendingText="Creating your account…"
        >
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-graphite">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-highlight decoration-4 underline-offset-4 transition-colors hover:decoration-gap"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}