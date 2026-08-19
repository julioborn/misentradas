# Prompt para Claude Code — Mis Entradas

Pegá este prompt completo en Claude Code dentro de tu proyecto en VS Code.

- **Nombre de la app:** Mis Entradas
- **Repositorio GitHub:** https://github.com/julioborn/misentradas.git

---

## PROMPT

Quiero que me ayudes a construir una app móvil llamada **Mis Entradas** de venta de entradas para eventos y fiestas. El repositorio de GitHub es https://github.com/julioborn/misentradas.git La app se publicará en Google Play Store y Apple App Store. Te voy a explicar todo el proyecto en detalle para que puedas ayudarme a construirlo paso a paso.

---

## STACK TECNOLÓGICO

- **Framework:** Next.js 14 con App Router y TypeScript
- **Mobile wrapper:** Capacitor (para convertir la web app en app nativa para Android e iOS)
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **Pagos:** MercadoPago Marketplace API
- **Notificaciones push:** Firebase Cloud Messaging (FCM)
- **Generación de QR:** librería `qrcode` (server-side)
- **Escaneo de QR:** librería `html5-qrcode` o `@zxing/browser` (client-side)
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React

---

## DESCRIPCIÓN DEL PROYECTO

Es una plataforma de ticketing (venta de entradas) que funciona como marketplace entre compradores y organizadores de eventos. Hay dos tipos de usuarios: compradores y organizadores.

---

## TIPOS DE USUARIO

### Comprador
- Se registra e inicia sesión
- Busca y compra entradas de eventos disponibles
- Puede pagar con MercadoPago o solicitar pago en efectivo
- Recibe un QR único en la app al instante tras confirmar el pago
- Muestra el QR en la puerta del evento para ingresar

### Organizador
- Se registra e inicia sesión
- Conecta su cuenta de MercadoPago a la plataforma mediante OAuth
- Crea y gestiona sus eventos (nombre, descripción, fecha, lugar, precio, stock de entradas, imagen)
- Ve en tiempo real cuántas entradas se vendieron
- Genera entradas manuales para compradores que pagan en efectivo
- Confirma pagos en efectivo de clientes que lo solicitaron desde la app
- Usa el modo escáner de QR en la puerta del evento para validar ingresos

---

## MODELO DE NEGOCIO — MERCADOPAGO MARKETPLACE

La integración con MercadoPago funciona como Marketplace (split de pagos):

1. El organizador conecta su cuenta de MP mediante OAuth desde la app
2. Cuando un comprador paga una entrada, MP divide el dinero automáticamente:
   - La mayor parte va a la cuenta del organizador al instante
   - Un porcentaje (comisión de la plataforma, ej: 5%) va a la cuenta del dueño de la app
3. No hay transferencias manuales, todo es automático

Para el pago en efectivo, no hay cobro de comisión de plataforma ya que no pasa por MP.

---

## FLUJOS PRINCIPALES

### Flujo 1 — Compra con MercadoPago
1. Cliente elige evento → selecciona cantidad de entradas → elige "Pagar con MercadoPago"
2. Se abre el checkout de MP dentro de la app
3. MP confirma el pago y ejecuta el split automático
4. El sistema genera un QR único para la entrada (hash UUID almacenado en DB)
5. El QR aparece al instante en la sección "Mis entradas" del cliente
6. Se envía notificación push de confirmación

### Flujo 2 — Solicitud de pago en efectivo (desde el cliente)
1. Cliente elige evento → selecciona "Pagar en efectivo"
2. La entrada queda en estado "pending_cash"
3. El organizador recibe notificación push: "Nuevo pedido de entrada en efectivo"
4. El cliente paga en mano al organizador
5. El organizador abre la app → va a "Pedidos pendientes" → toca "Confirmar pago"
6. Se genera el QR automáticamente y el cliente recibe notificación push con su entrada

### Flujo 3 — Generación manual de entrada (desde el organizador)
1. El organizador va a su panel → "Generar entrada manual"
2. Puede ingresar nombre del comprador (opcional)
3. Confirma → la app genera el QR al instante
4. El organizador puede compartir el QR por WhatsApp o email

### Flujo 4 — Validación de ingreso al evento (escáner)
1. El organizador abre el "Modo Escáner" en la app
2. La cámara se activa y escanea el QR del asistente
3. La app hace una llamada a la API para validar el QR
4. La API verifica en la DB si el QR existe, pertenece al evento correcto y no fue usado
5. Respuesta visual inmediata:
   - ✅ Verde — "Entrada válida, bienvenido"
   - ❌ Rojo — "Entrada inválida o ya utilizada"
6. Si es válido, el QR se marca como "used" en la DB para que no se pueda reutilizar

---

## MODELO DE DATOS (Supabase / PostgreSQL)

### Tabla: profiles
```sql
id uuid references auth.users primary key,
nombre text,
email text unique,
rol text check (rol in ('buyer', 'organizer')),
mp_access_token text,         -- token OAuth de MP del organizador
mp_user_id text,              -- ID de cuenta MP del organizador
avatar_url text,
created_at timestamptz default now()
```

### Tabla: events
```sql
id uuid primary key default gen_random_uuid(),
organizer_id uuid references profiles(id),
nombre text not null,
descripcion text,
fecha timestamptz not null,
lugar text,
precio numeric(10,2) not null,
stock_total int not null,
stock_disponible int not null,
imagen_url text,
activo boolean default true,
created_at timestamptz default now()
```

### Tabla: tickets
```sql
id uuid primary key default gen_random_uuid(),
event_id uuid references events(id),
buyer_id uuid references profiles(id),
qr_code text unique not null,    -- UUID único para el QR
estado text check (estado in ('pending_cash', 'confirmed', 'used', 'cancelled')),
metodo_pago text check (metodo_pago in ('mercadopago', 'efectivo', 'manual')),
mp_payment_id text,              -- ID del pago en MP
created_at timestamptz default now()
```

### Tabla: payments
```sql
id uuid primary key default gen_random_uuid(),
ticket_id uuid references tickets(id),
amount numeric(10,2),
platform_fee numeric(10,2),
organizer_amount numeric(10,2),
mp_payment_id text,
estado text check (estado in ('pending', 'approved', 'rejected')),
created_at timestamptz default now()
```

---

## PANTALLAS A DESARROLLAR

### App del Comprador
1. `/` — Home con listado de eventos disponibles (cards con imagen, nombre, fecha, precio)
2. `/events/[id]` — Detalle del evento con botón de compra
3. `/checkout/[eventId]` — Selección de método de pago y confirmación
4. `/tickets` — Mis entradas (lista de QRs)
5. `/tickets/[id]` — Detalle de entrada con QR grande para mostrar
6. `/auth/login` y `/auth/register` — Autenticación

### App del Organizador (sección `/organizer`)
1. `/organizer/dashboard` — Resumen: ventas totales, entradas vendidas, pendientes
2. `/organizer/events` — Mis eventos
3. `/organizer/events/new` — Crear nuevo evento
4. `/organizer/events/[id]` — Detalle del evento con lista de asistentes
5. `/organizer/events/[id]/scanner` — Modo escáner QR (usa cámara del dispositivo)
6. `/organizer/events/[id]/manual` — Generar entrada manual
7. `/organizer/pending` — Pedidos de efectivo pendientes de confirmación
8. `/organizer/connect-mp` — Conectar cuenta de MercadoPago (OAuth)

---

## API ROUTES A DESARROLLAR

```
POST /api/auth/register
POST /api/payments/create        → crear preferencia de pago en MP
POST /api/payments/webhook       → webhook de MP para confirmar pagos
POST /api/tickets/generate       → generar QR de entrada
GET  /api/tickets/validate/[qr]  → validar QR en tiempo real (para el escáner)
POST /api/tickets/use/[qr]       → marcar QR como usado
POST /api/tickets/confirm-cash   → organizador confirma pago en efectivo
POST /api/organizer/connect-mp   → guardar token OAuth de MP del organizador
GET  /api/events                 → listar eventos activos
POST /api/events                 → crear evento (solo organizadores)
```

---

## CONFIGURACIÓN INICIAL DEL PROYECTO

Por favor, arrancá creando la estructura del proyecto con estos pasos:

1. Inicializar proyecto Next.js 14 con TypeScript y App Router:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --src-dir
   ```

2. Instalar dependencias:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr mercadopago qrcode @types/qrcode html5-qrcode lucide-react
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/camera @capacitor/push-notifications
   ```

3. Crear archivo `.env.local` con las variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   MP_ACCESS_TOKEN=
   MP_CLIENT_ID=
   MP_CLIENT_SECRET=
   MP_PLATFORM_FEE_PERCENTAGE=5
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Crear el schema de Supabase con las tablas descritas arriba

5. Configurar Capacitor:
   ```bash
   npx cap init
   npx cap add android
   npx cap add ios
   ```

---

## PRIMER PASO A DESARROLLAR

Empezá por:
1. Crear la estructura de carpetas del proyecto
2. Configurar Supabase (cliente y tipos TypeScript)
3. Crear las páginas de autenticación (login y registro) con selección de rol (comprador u organizador)
4. Crear la página Home con listado de eventos de ejemplo

Usá componentes limpios, código TypeScript tipado, y diseño mobile-first con Tailwind CSS ya que la app está pensada para móvil.
