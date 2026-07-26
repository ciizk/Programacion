# Backend — Clínica Dental (Fase 1)

Estado del backend tras la refactorización de dominio (educación → clínica dental).
Capa de datos + backend. El **rediseño del front-end es la Fase 2**.

## Arquitectura

```
config/app.php            arranca sesión + constantes (BASE_URL, PHP_URL…)
src/php/
├── auth/
│   ├── login.php         LOGIN ÚNICO (web informativa → gestión), enruta por rol
│   └── logout.php
├── bbdd/
│   ├── conexion.php      PDO (env DOA_DB_* | config/database.local.php)
│   ├── helpers.php       sesión + ROLES + guardas (requiereRol…) + CSRF
│   ├── services/
│   │   └── AuthService.php        autenticar(email,pass) → datos de sesión
│   └── repositories/
│       ├── UsuarioRepository.php      usuarios (+ alta de pacientes)
│       └── AppointmentRepository.php  citas, agenda, disponibilidad, estados
├── controllers/
│   └── AppointmentController.php  lógica + REGLAS DE ROL (sustituye cursos/clases)
├── api/
│   ├── _bootstrap.php    guardas JSON (401/403/405/419) + helpers
│   ├── citas/
│   │   ├── agenda.php          GET  · agenda según rol
│   │   ├── disponibilidad.php  GET  · huecos libres de un doctor
│   │   ├── solicitar.php       POST · PACIENTE solicita cita (autoservicio)
│   │   ├── completar.php       POST · DOCTOR cierra cita (COMPLETED + notas)
│   │   └── estado.php          POST · cambio de estado (reglas por rol)
│   └── pacientes/
│       └── crear.php           POST · alta de paciente (SECRETARY)
├── includes/            layout de panel compartido (panel-top/bottom, ui.php)
├── paciente/            panel paciente (inicio, solicitar-cita)
├── doctor/              panel doctor  (agenda + completar con notas)
└── secretaria/          panel secretaría (agenda global + alta paciente)

index.php                web informativa (landing)
src/assets/css/clinica/  design-system.css + landing.css + panel.css
```

## Autenticación (login único)

- Una sola tabla `usuarios`; el rol (`paciente`/`doctor`/`secretaria`) decide el panel.
- Sesión en `$_SESSION['user']` = `{id_usuario,name,surname,email,dni,role}`.
- `session_regenerate_id(true)` al iniciar sesión; CSRF en todos los POST.
- Contraseña demo (todos): **`clinica123`**.

## Middlewares de rol

| Función (helpers.php) | Uso |
|---|---|
| `requiereLogin()` | páginas: exige sesión (redirige a login) |
| `requiereRol($roles)` | páginas: exige rol (redirige por rol) |
| `redirigirPorRol($rol)` | envía a `/paciente\|doctor\|secretaria/inicio.php` |
| `actorApi()` (api) | endpoints: 401 JSON si no hay sesión |
| `exigeRolApi($actor,$roles)` | endpoints: 403 JSON |
| `exigeCsrf()` | endpoints POST: 419 JSON si token inválido |

Reglas de negocio (en `AppointmentController`):

- **SECRETARY**: gestión total de citas (crear/estado/agenda completa) + alta de pacientes.
- **DOCTOR**: lee **su** agenda; edita `notas_clinicas` y **completa** sus citas.
- **PATIENT**: lee sus citas futuras/historial; **solicita** cita eligiendo hueco libre;
  puede **cancelar** su propia cita.

## API de citas

Todas responden JSON `{ok:true,...}` o `{ok:false,error}`; POST requieren `csrf_token`.

### `GET /src/php/api/citas/disponibilidad.php`
`?id_doctor=5&fecha=2026-07-28&id_tratamiento=1` →
```json
{"ok":true,"id_doctor":5,"fecha":"2026-07-28","total":23,
 "slots":[{"hora_inicio":"09:20","hora_fin":"09:40"}, ...]}
```
Huecos = franjas de `doctor_schedules` − citas ocupadas − pasado. Duración según el tratamiento.

### `GET /src/php/api/citas/agenda.php`
Según rol: secretaría (todas, filtros `fecha|estado|id_doctor`), doctor (`desde|hasta`),
paciente (`ambito=futuras|historial|todas`).

### `POST /src/php/api/citas/solicitar.php`  (PATIENT)
`csrf_token,id_doctor,fecha,hora_inicio,id_tratamiento?,id_sala?,motivo?` → crea cita
`origen=paciente`. Valida solape (409) y que no sea pasado (400).

### `POST /src/php/api/citas/completar.php`  (DOCTOR)  ← endpoint solicitado
`csrf_token,id_cita,notas_clinicas,coste?` → `estado=completada` + notas.
Valida propiedad (403), notas no vacías (400), no terminal (409).

### `POST /src/php/api/citas/estado.php`
`csrf_token,id_cita,estado` → secretaría cualquiera; doctor sus citas; paciente solo cancela la suya.

## Verificado

- **Datos**: import de `001..004` + seed idempotente en MariaDB 10.4 (XAMPP). ✔
- **Controller/Repos**: 20/20 aserciones (auth, disponibilidad, solape, autorización por rol,
  completar+notas, transiciones de estado, agenda por rol). ✔
- **HTTP**: 401 sin sesión; login real (CSRF)→302; agenda autenticada devuelve solo lo permitido. ✔

## Limpieza de legacy — HECHA

Tras completar la Fase 2 se eliminó el código educativo/tienda inservible:
`src/php/doa/*` (89 páginas), `src/php/gti/*` (8), 19 repositorios académicos/tienda/
comunicación, `GtiAuthService`, `ArchivoService` y el CSS/JS educativo. Sólo se
conservan los repos vivos (`UsuarioRepository`, `AppointmentRepository`) y
`AuthService`. Las tablas del esquema permanecen; los módulos futuros (abajo)
tendrán sus propios repos limpios cuando se construyan.

## Pendiente (ComingSoon · siguientes fases)

- Catálogo público de tratamientos con **precios** (ver `db/docs/treatments_catalog.md`).
- **Pagos** de la clínica (cobros por cita/presupuesto).
- Edición de la **ficha médica**; odontograma; expedientes con **archivos/fotos/recetas**
  (tabla `archivos` ya prevista).
- **Anuncios/mensajes** en los paneles (tablas listas; faltan repos+UI nuevos).
- Recordatorios por **email/WhatsApp** (flags `notificaciones_*` en `usuarios`).
- Panel de secretaría: crear cita en nombre del paciente; gestión de doctores.
