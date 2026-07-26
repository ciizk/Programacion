<?php
// GET /api/citas/disponibilidad.php?id_doctor=3&fecha=2026-07-28&id_tratamiento=1
// Huecos libres de un doctor en una fecha. Cualquier usuario autenticado
// (el paciente lo usa para el autoservicio de reserva).
require_once __DIR__ . '/../_bootstrap.php';

exigeMetodo('GET');
$actor = actorApi();

$idDoctor      = (int) ($_GET['id_doctor'] ?? 0);
$fecha         = limpiarEntrada($_GET['fecha'] ?? '');
$idTratamiento = isset($_GET['id_tratamiento']) && $_GET['id_tratamiento'] !== ''
    ? (int) $_GET['id_tratamiento'] : null;

if ($idDoctor <= 0 || $fecha === '') {
    jsonFail('Parámetros requeridos: id_doctor, fecha (YYYY-MM-DD).', 400);
}

try {
    $slots = appointmentController()->disponibilidad($idDoctor, $fecha, $idTratamiento);
    jsonOk(['id_doctor' => $idDoctor, 'fecha' => $fecha, 'slots' => $slots, 'total' => count($slots)]);
} catch (AppointmentException $e) {
    jsonFail($e->getMessage(), $e->status());
} catch (Throwable $e) {
    error_log('disponibilidad: ' . $e->getMessage());
    jsonFail('Error interno.', 500);
}
