"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const OPTIONS = [
  { value: "fecha", label: "Más próximos primero" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "fecha";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "fecha") params.delete("sort");
    else params.set("sort", value);
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <ArrowUpDown className="size-3.5 text-haze shrink-0" />
      <select
        value={sort}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 rounded-lg bg-ink border border-white/10 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-violet"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
