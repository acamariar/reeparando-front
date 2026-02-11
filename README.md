# CliniVision

App moderna con React + Vite + TypeScript, Tailwind y Zustand. API mock con `json-server`.

## Inicio rápido
1) Instala dependencias: `npm install`
2) Inicia la API mock: `npm run mock-api` (sirve `mock/db.json` en el puerto 3001)
3) Levanta el dev server: `npm run dev`

## Scripts
- `npm run dev` — inicia Vite
- `npm run preview` — sirve el build
- `npm run lint` — lint
-  node server.js  — arranca `json-server`

## Dependencias
Si necesitas instalarlas manualmente:
```bash
npm install axios zustand react-router-dom react-hook-form yup @hookform/resolvers lucide-react react-number-format

npm install -D @vitejs/plugin-react-swc typescript @types/react @types/react-dom @types/node 
  eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh 
  tailwindcss @tailwindcss/vite @types/yup json-server @types/react-number-format @types/react-router-dom





API Mock
Base: http://localhost:3002
Colecciones (mock/db.json):
/usuarios: credenciales y nivel de acceso (usuario, clave, nivel).
/proveedor: proveedores (nombre, teléfono, tipo).
/categorias: categorías de productos (gamas).
/productos: catálogo base (id, nombre, tipo).
/monturas, /lentes, /otros: detalle por productoId (precios, descuentos, stock) según tipo.
/pacientes: datos de pacientes (contacto, fecha de nacimiento, etc.).
/historial: historias/RX por patientId (rxFinal, nota/observación, diagnóstico).
/citas: citas médicas (paciente, fecha/hora, motivo, estado).
/ordenes: órdenes de trabajo (paciente, totales, items con productId/cantidad, estado, vendedor).
/laboratorios: laboratorios (contacto, dirección).
/entregas: registros de entrega/abonos sobre órdenes (saldo anterior/nuevo).
/bancos: bancos/cuentas (nombre, número, saldo).
/bancoTransacciones: transacciones bancarias (vacío en mock actual).
/cajas: aperturas/cierres de caja (hora apertura/cierre, montos, diferencias).
/enviosLaboratorio: envíos de órdenes a laboratorio (orderId, laboratorioId, costo, estado).
/gastos: gastos (fecha, concepto, categoría, monto, referencia opcional a factura).
/abonos: abonos a órdenes (orderId, abonoNuevo, saldoNuevo, vendedor, método).
/facturasVenta: facturas de venta (cliente/paciente, total, items).
/facturasCompra: facturas de compra (lentes) con costo, abono, saldo, estado.
/facturasCompraOtros: facturas de compra (monturas/otros) con monto, abono, saldo, estado.
/pagosFacturas: pagos a facturas de compra (facturaId, abono, saldoDespues, método, estado).
/movimientosStock: movimientos de stock (productId, ingreso/egreso, stockPrevio/Nuevo, motivo, usuarioId, fecha).
/configuracion: datos de la empresa nit, dirección, logo, nombre comercial(Hay que sumarle una imagen, que seria el logo de la empresa).

Endpoints típicos (json-server):

    Productos y detalle
      - GET    /productos
      - GET    /productos/:id
      - POST   /productos
      - PATCH  /productos/:id
      - DELETE /productos/:id
      - POST   /monturas | /lentes | /otros   (crear detalle con productId)
      - PATCH  /monturas/:id | /lentes/:id | /otros/:id
      - DELETE /monturas/:id | /lentes/:id | /otros/:id
      - GET    /categorias
      - GET    /proveedor

    Pacientes / Historia / Citas
      - GET    /pacientes
      - GET    /pacientes/:id
      - POST   /pacientes
      - PATCH  /pacientes/:id
      - DELETE /pacientes/:id
      - GET    /historial        (rxFinal, nota, diagnostico; filtrar patientId si se requiere)
      - GET    /citas            (filtrar patientId si se requiere)

    Órdenes / Entregas / Envios
      - GET    /ordenes
      - POST   /ordenes
      - PATCH  /ordenes/:id
      - DELETE /ordenes/:id
      - GET    /entregas
      - GET    /enviosLaboratorio

    Facturación
      - GET/POST/PATCH/DELETE /facturasVenta
      - GET/POST/PATCH/DELETE /facturasCompra         (lentes)
      - GET/POST/PATCH/DELETE /facturasCompraOtros    (monturas/otros)
      - GET/POST/PATCH/DELETE /pagosFacturas          (pagos de factura de compra)

    Gastos / Movimientos / Caja / Bancos
      - GET/POST/PATCH/DELETE /gastos
      - GET/POST/PATCH/DELETE /movimientosStock
      - GET/POST/PATCH/DELETE /cajas
      - GET/POST/PATCH/DELETE /bancos
      - GET/POST/PATCH/DELETE /bancoTransacciones

    Otros
      - GET    /laboratorios
      - GET    /usuarios?usuario=...&clave=... (búsqueda simple de login)
      - GET    /configuracion   (nit, dirección, logo, etc.)  


    Archivos clave

src/pages/Dashboard.tsx — KPIs de citas/ventas/órdenes/stock y recordatorios.
src/pages/Products.tsx — catálogo de productos, acceso a movimientos de stock.
src/pages/StockMovements.tsx — movimientos de stock con filtros y detalle lateral.
src/pages/OrderFormPage.tsx — creación/edición de órdenes de trabajo (descuentos, items, totales).
src/pages/InvoicesBuy.tsx — facturas de compra (lentes/monturas/otros) y pagos.
src/pages/InvoicePayments.tsx — pagos de facturas de compra y detalle de pago.
src/pages/PaymentSummary.tsx — resumen y filtros de pagos de factura.
src/pages/Billing.tsx — resumen de facturación/últimas facturas.
src/pages/Expenses.tsx — listado y creación de gastos.
src/pages/Patient.tsx — ficha de paciente.
src/pages/PatientReprint.tsx — reimpresión de historia/Rx, búsqueda por nombre/documento.
src/pages/PatientsTable.tsx — tabla/listado de pacientes.
src/pages/InvoicesSales.tsx — facturas de venta (si aplica).
src/pages/InvoicePayments.tsx — gestión de pagos a facturas.
src/pages/StockMovements.tsx — histórico de movimientos de inventario.
mock/db.json — datos de la API mock: productos, monturas, lentes, categorias, proveedor, usuarios, pacientes


Flujo de ramas
main — listo para producción 
maria — rama personal/base;


Notas
Levanta la API mock antes de probar la UI.
Actualiza src/axios/mainAxios.ts si cambia el host/puerto de la API.

# Mock y relaciones

- Pacientes / Historia
  - patients: id, nombre, cedula, telefono, direccion, fechaNacimiento…
  - records: patientId → paciente; incluye rxFinal (od/oi con esfera, cilindro, eje, adicion, dnp, avl, avc, lenteRecomendado, filtro), nota, diagnostico.
- Órdenes de trabajo
  - orders: pacienteId, totales, estado, items[] { productId, cantidad, monto… }
  - Crea movimientosStock (egreso) por item; usuarioId = vendedor.
- Productos
  - productos (base), monturas/lentes/otros (detalle con stock).
- Movimientos de stock
  - movimientosStock: productId, tipo (ingreso/egreso), stockPrevio/Nuevo, motivo, usuarioId, fecha.
- Facturación
  - facturasCompra (lentes), facturasCompraOtros (monturas/otros), pagosFacturas (estado de la factura y crea gasto).
- Gastos
  - gastos: concepto, categoria, metodoPago, monto, referencia (facturaId si viene de pago).
- Laboratorios / Config
  - laboratorios: id, nombre.
  - appConfig/config: nit, direccion, logoBase64.
- Relaciones clave: productId, patientId, facturaId, laboratorioId, usuarioId.

Paginación y búsqueda (contrato del backend)
Los endpoints de listado (ej. /pacientes, /productos, /facturasVenta, etc.) deben soportar:

_page (1-based)Opcional: número de página.
_limit (Opciona): tamaño de página.
q (opcional)l: texto libre para buscar en campos relevantes
Pacientes: nombre, cédula/documento, email.
Productos: nombre, código, categoría (o los que apliquen).

Ejemplo
GET /pacientes?_page=1&_limit=10&q=lopez
Respuesta esperada

200 OK
Body: array plano con los ítems de esa página.
Header: X-Total-Count = total de ítems que cumplen el filtro (sin paginar).
CORS: Access-Control-Expose-Headers: X-Total-Count

Orden por defecto en listados


**El backend debe devolver los listados ya ordenados de más reciente a más antiguo.**


           ***Instrucciones para hacer Build y desplegar en hosting estático***

1. Construir el proyecto  -> npm run build <-
Esto genera una carpeta dist/ con todos los archivos optimizados (HTML, CSS, JS).


2. Subir a tu hosting estático
Sube todo el contenido de la carpeta dist/ a la raíz de tu servidor web.


3. Antes de hacer build, actualiza la URL base:
const api = process.env.VITE_API_URL || "https://tu-hosting.com/api"; // cambiar localhost:3002 (es la que tengo actualmente)


📁 Estructura después del build
dist/
├── index.html
├── assets/
│   ├── index-XXXXX.js
│   └── index-XXXXX.css
└── img/
    └── logoOptica.png





