# DEMO · Clínica Dental Raquel Virgüez (100% estática, sin servidor ni BD)

Versión **solo frontend** para presentar el producto sin montar nada: no necesita
PHP, ni MySQL, ni conexión a internet (salvo los iconos, que se cargan por CDN).
Todos los datos son de ejemplo y viven en el navegador (`assets/js/demo-data.js`).

## Cómo abrirla
1. Abre la carpeta `DEMO/`.
2. **Doble clic en `index.html`** (o arrástralo a tu navegador).

Eso es todo. No hay que instalar ni arrancar nada.

> Consejo: para una experiencia perfecta con rutas relativas, cualquier navegador
> moderno sirve. Si quisieras servirla igualmente, `python3 -m http.server` dentro
> de `DEMO/` también funciona, pero **no es necesario**.

## Qué se puede ver y probar
| Página | Qué muestra |
|---|---|
| `index.html` | Web informativa: servicios, **Casos Antes/Después**, equipo, **Agente IA (próx.)**, contacto (Acarigua) |
| `pedir-cita.html` | **Reservar cita como invitado** (sin cuenta), con asistente de 3 pasos |
| `login.html` | Acceso demo: elige rol (Paciente / Doctor / Secretaría) |
| `paciente.html` | Panel del paciente: citas, historial y ficha médica |
| `doctor.html` | Agenda del doctor: confirmar · completar (con notas) · no asistió |
| `secretaria.html` | Agenda global: confirmar/cancelar + alta de paciente |

Las acciones (confirmar, completar, cancelar, alta, reservar) **funcionan en memoria**
y muestran avisos (*toasts*). Al recargar, todo vuelve al estado inicial.

## Estructura
```
DEMO/
├── index.html · login.html · pedir-cita.html
├── paciente.html · doctor.html · secretaria.html
├── assets/css/  tokens.css · design-system.css · landing.css · panel.css · booking.css
└── assets/js/   demo-data.js · ui.js · booking.js
```
- **`tokens.css`** — única fuente de estilo (colores, espaciado, tipografía, sombras…).
  Cambia una variable y se actualiza toda la UI.
- **`demo-data.js`** — todos los datos de ejemplo en un solo sitio.

## Mejoras incluidas en esta demo
1. Carpeta `DEMO/` estática, sin servidor ni base de datos.
2. **Cita como invitado** (sin registro) para agilizar a pacientes nuevos.
3. Dirección actualizada: **C.C. Plaza Real, Acarigua, Venezuela**.
4. **UX / wayfinding**: barra de progreso, *breadcrumbs*, *stepper* de reserva,
   bandas de contexto por panel, nav con sección activa y conmutador de rol.
5. Secciones nuevas: **Pacientes (Antes y después)** y **Agente IA (próximamente)**.
6. **CSS optimizado con variables** (design tokens).

---

## Cómo encaja la "cita de invitado" en la base de datos (para cuando volvamos al backend)

La idea: permitir reservar **sin cuenta**, pero sin ensuciar el modelo de pacientes.

### Opción recomendada — `appointments` con paciente opcional + datos de invitado
Hacer `id_patient` **nullable** y añadir campos de contacto del invitado:

```sql
ALTER TABLE appointments
    MODIFY id_patient INT NULL,                         -- ya no obligatorio
    ADD guest_name    VARCHAR(120) NULL,
    ADD guest_phone   VARCHAR(30)  NULL,
    ADD guest_email   VARCHAR(160) NULL,
    ADD source     ENUM('web_guest','web_account','phone','walk_in') NOT NULL DEFAULT 'web_account',
    ADD manage_token CHAR(32) NULL,                     -- gestionar/cancelar sin login
    ADD CONSTRAINT chk_appt_owner CHECK (id_patient IS NOT NULL OR guest_phone IS NOT NULL);
```

Flujo:
1. El invitado reserva → se crea la cita con `source='web_guest'`, estado **`solicitada`**
   y sus datos en `guest_*` (sin tocar `usuarios`).
2. Secretaría (o el futuro **Agente IA**) la **confirma**. En ese momento se puede:
   - **De-duplicar** por `guest_phone` / `guest_email` contra pacientes existentes y enlazar, o
   - Crear un paciente "ligero" (lead) e informar `id_patient`.
3. Se envía un **enlace mágico** (`manage_token`) por WhatsApp/email para que el
   invitado gestione o cancele su cita, y opcionalmente **cree cuenta** (reclamando
   sus citas anteriores por teléfono/email).

### Alternativa — tabla `booking_requests` (bandeja de solicitudes)
Separar la "solicitud" de la "cita" confirmada:

```sql
CREATE TABLE booking_requests (
    id_request   INT AUTO_INCREMENT PRIMARY KEY,
    guest_name   VARCHAR(120) NOT NULL,
    guest_phone  VARCHAR(30)  NOT NULL,
    guest_email  VARCHAR(160) NULL,
    id_treatment INT NULL,
    id_doctor    INT NULL,              -- NULL = cualquiera
    preferred_at DATETIME NOT NULL,
    notes        VARCHAR(255) NULL,
    status       ENUM('pending','confirmed','rejected') DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Recepción revisa la bandeja y, al confirmar, inserta la fila real en `appointments`.
Más limpio para auditoría; requiere un paso de conversión.

### Recomendación
Para el MVP, la **Opción 1** (paciente opcional en `appointments`) es la más simple:
una sola tabla, estado `solicitada`, y el invitado se convierte en paciente solo si
hace falta. La bandeja `booking_requests` encaja mejor cuando haya mucho volumen o el
**Agente IA** deba triar y agendar automáticamente.
