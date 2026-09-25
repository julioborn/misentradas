import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateStockCounts } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";
import { StockIcon } from "@/components/stock-icon";
import { StockCountField } from "@/components/stock-count-field";

type StockItem = {
  id: string;
  nombre: string;
  icono: "bottle" | "can" | "champagne" | "cup";
  color: string;
  unidades_por_pack: number;
  cantidad_inicial: number | null;
  cantidad_final: number | null;
};

export default async function EventStockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, nombre, organizer_id, stock_habilitado")
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect("/organizer/dashboard");
  if (!event.stock_habilitado) redirect("/organizer/dashboard");

  const { data: items } = await supabase
    .from("stock_items")
    .select(
      "id, nombre, icono, color, unidades_por_pack, cantidad_inicial, cantidad_final"
    )
    .eq("event_id", id)
    .order("orden", { ascending: true });

  const stockItems = (items ?? []) as StockItem[];

  const totals = stockItems.reduce(
    (acc, item) => {
      if (item.cantidad_inicial !== null) acc.inicial += item.cantidad_inicial;
      if (item.cantidad_final !== null) acc.final += item.cantidad_final;
      if (item.cantidad_inicial !== null && item.cantidad_final !== null) {
        acc.consumido += item.cantidad_inicial - item.cantidad_final;
      }
      return acc;
    },
    { inicial: 0, final: 0, consumido: 0 }
  );

  const updateStockCountsWithId = updateStockCounts.bind(null, id);

  return (
    <div className="py-6">
      <Link
        href="/organizer/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-haze hover:text-paper mb-4"
      >
        <ArrowLeft className="size-4" />
        Volver a mis eventos
      </Link>

      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Control de stock
      </h1>
      <p className="text-haze text-sm mb-6">
        {event.nombre} — cargá lo que entra antes de abrir, y lo que queda al
        cerrar.
      </p>

      {success && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          Stock actualizado.
        </p>
      )}

      {stockItems.length === 0 ? (
        <TicketStub>
          <p className="text-sm text-haze text-center py-6">
            Todavía no se cargaron productos para este evento.
          </p>
        </TicketStub>
      ) : (
        <form action={updateStockCountsWithId} className="flex flex-col gap-3">
          {stockItems.map((item) => {
            const consumido =
              item.cantidad_inicial !== null && item.cantidad_final !== null
                ? item.cantidad_inicial - item.cantidad_final
                : null;

            return (
              <TicketStub key={item.id}>
                <div className="flex items-center gap-3">
                  <StockIcon type={item.icono} color={item.color} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display uppercase tracking-wide leading-tight">
                      {item.nombre}
                    </p>
                    {consumido !== null && (
                      <p className="text-xs text-haze mt-0.5">
                        Consumido:{" "}
                        <span className="text-lime font-medium">
                          {consumido}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-dashed border-white/10">
                  <StockCountField
                    fieldName={`inicial_${item.id}`}
                    label="Inicial"
                    defaultUnits={item.cantidad_inicial}
                    unidadesPorPack={item.unidades_por_pack}
                  />
                  <StockCountField
                    fieldName={`final_${item.id}`}
                    label="Final"
                    defaultUnits={item.cantidad_final}
                    unidadesPorPack={item.unidades_por_pack}
                  />
                </div>
              </TicketStub>
            );
          })}

          <TicketStub className="ring-1 ring-lime/20">
            <p className="font-mono text-xs uppercase tracking-widest text-haze mb-2">
              Balance total
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-display text-xl">{totals.inicial}</p>
                <p className="text-xs text-haze">Inicial</p>
              </div>
              <div>
                <p className="font-display text-xl">{totals.final}</p>
                <p className="text-xs text-haze">Final</p>
              </div>
              <div>
                <p className="font-display text-xl text-lime">
                  {totals.consumido}
                </p>
                <p className="text-xs text-haze">Consumido</p>
              </div>
            </div>
          </TicketStub>

          <button
            type="submit"
            className="rounded-full bg-violet text-ink py-2.5 font-semibold"
          >
            Guardar cambios
          </button>
        </form>
      )}
    </div>
  );
}
