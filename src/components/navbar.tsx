"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

export function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Tables<"profiles"> | null | undefined>(
    undefined
  );

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => loadProfile());

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Ticket className="size-5 text-violet-600" />
          Mis Entradas
        </Link>

        {profile === undefined ? null : profile ? (
          <div className="flex items-center gap-3 text-sm">
            {profile.rol === "organizer" && (
              <Link href="/organizer/dashboard" className="text-neutral-600">
                Panel
              </Link>
            )}
            <Link href="/tickets" className="text-neutral-600">
              Mis entradas
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="text-neutral-400 hover:text-neutral-700"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/auth/login" className="text-neutral-600">
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-violet-600 text-white px-3 py-1.5"
            >
              Registrarme
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
