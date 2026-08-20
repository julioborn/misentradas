"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/account/actions";

export function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-violet underline"
      >
        Eliminar mi cuenta
      </button>
    );
  }

  return (
    <form action={deleteAccount} className="flex flex-col gap-3">
      <p className="text-xs text-haze">
        Se borran tu nombre, foto y ubicación guardada, y dejás de poder
        iniciar sesión. Las entradas y pagos ya realizados se conservan de
        forma anónima (sin tu nombre ni email) por motivos legales/impositivos.
        Esta acción no se puede deshacer.
      </p>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmacion"
          className="text-xs uppercase tracking-wide text-haze"
        >
          Escribí ELIMINAR para confirmar
        </label>
        <input
          id="confirmacion"
          name="confirmacion"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmation("");
          }}
          className="flex-1 rounded-full border border-white/10 text-paper py-2.5 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={confirmation !== "ELIMINAR"}
          className="flex-1 rounded-full bg-violet text-ink py-2.5 font-semibold disabled:opacity-40"
        >
          Eliminar cuenta
        </button>
      </div>
    </form>
  );
}
