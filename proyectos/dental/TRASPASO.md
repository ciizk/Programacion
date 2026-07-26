# TRASPASO · Clínica Dental Raquel Virgüez

> Documento de contexto completo del proyecto. **Léelo entero antes de tocar nada.**
> Escrito al cerrar la fase de front-end, justo antes de empezar el backend.

---

## 1 · Qué es este proyecto

SaaS de gestión para una **clínica dental pequeña** en Acarigua (Venezuela).
Nació refactorizando una aplicación educativa previa ("DOA/GTI") y hoy tiene **dos mitades**:

| Parte | Estado | Dónde |
|---|---|---|
| **DEMO estática** (front-end completo) | ✅ Terminada y verificada | `DEMO/` |
| **Backend PHP + MySQL** | ⚠️ Esqueleto funcional antiguo | `src/php/`, `db/`, `config/` |

**La DEMO es la fuente de verdad del producto.** Define el alcance, la UX y las reglas de negocio.
El backend PHP existente es anterior y **cubre solo una fracción** de lo que hace la DEMO.

---

## 2 · Estructura del repositorio

```
proyectos/dental/
├── CLAUDE.md              Reglas del proyecto (idioma, nomenclatura, estilo)
├── TRASPASO.md            ESTE fichero
├── README.md
├── index.php              Landing servida por PHP (versión antigua de DEMO/index.html)
├── config/
│   ├── app.php            BASE_URL, PHP_URL, ASSETS_URL, sesión, helpers de rol
│   ├── database.local.php → dbname: 'clinica_dental'  (usuario root, sin contraseña)
│   └── database.example.php
├── db/
│   ├── schema/            001_core · 002_clinic · 003_communication · 004_views
│   └── seeds/seed_demo_data.sql
├── src/php/               24 ficheros (ver §6)
├── storage/
├── docs/backend.md
└── DEMO/                  ⭐ EL PRODUCTO (front-end completo, sin servidor ni BD)
    ├── index.html         Web pública + sección Agente IA
    ├── login.html         Selector de rol (demo)
    ├── pedir-cita.html    Reserva invitado/cuenta con stepper
    ├── paciente.html · doctor.html · secretaria.html · raquel.html
    ├── 404.html
    ├── assets/css/  (12)  tokens · design-system · ux · panel · landing · booking
    │                      calendar · odontograma · reports · finance · clinic · assistant
    └── assets/js/   (10)  demo-data · ui · ux · clinic · calendar · odontograma
                           reports · wa · assistant · booking
```

### Cómo arrancar la DEMO
Doble clic en `DEMO/index.html` (funciona en `file://`, sin servidor).
Para desarrollo con recarga fiable:
```bash
cd DEMO && python3 -m http.server 8100
```
> ⚠️ El navegador **cachea CSS/JS agresivamente**. Usa siempre recarga forzada
> (`Cmd/Ctrl + Shift + R`). Durante el desarrollo esto causó decenas de falsos
> negativos: si algo "no funciona", comprueba primero el fichero servido con `curl`.

---

## 3 · Los 4 roles y qué hace cada uno

| Rol | Página | Vistas del menú |
|---|---|---|
| **Paciente** (Lucía Torres Marí) | `paciente.html` | Inicio · Mi historia · Mi ficha · Mis archivos |
| **Doctor/a** (Dra. Laura Beltrán) | `doctor.html` | Mi agenda · Calendario · Pacientes · Historial |
| **Secretaría** (Marta) | `secretaria.html` | Agenda · Calendario · Lista de espera · Pacientes · Planes · Presupuestos · Solicitudes · Alta · Doctores |
| **Dirección** (Dra. Raquel Virgüez, dueña) | `raquel.html` | Resumen · Finanzas · Mi agenda · Calendario · Ajustes · Equipo |

**Navegación por vistas**: el sidebar NO hace scroll a anclas — muestra **una sección cada vez**
(`UX.goView()` en `ux.js`). Cada enlace del menú lleva `data-title`, `data-desc`, `data-icon`,
`data-short`, que alimentan el `<h1>`, las migas, la descripción contextual y la barra inferior móvil.

---

## 4 · Reglas de negocio implementadas (⚠️ replicar en el backend)

### Permisos por rol — **crítico**
- **Paciente**: SOLO sus datos. El asistente IA y la búsqueda ⌘K están **bloqueados** para
  facturación, agenda interna y fichas de otros pacientes (ver `INTENTS[].roles` en `assistant.js`
  y `buildIndex()` en `ux.js`).
- **Doctor**: su agenda y sus pacientes. **No** ve finanzas.
- **Secretaría**: operativa completa, **sin** finanzas detalladas.
- **Dirección (Raquel)**: control total.
- **Calendario**: un doctor ve solo su columna (`soloDoctor` en `calendar.js`); secretaría y
  dirección ven a todos con filtro.

> 🔒 Hoy es una barrera de **interfaz**: todos los datos están en el JS del cliente.
> **En el backend los permisos DEBEN aplicarse en el servidor**: la API nunca debe
> enviar al paciente datos que no sean suyos.

### Citas
- **Cancelar**: hasta **2 h** antes. **Reprogramar**: hasta **24 h** antes (`DEMO.rules`).
  Fuera de plazo los botones se deshabilitan con explicación.
- **Solapamientos** (`Clinic.conflictos`): bloquea si coincide **mismo doctor** o **mismo paciente**
  a la misma hora; avisa (sin bloquear) si el paciente ya tiene otra cita ese día.
- **Duplicados** (`Clinic.buscarSimilares`): al teclear nombre/teléfono propone fichas existentes
  (coincidencia por teléfono = 100, nombre exacto = 95, nombre parcial ≥ 40).
- **Estados**: `programada · confirmada · completada · cancelada · no_asistio`.
- **Completar cita exige coste + método de pago** (tarjeta/efectivo) → alimenta finanzas.
- Tras completar, se propone la **siguiente cita** según tratamiento:
  ortodoncia 1 mes · implante 3 · limpieza/empaste/revisión 6 · blanqueamiento 12.
- **Origen** de la cita: `web_guest · web_account · telefono · presencial · seguimiento`.

### Ajustes de clínica (`DEMO.settings`) — gobiernan los huecos
`maniana{desde,hasta}` · `tarde{desde,hasta}` · `franjaMin` · `dias[]` (1=lun…6=sáb) ·
`festivos[]` · `avisoHoras`. Editables desde Dirección → Ajustes.
`Clinic.slotsLibres(fecha, semilla)` los respeta: festivo o día no laborable → **0 huecos**.

### Otras reglas
- **Odontograma**: por diente completo (`'corona'`, `'ausente'`) o **por caras**
  `{m,d,o,v,l}` = mesial, distal, oclusal, vestibular, lingual.
- **Auditoría**: todo cambio de paciente/cita se registra (quién, qué, cuándo) →
  `Clinic.registrarCambio()`, `localStorage['dc_audit']`.
- **Alergias**: al generar receta, `reports.js` detecta conflictos (penicilinas, AINE, metamizol)
  y propone alternativa segura en un clic.

---

## 5 · Modelo de datos (DEMO → tablas propuestas)

Todo vive en `DEMO/assets/js/demo-data.js` (`window.DEMO`). Mapeo sugerido:

| Objeto DEMO | Tabla propuesta | Notas |
|---|---|---|
| `clinic`, `settings`, `rules` | `clinic_settings` | fila única o clave/valor |
| `treatments[]` | `treatments` | id, name, category, icon, min, precio, desc |
| `doctors[]` | `users` (role=doctor) + `doctor_profiles` | colegiado, especialidad, `owner` |
| `patientsList[]` | `users` (role=patient) + `patient_profiles` | email, dni, nacimiento, alta, tel |
| `patientsList[].ficha` | `patient_profiles` | grupo, alergias, cronicas, medicacion, emergencia, seguro |
| `patientsList[].odonto` | `odontogram_entries` | patient_id, tooth (FDI), surface (m/d/o/v/l, NULL=todo), state |
| `secretary.upcoming`, `doctor.pending`, `raquel.pending` | `appointments` | **una sola tabla**; hoy están separadas por rol |
| `doctor.history`, `patient.history` | `appointments` (estados terminales) | + `notas_clinicas` |
| `finances[]` | `payments` | appointment_id, fecha, importe, metodo(tarjeta/efectivo) |
| `plans[]` | `treatment_plans` + `plan_sessions` | total, pagado; sesión: n, trat, fecha, estado |
| `budgets[]` | `budgets` + `budget_lines` | estado: pendiente/aceptado/rechazado, dto |
| `waitlist[]` | `waitlist` | prioridad alta/media/baja, preferencia, nota |
| `changeRequests[]` | `record_change_requests` | el doctor propone, secretaría autoriza |
| `patient.files[]` | `patient_files` | fotos de progreso, PDF |
| (localStorage) `dc_audit` | `audit_log` | quien, sobre, cambios[], fecha |
| (localStorage) `dc_notas` | `patient_notes` | notas rápidas de recepción |
| (localStorage) `dc_fotos` | `patient_photos` o campo en `patient_profiles` | avatar |

**Cita como invitado** (importante): `appointments.id_patient` debe ser **NULL-able**, con
`guest_name/guest_phone/guest_email`, `source` y `manage_token` (enlace mágico para gestionar
sin login). Detalle completo en `DEMO/README.md`.

---

## 6 · Backend PHP existente (punto de partida)

`config/database.local.php` → BD **`clinica_dental`** (creada e importada; root sin contraseña).
Contraseña demo de todos los usuarios: **`clinica123`**.

```
src/php/
├── api/_bootstrap.php            JSON + CSRF + control de rol
├── api/citas/                    agenda · completar · disponibilidad · estado · solicitar
├── api/pacientes/crear.php
├── auth/login.php · logout.php   AuthService, sesión $_SESSION['user']
├── bbdd/conexion.php             PDO desde config/
├── bbdd/helpers.php              usuarioActual(), requiereRol(), CSRF
├── bbdd/repositories/            AppointmentRepository · UsuarioRepository
├── bbdd/services/AuthService.php
├── bbdd/validador.php
├── controllers/AppointmentController.php
├── includes/                     panel-top · panel-bottom · ui (helpers de vista)
└── paciente/ · doctor/ · secretaria/   páginas server-side (versión antigua)
```

**Lo que ya funciona**: login por rol, listar/crear/confirmar/completar citas, disponibilidad,
alta de paciente. **Lo que NO existe**: planes, presupuestos, lista de espera, auditoría,
odontograma, ajustes, WhatsApp, documentos, finanzas.

Convenciones ya establecidas: **código e identificadores en inglés, UI en español**,
`Student→Patient`, `Teacher→Doctor`, `Class→Appointment`, `Admin→Secretary`.

---

## 7 · Estado del front-end (todo verificado en navegador)

✅ Web pública · reserva invitado/cuenta (autorrellena con sesión) · 4 paneles por rol ·
calendario semana/día con permisos · odontograma 4 vistas + caras · ficha 360° del paciente ·
recetas/informes/presupuestos/justificantes imprimibles con detección de alergias ·
finanzas con comparativa de meses y export CSV · planes multi-sesión · lista de espera ·
gestión y corrección de pacientes con auditoría · WhatsApp con respuesta simulada ·
asistente IA por reglas con permisos y memoria conversacional · modo oscuro · ⌘K ·
validación en vivo · vista móvil en tarjetas · 404 y estados vacíos.

### ⚠️ Lo único importante que falta en el front
**Persistencia.** Al recargar se pierde casi todo. Ya hay islas guardadas en `localStorage`
(`dc_waitlist`, `dc_audit`, `dc_notas`, `dc_fotos`, `dc_change_requests`, `dc_theme`, `dc_user`,
`dc_tour_*`, `dc_folio`), pero **citas, estados y cobros no persisten**.
→ Se resuelve de raíz con el backend; no merece la pena hacerlo en `localStorage`.

### Pendientes menores (ganan más con servidor)
Estado "en sala de espera" · historial de comunicaciones · atajos de teclado (`N`, `/`) ·
papelera de 30 días · consentimientos informados · pagos a plazos.

---

## 8 · Plan sugerido para el backend

1. **Esquema**: ampliar `db/schema/` con las tablas de §5 (planes, presupuestos, lista de espera,
   auditoría, odontograma por caras, ajustes, pagos, archivos). Nuevas migraciones `005_…`, `006_…`.
2. **Unificar `appointments`**: hoy la DEMO tiene tres listas separadas por rol; en BD es
   **una tabla** filtrada por `doctor_id`.
3. **API REST/JSON** siguiendo el patrón de `src/php/api/`: un endpoint por recurso, respuesta
   `{ok:true, data}` / `{ok:false, error}`, CSRF y `requiereRol()` en **todos**.
4. **Middleware de permisos** replicando §4 — es el punto más delicado.
5. **Sustituir `demo-data.js`** por llamadas `fetch` a la API, manteniendo la misma forma de
   los objetos para no tocar la UI. *(Este es el atajo clave: la UI ya está hecha y probada.)*
6. Integraciones reales: **WhatsApp Business API** (recordatorios + respuesta que confirma sola)
   y, si se quiere, **API de Claude** sustituyendo el motor de reglas del asistente
   (manteniendo las mismas "habilidades": agendar, resumir, redactar notas).

---

## 9 · Cómo continuar en una conversación nueva

Pega esto como primer mensaje:

> Voy a continuar el proyecto de la clínica dental. Lee `proyectos/dental/TRASPASO.md`
> y `proyectos/dental/CLAUDE.md` para el contexto completo. La DEMO en `DEMO/` es la
> fuente de verdad del producto. Quiero empezar el **backend**: [tu objetivo concreto].

Con eso el asistente reconstruye todo el contexto leyendo dos ficheros.

---

## 10 · Detalles que ahorran tiempo

- **Fecha "hoy" de la demo**: `DEMO.today = '2026-07-24'` (viernes). Todos los cálculos
  (plazos, huecos, KPIs) parten de ahí — no de la fecha real.
- **Moneda**: `DEMO.currency = '$'`, formato es-VE (`fmtMoney` en `ui.js`).
- **Iconos**: FontAwesome por CDN → **sin internet la demo pierde los iconos**.
  Conviene copiarlos en local antes de enseñarla en la clínica.
- **Datos demo**: 5 pacientes, 4 doctores (Raquel es la dueña), 6 tratamientos con precio,
  24 movimientos de caja (feb–jul 2026), 3 planes, 2 presupuestos, 3 en lista de espera.
- **Verificación**: `node --check` sobre `DEMO/assets/js/*.js` valida la sintaxis de todo el JS.
