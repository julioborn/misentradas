import { NextResponse } from "next/server";

const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

export async function GET() {
  try {
    const res = await fetch(
      `${GEOREF_BASE}/provincias?campos=id,nombre&orden=nombre&max=30`,
      // Provinces don't change; cache for a day.
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "No pudimos obtener las provincias" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ provincias: data.provincias ?? [] });
  } catch {
    return NextResponse.json(
      { error: "No pudimos obtener las provincias" },
      { status: 502 }
    );
  }
}
