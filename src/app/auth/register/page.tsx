"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TicketStub } from "@/components/ticket-stub";

type Rol = "buyer" | "organizer";

export default function RegisterPage() {
  const router = useRouter();
  const [rol, setRol] = useState<Rol>("buyer");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Sin sesión activa significa que el proyecto exige confirmar el
    // email antes de poder iniciar sesión.
    if (!data.session) {
      setLoading(false);
      setConfirmEmailSent(true);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (confirmEmailSent) {
    return (
      <div className="py-6">
        <p className="font-mono text-xs tracking-[0.3em] text-lime uppercase mb-2">
          Casi listo
        </p>
        <h1 className="font-display text-3xl uppercase tracking-wide mb-4">
          Revisá tu email
        </h1>
        <TicketStub>
          <p className="text-sm text-paper">
            Te enviamos un link de confirmación a{" "}
            <strong className="text-lime">{email}</strong>. Abrilo para
            activar tu cuenta y después ingresá desde{" "}
            <Link href="/auth/login" className="text-magenta font-medium">
              acá
            </Link>
            .
          </p>
        </TicketStub>
      </div>
    );
  }

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-magenta uppercase mb-2">
        Alta de cuenta
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Creá tu cuenta
      </h1>
      <p className="text-haze text-sm mb-6">
        Elegí cómo vas a usar Mis Entradas.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRol("buyer")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-colors ${
            rol === "buyer"
              ? "border-magenta bg-magenta/10 text-paper"
              : "border-white/10 bg-surface text-haze"
          }`}
        >
          <PartyPopper className="size-5" />
          Comprador
        </button>
        <button
          type="button"
          onClick={() => setRol("organizer")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-colors ${
            rol === "organizer"
              ? "border-magenta bg-magenta/10 text-paper"
              : "border-white/10 bg-surface text-haze"
          }`}
        >
          <Store className="size-5" />
          Organizador
        </button>
      </div>

      <TicketStub>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs uppercase tracking-wide text-haze">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              disabled={loading}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-magenta disabled:opacity-50"
              placeholder="Tu nombre"
            />
          </div>

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
              minLength={6}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-magenta disabled:opacity-50"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && <p className="text-sm text-magenta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-magenta text-ink py-2.5 font-semibold disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </TicketStub>

      <p className="text-sm text-haze mt-6 text-center">
        ¿Ya tenés cuenta?{" "}
        <Link href="/auth/login" className="text-lime font-medium">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
