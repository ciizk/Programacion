<?php
// POST /api/citas/completar.php  ·  El DOCTOR cierra su cita
// Endpoint solicitado: estado -> COMPLETED ('completada') + notas_clinicas.
// Campos: csrf_token, id_cita, notas_clinicas, coste?
require_once __DIR__ . '/../_bootstrap.php';

exigeMetodo('POST');
$actor = actorApi();
exigeRolApi($actor, ROLE_DOCTOR);
exigeCsrf();

$idCita       = (int) ($_POST['id_cita'] ?? 0);
$notasClinics = (string) ($_POST['notas_clinicas'] ?? '');
$coste        = isset($_POST['coste']) && $_POST['coste'] !== '' ? (float) $_POST['coste'] : null;

if ($idCita <= 0) {
    jsonFail('Falta id_cita.', 400);
}

try {
    $cita = appointmentController()->completar($actor, $idCita, $notasClinics, $coste);
    jsonOk(['cita' => $cita]);
} catch (AppointmentException $e) {
    jsonFail($e->getMessage(), $e->status());
} catch (Throwable $e) {
    error_log('completar: ' . $e->getMessage());
    jsonFail('Error interno.', 500);
}
