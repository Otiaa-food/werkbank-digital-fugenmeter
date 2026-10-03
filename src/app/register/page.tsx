"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = undefined;

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#DAD3C4] rounded-2xl p-6">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold uppercase tracking-wide text-2xl mb-1">
          Fugenmeter
        </h1>
        <p className="text-sm text-[#726C60] mb-6">
          Neuen Betrieb anlegen und loslegen.
        </p>

        <form action={formAction} className="flex flex-col gap-3">
          <Field label="Firma / Betrieb" name="firma" placeholder="z. B. Mustermann Fugenbau" required />
          <Field label="Dein Name" name="name" placeholder="z. B. Benjamin M." />
          <Field label="E-Mail" name="email" type="email" placeholder="du@firma.de" required />
          <Field label="Passwort" name="password" type="password" placeholder="mind. 8 Zeichen" required />

          {state?.error && (
            <p className="text-sm text-[#B3261E]" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full bg-[#FF6A13] text-white font-[family-name:var(--font-display)] font-bold uppercase tracking-wide text-lg rounded-lg py-3 disabled:opacity-50"
          >
            {pending ? "Wird angelegt …" : "Betrieb anlegen"}
          </button>
        </form>

        <p className="text-sm text-[#726C60] mt-4">
          Schon registriert?{" "}
          <Link href="/login" className="text-[#4A6670] underline">
            Zum Login
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#726C60]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="border border-[#DAD3C4] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#4A6670]"
      />
    </label>
  );
}
