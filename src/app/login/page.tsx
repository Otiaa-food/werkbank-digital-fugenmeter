"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("E-Mail oder Passwort stimmt nicht.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#DAD3C4] rounded-2xl p-6">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold uppercase tracking-wide text-2xl mb-1">
          Fugenmeter
        </h1>
        <p className="text-sm text-[#726C60] mb-6">Anmelden und Aufmaß erfassen.</p>

        {justRegistered && (
          <p className="text-sm text-[#1F7A4D] mb-4">
            Betrieb angelegt — jetzt anmelden.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#726C60]">
              E-Mail
            </span>
            <input
              name="email"
              type="email"
              required
              className="border border-[#DAD3C4] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#4A6670]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#726C60]">
              Passwort
            </span>
            <input
              name="password"
              type="password"
              required
              className="border border-[#DAD3C4] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#4A6670]"
            />
          </label>

          {error && (
            <p className="text-sm text-[#B3261E]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full bg-[#FF6A13] text-white font-[family-name:var(--font-display)] font-bold uppercase tracking-wide text-lg rounded-lg py-3 disabled:opacity-50"
          >
            {pending ? "Melde an …" : "Anmelden"}
          </button>
        </form>

        <p className="text-sm text-[#726C60] mt-4">
          Noch kein Zugang?{" "}
          <Link href="/register" className="text-[#4A6670] underline">
            Betrieb anlegen
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
