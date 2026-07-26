## Estructura

```
db/
├── schema/   (Clínica Dental · nombres lowercase snake_case, sin acentos)
│   ├── 001_core.sql            (5) roles, usuarios, archivos, remember_tokens, recuperacion_contrasena
│   ├── 002_clinic.sql          (7) patient_profiles, doctor_profiles, secretary_profiles, salas, treatments, doctor_schedules, appointments
│   ├── 003_communication.sql   (7) anuncios, anuncio_destinatarios, anuncio_lecturas, mensajes, eventos_calendario, faq, contacto_clinica
│   └── 004_views.sql               vistas vw_* (solo lectura)
├── seeds/
│   └── seed_demo_data.sql          datos demo idempotentes (pass demo: clinica123)
├── docs/
│   ├── db_notes.md                 decisiones de diseño y notas
│   └── treatments_catalog.md       ideas de catálogo de tratamientos (Coming soon)
└── README.md
```

## Orden de importación en phpMyAdmin

1. `schema/001_core.sql`
2. `schema/002_clinic.sql`
3. `schema/003_communication.sql`
4. `schema/004_views.sql`
5. `seeds/seed_demo_data.sql`

## Reglas

- Motor **InnoDB**, charset **utf8mb4_unicode_ci**.
- Todas las tablas usan `CREATE TABLE IF NOT EXISTS`.
- El seed es **idempotente** (`INSERT ... ON DUPLICATE KEY UPDATE`): re-importar no duplica.
- Las contraseñas se guardan **hasheadas** (bcrypt). Contraseña demo: `clinica123`.
- Importación **en fresco** para la demo (un solo login unificado en `usuarios`).
