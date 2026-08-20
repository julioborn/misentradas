import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { TicketStub } from "@/components/ticket-stub";

export default function AccountDeletedPage() {
  return (
    <div className="py-6">
      <TicketStub>
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <CheckCircle2 className="size-10 text-lime" />
          <h1 className="font-display text-xl uppercase tracking-wide">
            Cuenta eliminada
          </h1>
          <p className="text-sm text-haze">
            Borramos tus datos personales y ya no podés iniciar sesión con
            esa cuenta. Las entradas y pagos ya realizados quedan
            conservados de forma anónima, sin tu nombre ni email.
          </p>
          <Link href="/" className="text-violet text-sm font-medium mt-2">
            Volver al inicio
          </Link>
        </div>
      </TicketStub>
    </div>
  );
}
