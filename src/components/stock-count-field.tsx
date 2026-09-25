"use client";

import { useState } from "react";

export function StockCountField({
  fieldName,
  label,
  defaultUnits,
  unidadesPorPack,
}: {
  fieldName: string;
  label: string;
  defaultUnits: number | null;
  unidadesPorPack: number;
}) {
  const [modo, setModo] = useState<"unidad" | "pack">("unidad");
  const [value, setValue] = useState(
    defaultUnits !== null ? String(defaultUnits) : ""
  );

  function toggleModo() {
    const current = value === "" ? null : Number(value);
    const nextModo = modo === "unidad" ? "pack" : "unidad";

    if (current !== null && !Number.isNaN(current)) {
      const converted =
        nextModo === "pack"
          ? current / unidadesPorPack
          : current * unidadesPorPack;
      setValue(String(Math.round(converted * 100) / 100));
    }

    setModo(nextModo);
  }

  const equivalentUnits =
    modo === "pack" && value !== "" && !Number.isNaN(Number(value))
      ? Math.round(Number(value) * unidadesPorPack)
      : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <label className="text-xs uppercase tracking-wide text-haze">
          {label}
        </label>
        <button
          type="button"
          onClick={toggleModo}
          className="text-[10px] font-medium uppercase tracking-wide text-violet"
        >
          {modo === "unidad" ? "Unidad" : `Pack ×${unidadesPorPack}`}
        </button>
      </div>
      <input
        name={fieldName}
        type="number"
        min="0"
        step={modo === "pack" ? "0.5" : "1"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
      />
      <input type="hidden" name={`${fieldName}_modo`} value={modo} />
      {equivalentUnits !== null && (
        <p className="text-xs text-haze">= {equivalentUnits} u.</p>
      )}
    </div>
  );
}
