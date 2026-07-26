<?php
// =====================================================================
// api/_bootstrap.php  ·  Base común de los endpoints JSON de la clínica
// Sesión + helpers + guardas que responden JSON (no redirigen).
// =====================================================================

require_once __DIR__ . '/../../../config/app.php';          // sesión + constantes
require_once __DIR__ . '/../bbdd/helpers.php';               // roles + CSRF + sesión
require_once __DIR__ . '/../controllers/AppointmentController.php';

/** Devuelve JSON y termina. */
function jsonOut($data, int $status = 200): void
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Error JSON uniforme. */
function jsonFail(string $mensaje, int $status = 400): void
{
    jsonOut(['ok' => false, 'error' => $mensaje], $status);
}

/** Éxito JSON uniforme. */
function jsonOk(array $extra = []): void
{
    jsonOut(array_merge(['ok' => true], $extra), 200);
}

/** Exige método HTTP concreto o 405. */
function exigeMetodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $metodo) {
        jsonFail('Método no permitido.', 405);
    }
}

/** Exige sesión iniciada; devuelve el usuario o 401. */
function actorApi(): array
{
    $u = usuarioActual();
    if ($u === null) {
        jsonFail('No autenticado.', 401);
    }
    return $u;
}

/** Exige un rol concreto (o lista) para el actor; 403 si no. */
function exigeRolApi(array $actor, $roles): void
{
    $lista = is_array($roles) ? $roles : [$roles];
    if (!in_array($actor['role'] ?? '', $lista, true)) {
        jsonFail('No autorizado para esta acción.', 403);
    }
}

/** Exige POST con token CSRF válido; 419 si no. */
function exigeCsrf(): void
{
    if (!csrfPostValido()) {
        jsonFail('Token CSRF inválido o método incorrecto.', 419);
    }
}

/** Instancia el controller de citas ya cableado. */
function appointmentController(): AppointmentController
{
    return new AppointmentController(new AppointmentRepository(obtenerConexion()));
}
