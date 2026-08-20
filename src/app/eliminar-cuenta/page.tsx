import Link from "next/link";

export const metadata = {
  title: "Eliminar mi cuenta — Mis Entradas",
};

export default function DeleteAccountInfoPage() {
  return (
    <div className="py-6 flex flex-col gap-5 text-sm text-paper/90">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
          Mis Entradas
        </p>
        <h1 className="font-display text-2xl uppercase tracking-wide mb-1">
          Eliminar mi cuenta
        </h1>
      </div>

      <Section title="Cómo pedirlo">
        <ol className="list-decimal pl-5 flex flex-col gap-1">
          <li>
            Iniciá sesión en{" "}
            <Link href="/auth/login" className="text-violet underline">
              misentradas.com.ar
            </Link>
            .
          </li>
          <li>Andá a &quot;Mi cuenta&quot; (menú ☰ → Mi cuenta).</li>
          <li>
            Al final de la página, tocá &quot;Eliminar mi cuenta&quot;,
            escribí ELIMINAR para confirmar y enviá.
          </li>
        </ol>
        <p className="mt-3">
          Si no podés iniciar sesión, escribinos desde el email registrado a{" "}
          <a
            href="mailto:julio@estudioborn.com.ar"
            className="text-violet underline"
          >
            julio@estudioborn.com.ar
          </a>{" "}
          pidiendo la eliminación de tu cuenta; lo procesamos manualmente en
          un plazo máximo de 30 días.
        </p>
      </Section>

      <Section title="Qué se borra">
        <p>De forma inmediata:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
          <li>Nombre y foto de perfil.</li>
          <li>Conexión con MercadoPago (si sos organizador).</li>
          <li>Tokens de notificaciones push del dispositivo.</li>
          <li>
            Acceso a la cuenta: dejás de poder iniciar sesión con ese email.
          </li>
        </ul>
      </Section>

      <Section title="Qué se conserva y por qué">
        <p>
          Las entradas y pagos ya realizados no se borran del todo, pero se
          desvinculan de tu identidad (sin tu nombre ni email visible):
          conservamos el registro de la operación por obligaciones legales e
          impositivas, y porque otros compradores u organizadores dependen de
          esos mismos registros (por ejemplo, la venta que le hiciste a un
          organizador, o el historial de un evento). Esta información
          anonimizada se conserva mientras la normativa impositiva argentina
          lo exija.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Ver la{" "}
          <Link href="/privacidad" className="text-violet underline">
            política de privacidad completa
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-base uppercase tracking-wide text-paper mb-2">
        {title}
      </h2>
      <div className="text-haze leading-relaxed flex flex-col gap-1">
        {children}
      </div>
    </section>
  );
}
