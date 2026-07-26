<?php
// GET /api/citas/agenda.php  ·  Agenda según el rol del actor
//   secretaria -> todas (filtros: fecha, estado, id_doctor)
//   doctor     -> su agenda (filtros: desde, hasta)
//   paciente   -> sus citas (filtro: ambito=futuras|historial|todas)
require_once __DIR__ . '/../_bootstrap.php';

exigeMetodo('GET');
$actor = actorApi();

$filtros = [
    'fecha'     => limpiarEntrada($_GET['fecha']  ?? '') ?: null,
    'estado'    => limpiarEntrada($_GET['estado'] ?? '') ?: null,
    'id_doctor' => isset($_GET['id_doctor']) && $_GET['id_doctor'] !== '' ? (int) $_GET['id_doctor'] : null,
    'desde'     => limpiarEntrada($_GET['desde']  ?? '') ?: null,
    'hasta'     => limpiarEntrada($_GET['hasta']  ?? '') ?: null,
    'ambito'    => limpiarEntrada($_GET['ambito'] ?? '') ?: 'todas',
];

try {
    $citas = appointmentController()->agenda($actor, $filtros);
    jsonOk(['role' => $actor['role'], 'citas' => $citas, 'total' => count($citas)]);
} catch (AppointmentException $e) {
    jsonFail($e->getMessage(), $e->status());
} catch (Throwable $e) {
    error_log('agenda: ' . $e->getMessage());
    jsonFail('Error interno.', 500);
}
