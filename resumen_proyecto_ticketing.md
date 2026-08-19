# Mis Entradas — Resumen del Proyecto

- **Nombre de la app:** Mis Entradas
- **Repositorio GitHub:** https://github.com/julioborn/misentradas.git

## Idea General

App móvil (Android e iOS) para la venta de entradas a eventos y fiestas, con generación de QR único por entrada y validación en la puerta del evento. Funciona como marketplace entre compradores y organizadores de eventos.

---

## Stack Tecnológico

- **Frontend / App:** Next.js + Capacitor (para publicar en Google Play y App Store)
- **Backend:** Next.js API Routes
- **Base de datos:** Supabase (PostgreSQL)
- **Pagos:** MercadoPago (Marketplace)
- **Notificaciones push:** Firebase Cloud Messaging (FCM)
- **QR:** Generación server-side con librería qrcode

---

## Modelo de Negocio

- El organizador conecta su cuenta de MercadoPago a la plataforma
- Cuando un comprador paga una entrada, MercadoPago divide el dinero automáticamente:
  - El organizador recibe su parte al instante en su cuenta de MP
  - La plataforma retiene una comisión (porcentaje definido por el dueño de la app, ej: 5-7%)
- Para entradas en efectivo no hay comisión para la plataforma

---

## Tipos de Usuario

### 1. Comprador (cliente)
- Se registra en la app
- Busca y compra entradas
- Recibe QR en la app al instante tras confirmar el pago
- Puede pagar con MercadoPago o solicitar pago en efectivo

### 2. Organizador (admin del evento)
- Se registra y conecta su cuenta de MercadoPago
- Crea y gestiona eventos
- Ve ventas en tiempo real
- Genera entradas manuales para pagos en efectivo
- Usa el escáner de QR en la puerta del evento
- Recibe notificaciones de pedidos en efectivo pendientes

---

## Flujos Principales

### Flujo de compra con MercadoPago
1. Cliente elige evento y cantidad de entradas
2. Elige método de pago: MercadoPago
3. Checkout de MP se abre dentro de la app
4. MP confirma el pago y divide el dinero automáticamente
5. El sistema genera el QR único de la entrada
6. El QR aparece en la app del cliente al instante
7. Se envía notificación push de confirmación

### Flujo de compra en efectivo (solicitada por el cliente)
1. Cliente elige evento y elige "Pagar en efectivo"
2. Su entrada queda en estado "Pendiente"
3. El organizador recibe notificación de pedido en efectivo
4. El cliente paga en mano al organizador
5. El organizador confirma el pago desde su app
6. Se genera el QR y el cliente recibe notificación con su entrada lista

### Flujo de generación manual (desde el organizador)
1. El organizador va a "Generar entrada manual"
2. Ingresa nombre o datos del comprador (opcional)
3. Marca como pagado en efectivo
4. La app genera el QR automáticamente
5. El organizador comparte el QR al comprador (WhatsApp, email, etc.)

### Flujo de ingreso al evento (escáner)
1. El organizador (o su staff) abre el modo escáner en la app
2. Apunta la cámara al QR del asistente
3. El servidor valida en tiempo real si el QR es válido y no fue usado
4. Respuesta inmediata: Verde (válido) / Rojo (inválido o ya usado)
5. El QR queda marcado como "utilizado" en la base de datos

---

## Modelo de Datos (Tablas principales)

### users
- id, email, nombre, rol (buyer / organizer), mp_access_token, created_at

### events
- id, organizer_id, nombre, descripcion, fecha, lugar, precio, stock_total, stock_disponible, imagen, created_at

### tickets
- id, event_id, buyer_id, qr_code (único), estado (pending / confirmed / used), metodo_pago (mp / efectivo), mp_payment_id, created_at

### payments
- id, ticket_id, amount, platform_fee, organizer_amount, mp_payment_id, estado, created_at

---

## Integración con MercadoPago

- **Tipo:** Marketplace (Split de pagos)
- **Flujo OAuth:** El organizador conecta su cuenta de MP desde la app con un clic
- **Split automático:** MP divide el pago entre la cuenta del organizador y la cuenta de la plataforma
- **Programa de Partners:** Aplicar al programa de Desarrolladores Autónomos de MP una vez que la app tenga volumen de transacciones
- **Comisión de MP sobre cada transacción:** ~4-6% + IVA (varía según el medio de pago)
- **Comisión de la plataforma:** Definida por el dueño (ej: 5%)

---

## Pantallas de la App

### App del Comprador
1. Onboarding / Registro / Login
2. Home — listado de eventos disponibles
3. Detalle del evento
4. Checkout — selección de método de pago
5. Mis entradas — listado con QRs
6. Detalle de entrada — QR grande para mostrar en la puerta
7. Perfil

### App del Organizador
1. Dashboard — resumen de ventas del evento activo
2. Crear / Editar evento
3. Mis eventos
4. Lista de asistentes / ventas
5. Generar entrada manual
6. Modo escáner QR
7. Conectar MercadoPago
8. Perfil

---

## Costos para Lanzar

| Concepto | Costo |
|---|---|
| Google Play Store (única vez) | $25 USD |
| Apple App Store (anual) | $99 USD/año |
| API de MercadoPago | Gratis |
| Supabase (plan inicial) | Gratis |
| Total para arrancar | ~$124 USD |

---

## Roadmap sugerido

1. **MVP:** Registro, creación de eventos, compra con MP, QR y escáner
2. **V2:** Pago en efectivo, notificaciones push, dashboard de ventas
3. **V3:** Programa de Partners de MP, múltiples tipos de entrada por evento, descuentos
