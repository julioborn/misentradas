import { NextResponse } from "next/server";

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provincia = searchParams.get("provincia");

  if (!provincia) {
    return NextResponse.json({ error: "Falta la provincia" }, { status: 400 });
  }

  try {
    const url = new URL(`${GEOREF_BASE}/localidades`);
    url.searchParams.set("provincia", provincia);
    url.searchParams.set("campos", "id,nombre");
    url.searchParams.set("orden", "nombre");
    url.searchParams.set("max", "1000");

    const res = await fetch(url.toString(), {
      // Localities are effectively static; cache for a day.
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "No pudimos obtener las localidades" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ localidades: data.localidades ?? [] });
  } catch {
    return NextResponse.json(
      { error: "No pudimos obtener las localidades" },
      { status: 502 }
    );
  }
}
