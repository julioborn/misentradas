"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError(
          "Todavía no confirmaste tu email. Revisá tu casilla de correo (y spam)."
        );
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-1">Ingresar</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Accedé a tu cuenta para comprar o gestionar entradas.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
            placeholder="vos@email.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-violet-600 text-white py-2.5 font-medium disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-sm text-neutral-500 mt-6">
        ¿No tenés cuenta?{" "}
        <Link href="/auth/register" className="text-violet-600 font-medium">
          Registrate
        </Link>
      </p>
    </div>
  );
}
