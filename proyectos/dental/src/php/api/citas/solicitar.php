<?php
// POST /api/citas/solicitar.php  ·  El PACIENTE solicita una cita (autoservicio)
// Campos: csrf_token, id_doctor, fecha, hora_inicio, id_tratamiento?, id_sala?, motivo?
require_once __DIR__ . '/../_bootstrap.php';

exigeMetodo('POST');
$actor = actorApi();
exigeRolApi($actor, ROLE_PATIENT);
exigeCsrf();

$datos = [
    'id_doctor'      => (int) ($_POST['id_doctor'] ?? 0),
    'fecha'          => limpiarEntrada($_POST['fecha'] ?? ''),
    'hora_inicio'    => limpiarEntrada($_POST['hora_inicio'] ?? ''),
    'id_tratamiento' => isset($_POST['id_tratamiento']) && $_POST['id_tratamiento'] !== '' ? (int) $_POST['id_tratamiento'] : null,
    'id_sala'        => isset($_POST['id_sala']) && $_POST['id_sala'] !== '' ? (int) $_POST['id_sala'] : null,
    'motivo'         => limpiarEntrada($_POST['motivo'] ?? '') ?: null,
];

try {
    $ctrl   = appointmentController();
    $idCita = $ctrl->solicitar($actor, $datos);
    jsonOk(['id_cita' => $idCita, 'cita' => $ctrl->detalle($actor, $idCita)]);
} catch (AppointmentException $e) {
    jsonFail($e->getMessage(), $e->status());
} catch (Throwable $e) {
    error_log('solicitar: ' . $e->getMessage());
    jsonFail('Error interno.', 500);
}
