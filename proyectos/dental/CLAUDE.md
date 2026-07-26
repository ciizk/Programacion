# Reglas e Instrucciones del Proyecto: Dental SaaS MVP

## ⚠️ LEE PRIMERO
**`TRASPASO.md`** contiene el contexto completo del proyecto: estructura, roles,
modelo de datos, reglas de negocio, estado del front-end y plan del backend.
Léelo antes de empezar cualquier tarea.

## Objetivo
Software de Gestión para una Clínica Dental pequeña (Acarigua, Venezuela).
Nació refactorizando una aplicación educativa previa ("DOA/GTI").

**La carpeta `DEMO/` es la fuente de verdad del producto**: front-end completo,
estático (sin servidor ni BD), que define el alcance, la UX y las reglas de negocio.
El backend PHP en `src/php/` es anterior y cubre solo una parte.

## Arquitectura y Estilo Visual
- UI/UX: Diseño moderno, limpio (look clínico/tech con blancos, grises suaves y acentos azul/cyan), ágil y 100% responsive (Mobile First & Desktop).
- CSS: **CSS propio con design tokens** en `DEMO/assets/css/tokens.css`. No se usa Tailwind
  ni frameworks: todo color, espaciado y sombra sale de variables CSS. Incluye modo oscuro.
- Iconografía: **FontAwesome 6** (por CDN).

## Reglas de Refactorización
1. Nomenclatura: Student -> Patient, Teacher -> Doctor, Course/Class -> Appointment, Admin -> Secretary.
2. Mantener las respuestas enfocadas únicamente en los archivos que se están modificando.
3. No incluir pasarelas de pago reales ni inventarios complejos. Marcar lo no esencial como "Próximamente".
4. Idioma: **código e identificadores en inglés, UI/UX en español**.

## Reglas críticas del producto
5. **Permisos por rol**: un paciente solo accede a SUS datos; el doctor no ve finanzas;
   la dirección (Raquel) lo ve todo. Al pasar al backend, esto debe aplicarse **en el servidor**,
   no solo en la interfaz. Detalle en `TRASPASO.md` §4.
6. **Plazos**: cancelar hasta 2 h antes, reprogramar hasta 24 h antes.
7. Al completar una cita, el **coste y el método de pago son obligatorios** (alimentan finanzas).
8. Los **ajustes de clínica** (horarios, franja, días, festivos) gobiernan los huecos disponibles.

## Trabajo en la DEMO
- Verifica siempre en el navegador; el JS se valida con `node --check DEMO/assets/js/*.js`.
- ⚠️ El navegador cachea CSS/JS con fuerza: si algo "no funciona", comprueba antes el fichero
  servido (`curl`) y recarga con `Cmd/Ctrl + Shift + R`.
- La fecha "hoy" de la demo es `DEMO.today = '2026-07-24'`, no la fecha real.
