"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Plus,
  ScanLine,
  Shield,
  Ticket,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { unregisterPush } from "@/lib/push-client";
import type { Tables } from "@/lib/supabase/types";

export function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Tables<"profiles"> | null | undefined>(
    undefined
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
    await unregisterPush();
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const isOrganizer = profile?.rol === "organizer";

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="font-display text-sm tracking-wide uppercase">
              Mis Entradas
            </span>
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="text-haze hover:text-paper"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-30">
          <button
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
          />
          <nav className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-surface border-l border-white/10 flex flex-col px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-lg tracking-wide lowercase">
                menú
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="text-haze hover:text-paper"
              >
                <X className="size-5" />
              </button>
            </div>

            {profile === undefined ? null : profile ? (
              <div className="flex flex-col gap-1 text-sm">
                <MenuLink
                  href="/"
                  icon={<Home className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Inicio
                </MenuLink>
                {isOrganizer && (
                  <>
                    <MenuLink
                      href="/organizer/dashboard"
                      icon={<LayoutDashboard className="size-4" />}
                      onNavigate={() => setMenuOpen(false)}
                    >
                      Panel
                    </MenuLink>
                    <MenuLink
                      href="/organizer/events/new"
                      icon={<Plus className="size-4" />}
                      onNavigate={() => setMenuOpen(false)}
                    >
                      Crear evento
                    </MenuLink>
                  </>
                )}
                <MenuLink
                  href="/tickets"
                  icon={<Ticket className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Mis entradas
                </MenuLink>
                <MenuLink
                  href="/scan"
                  icon={<ScanLine className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Escanear
                </MenuLink>
                <MenuLink
                  href="/account"
                  icon={<User className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Mi cuenta
                </MenuLink>
                <MenuLink
                  href="/privacidad"
                  icon={<Shield className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Privacidad
                </MenuLink>

                <div className="mt-auto pt-4 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-haze hover:bg-white/5 hover:text-violet"
                  >
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-sm">
                <MenuLink
                  href="/"
                  icon={<Home className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Inicio
                </MenuLink>
                <MenuLink
                  href="/auth/login"
                  icon={<LogIn className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Ingresar
                </MenuLink>
                <MenuLink
                  href="/auth/register"
                  icon={<UserPlus className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Registrarme
                </MenuLink>
                <MenuLink
                  href="/privacidad"
                  icon={<Shield className="size-4" />}
                  onNavigate={() => setMenuOpen(false)}
                >
                  Privacidad
                </MenuLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-paper hover:bg-white/5 hover:text-violet"
    >
      {icon}
      {children}
    </Link>
  );
}
