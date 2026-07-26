# Notas de base de datos — Clínica Dental

> Documento de trabajo local. No contiene datos reales de producción.

## 1. Entorno

- Local: **XAMPP** (MariaDB 10.4).
- Despliegue final: **Plesk**.

## 2. Credenciales demo (solo local / pruebas)

- Contraseña de todos los usuarios demo: **`clinica123`** (guardada como hash bcrypt).
- Roles y usuarios demo (`usuarios`):
  - Secretaría: `recepcion@clinica-dental.es`, `admin@clinica-dental.es`
  - Doctores: `l.beltran@…`, `s.montesinos@…`, `n.sanchis@…`
  - Pacientes: `lucia.torres@…`, `hugo.escriva@…`, `elena.ciscar@…`, `andres.molina@…`, `carmen.ruiz@…`

## 3. Modelo (dominio dental)

- **Login único**: una sola tabla `usuarios` (fusiona las antiguas `gti_usuarios`
  + `doa_usuarios`) para toda la plataforma, de la web informativa a la gestión.
  El rol decide el panel de destino.
- **Roles** (`roles.nombre_rol`): `paciente` · `doctor` · `secretaria`.
- **Personas con Class-Table Inheritance**: `usuarios` es la columna vertebral
  (identidad + auth); `patient_profiles` / `doctor_profiles` / `secretary_profiles`
  la extienden 1:1 con los datos propios del rol. Las vistas `vw_*_profiles`
  exponen la entidad completa (id/name/dni/telefono/email vienen de `usuarios`).
- **Citas** = tabla central `appointments` (sustituye a la antigua `matriculas`):
  paciente + doctor + tratamiento + sala + fecha/hora + estado + coste + `notas_clinicas`.
  - Ciclo de estado: `programada → confirmada → completada`, con `cancelada` / `no_asistio`.
  - `origen` registra quién la pidió (`secretaria` | `paciente` | `doctor`).
- **Agenda / disponibilidad**: `doctor_schedules` (franjas semanales por doctor).
  Los huecos libres = franjas − citas ocupadas (lo calcula el backend).
- **Tratamientos**: `treatments` (catálogo mínimo; **precio Coming soon**,
  `precio` NULL). `duracion_min` alimenta el cálculo de huecos. Ver
  [`treatments_catalog.md`](treatments_catalog.md).
- **Comunicación reutilizada**: `anuncios`, `mensajes` (pueden referirse a una
  cita), `eventos_calendario` (las citas alimentan el calendario), `faq`,
  `contacto_clinica` (antes `contacto_secretaria`).
- **Archivos**: `archivos` = tabla central de ficheros (gancho para expedientes,
  radiografías, fotos y recetas de la visión a futuro).
- **Recordatorios**: `usuarios.notificaciones_whatsapp` / `notificaciones_email`
  como gancho para recordatorios/seguimiento (visión: WhatsApp).

## 4. Mapping login (BD → sesión)

| Sesión (`$_SESSION['user']`) | Columna BD |
|---|---|
| `id_usuario` | `usuarios.id_usuario` |
| `dni`        | `usuarios.dni` |
| `name`       | `usuarios.nombre` |
| `surname`    | `usuarios.apellidos` |
| `email`      | `usuarios.email` |
| `role`       | `roles.nombre_rol` (`paciente` / `doctor` / `secretaria`) |

## 5. Reglas de negocio (citas)

- **SECRETARY**: gestión total de citas (crear/editar/reasignar/cancelar) y alta
  de pacientes.
- **DOCTOR**: lectura de su **agenda propia**; edición de `notas_clinicas` y cierre
  de la cita (`estado = completada`).
- **PATIENT**: solo lectura de sus **citas futuras** e **historial**; puede
  **solicitar** cita eligiendo tratamiento, doctor y un **hueco libre** (autoservicio),
  sin contactar con doctor/secretaría.
- **No solape**: el backend valida que una cita no pise otra del mismo doctor
  (índice `idx_appt_doctor_fecha`). Las franjas válidas salen de `doctor_schedules`.

## 6. Retirado respecto al esquema anterior (optimización)

- **Módulo académico** (educativo, inservible para la clínica): `asignaturas`,
  `asignatura_profesor`, `matriculas`, `cursos_grupos`, `grados`, `departamentos`,
  `guia_docente`, `recursos`, `tareas`, `tarea_archivos`, `entregas`, `examenes`,
  `examen_preguntas`, `examen_intentos`, `examen_respuestas`, `calificaciones`.
- **Tienda GTI** (venta del SaaS, no aplica): `gti_usuarios`, `productos`,
  `compras`, `pagos_simulados`. El portal pasa a ser **solo informativo**.
- Los **pagos** de la clínica se abordarán como módulo propio (Coming soon).

## 7. SELECTs de verificación post-import

```sql
-- Conteo por rol
SELECT r.nombre_rol, COUNT(*) FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol GROUP BY r.nombre_rol;

-- Agenda central
SELECT id_cita, fecha, hora_inicio, estado, paciente_nombre, doctor_nombre, tratamiento_nombre
FROM vw_appointments ORDER BY fecha, hora_inicio;

-- Citas futuras de un paciente (id 8)
SELECT id_cita, fecha, estado, doctor_nombre FROM vw_appointments
WHERE id_paciente = 8 AND fecha >= CURDATE() AND estado IN ('programada','confirmada');

-- Franjas de un doctor un día (para calcular disponibilidad)
SELECT hora_inicio, hora_fin FROM doctor_schedules WHERE id_doctor = 5 AND dia_semana = 2 AND activo = 1;
```
