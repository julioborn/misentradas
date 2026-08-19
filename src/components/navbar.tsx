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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="size-5 text-magenta" />
          <span className="font-display text-xl tracking-wide uppercase">
            Mis Entradas
          </span>
        </Link>

        {profile === undefined ? null : profile ? (
          <div className="flex items-center gap-4 text-sm">
            {profile.rol === "organizer" && (
              <Link href="/organizer/dashboard" className="text-haze hover:text-paper">
                Panel
              </Link>
            )}
            <Link href="/tickets" className="text-haze hover:text-paper">
              Mis entradas
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="text-haze hover:text-magenta"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/auth/login" className="text-haze hover:text-paper">
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-magenta text-ink font-semibold px-4 py-1.5 hover:brightness-110"
            >
              Registrarme
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
