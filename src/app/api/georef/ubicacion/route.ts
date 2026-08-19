import { NextResponse } from "next/server";

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Faltan lat/lon" }, { status: 400 });
  }

  try {
    const url = new URL(`${GEOREF_BASE}/ubicacion`);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);

    const res = await fetch(url.toString());

    if (!res.ok) {
      return NextResponse.json(
        { error: "No pudimos determinar tu ubicación" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ubicacion: data.ubicacion ?? null });
  } catch {
    return NextResponse.json(
      { error: "No pudimos determinar tu ubicación" },
      { status: 502 }
    );
  }
}
