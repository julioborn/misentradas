"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TicketStub } from "@/components/ticket-stub";

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.rol === "organizer" ? "/organizer/dashboard" : "/");
    router.refresh();
  }

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-magenta uppercase mb-2">
        Admisión
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Ingresar
      </h1>
      <p className="text-haze text-sm mb-6">
        Accedé a tu cuenta para comprar o gestionar entradas.
      </p>

      <TicketStub>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-haze">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-magenta disabled:opacity-50"
              placeholder="vos@email.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-haze"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-magenta disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-magenta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-magenta text-ink py-2.5 font-semibold disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </TicketStub>

      <p className="text-sm text-haze mt-6 text-center">
        ¿No tenés cuenta?{" "}
        <Link href="/auth/register" className="text-lime font-medium">
          Registrate
        </Link>
      </p>
    </div>
  );
}
