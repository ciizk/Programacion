<?php
// POST /api/citas/estado.php  ·  Cambia el estado de una cita (reglas por rol)
//   secretaria: cualquier estado · doctor: sus citas · paciente: cancelar la suya
// Campos: csrf_token, id_cita, estado
require_once __DIR__ . '/../_bootstrap.php';

exigeMetodo('POST');
$actor = actorApi();
exigeCsrf();

$idCita = (int) ($_POST['id_cita'] ?? 0);
$estado = limpiarEntrada($_POST['estado'] ?? '');

if ($idCita <= 0 || $estado === '') {
    jsonFail('Campos requeridos: id_cita, estado.', 400);
}

try {
    $cita = appointmentController()->cambiarEstado($actor, $idCita, $estado);
    jsonOk(['cita' => $cita]);
} catch (AppointmentException $e) {
    jsonFail($e->getMessage(), $e->status());
} catch (Throwable $e) {
    error_log('estado: ' . $e->getMessage());
    jsonFail('Error interno.', 500);
}
