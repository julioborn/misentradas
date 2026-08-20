export const metadata = {
  title: "Política de privacidad — Mis Entradas",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-6 flex flex-col gap-5 text-sm text-paper/90">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
          Legal
        </p>
        <h1 className="font-display text-2xl uppercase tracking-wide mb-1">
          Política de privacidad
        </h1>
        <p className="text-haze text-xs">Última actualización: agosto de 2026</p>
      </div>

      <Section title="1. Quiénes somos">
        <p>
          Mis Entradas es una plataforma para comprar y vender entradas a
          eventos en Argentina. Esta política explica qué datos recopilamos
          cuando usás la app o el sitio, para qué los usamos y con quién los
          compartimos.
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p className="font-medium text-paper mb-1">Datos de cuenta</p>
        <p>
          Nombre, email y contraseña (gestionada de forma segura por nuestro
          proveedor de autenticación, nunca la vemos en texto plano). Si sos
          organizador, además podés subir una foto de perfil/logo.
        </p>
        <p className="font-medium text-paper mt-3 mb-1">Ubicación</p>
        <p>
          Si elegís activarla, usamos la ubicación de tu dispositivo una
          única vez para sugerirte tu provincia y localidad y mostrarte
          eventos cercanos. No guardamos tus coordenadas GPS: solo se
          almacena la provincia/localidad resultante, en tu propio
          dispositivo (cookie local), no en nuestros servidores.
        </p>
        <p className="font-medium text-paper mt-3 mb-1">Pagos</p>
        <p>
          Los pagos con tarjeta se procesan directamente por MercadoPago.
          Nosotros no recibimos ni almacenamos números de tarjeta: solo
          guardamos el resultado de la operación (monto, comisión, estado).
        </p>
        <p className="font-medium text-paper mt-3 mb-1">Entradas y compras</p>
        <p>
          Historial de eventos comprados, código QR de cada entrada y su
          estado (confirmada, usada, cancelada).
        </p>
        <p className="font-medium text-paper mt-3 mb-1">Notificaciones push</p>
        <p>
          Si instalás la app y aceptás recibir notificaciones, guardamos un
          identificador de tu dispositivo (token) para poder avisarte sobre
          tus compras y tus eventos. Podés desactivarlas cuando quieras desde
          los ajustes del sistema o cerrando sesión.
        </p>
      </Section>

      <Section title="3. Para qué usamos tus datos">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Crear y gestionar tu cuenta.</li>
          <li>Procesar compras y generar tus entradas con QR.</li>
          <li>Mostrarte eventos relevantes según tu ubicación.</li>
          <li>
            Enviarte notificaciones sobre tus compras, ventas (si sos
            organizador) y recordatorios de eventos.
          </li>
          <li>Prevenir fraude y mal uso de la plataforma.</li>
        </ul>
      </Section>

      <Section title="4. Con quién compartimos datos">
        <p>No vendemos tus datos. Los compartimos únicamente con:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
          <li>
            <span className="text-paper">Supabase</span> — hospeda nuestra
            base de datos y gestiona el inicio de sesión.
          </li>
          <li>
            <span className="text-paper">MercadoPago</span> — procesa los
            pagos con tarjeta.
          </li>
          <li>
            <span className="text-paper">Google Firebase</span> — entrega las
            notificaciones push a tu dispositivo.
          </li>
          <li>
            <span className="text-paper">GeoRef (datos.gob.ar)</span> — API
            pública del Estado argentino que usamos para resolver
            provincia/localidad a partir de tu ubicación, sin almacenar nada
            de nuestra parte.
          </li>
          <li>
            El <span className="text-paper">organizador</span> del evento al
            que compraste entrada ve tu nombre y email para gestionar la
            venta.
          </li>
        </ul>
      </Section>

      <Section title="5. Seguridad">
        <p>
          Tus datos viajan cifrados (HTTPS) y se almacenan en servidores con
          controles de acceso. El acceso a información sensible está
          restringido por reglas de seguridad a nivel de base de datos.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>
          Podés acceder, corregir o eliminar tus datos personales en
          cualquier momento desde &quot;Mi cuenta&quot;, o escribiéndonos a{" "}
          <a href="mailto:julio@estudioborn.com.ar" className="text-violet underline">
            julio@estudioborn.com.ar
          </a>
          . Si eliminás tu cuenta, conservamos únicamente los registros de
          pagos y entradas ya emitidas por obligaciones legales/impositivas.
        </p>
      </Section>

      <Section title="7. Menores de edad">
        <p>
          La app no está dirigida a menores de 13 años. Algunos eventos
          listados pueden tener restricciones de edad propias, definidas por
          el organizador.
        </p>
      </Section>

      <Section title="8. Cambios a esta política">
        <p>
          Si actualizamos esta política, vamos a reflejar la fecha arriba de
          esta página. El uso continuado de la app implica la aceptación de
          los cambios.
        </p>
      </Section>

      <Section title="9. Contacto">
        <p>
          ¿Dudas sobre tus datos?{" "}
          <a href="mailto:julio@estudioborn.com.ar" className="text-violet underline">
            julio@estudioborn.com.ar
          </a>
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
