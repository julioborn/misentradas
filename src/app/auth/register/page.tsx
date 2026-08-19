"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Rol = "buyer" | "organizer";

export default function RegisterPage() {
  const router = useRouter();
  const [rol, setRol] = useState<Rol>("buyer");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-1">Creá tu cuenta</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Elegí cómo vas a usar Mis Entradas.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRol("buyer")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-sm font-medium ${
            rol === "buyer"
              ? "border-violet-600 bg-violet-50 text-violet-700"
              : "border-neutral-200 text-neutral-600"
          }`}
        >
          <PartyPopper className="size-5" />
          Comprador
        </button>
        <button
          type="button"
          onClick={() => setRol("organizer")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-sm font-medium ${
            rol === "organizer"
              ? "border-violet-600 bg-violet-50 text-violet-700"
              : "border-neutral-200 text-neutral-600"
          }`}
        >
          <Store className="size-5" />
          Organizador
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
            placeholder="Tu nombre"
          />
        </div>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-violet-600 text-white py-2.5 font-medium disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-sm text-neutral-500 mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link href="/auth/login" className="text-violet-600 font-medium">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
