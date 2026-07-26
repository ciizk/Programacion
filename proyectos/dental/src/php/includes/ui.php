<?php
// =====================================================================
// includes/ui.php  ·  Helpers de presentación para los paneles
// =====================================================================

if (!function_exists('ee')) {
    function ee(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
}

/* Nombre legible de un estado de cita. */
function nombreEstado(string $estado): string
{
    return [
        'programada' => 'Programada', 'confirmada' => 'Confirmada', 'completada' => 'Completada',
        'cancelada' => 'Cancelada', 'no_asistio' => 'No asistió',
    ][$estado] ?? $estado;
}

/* Badge HTML de estado de cita. */
function badgeEstado(string $estado): string
{
    return '<span class="badge badge-' . ee($estado) . '">' . ee(nombreEstado($estado)) . '</span>';
}

/* 2026-07-24 -> 24/07/2026 */
function fmtFecha(string $fecha): string
{
    $t = DateTime::createFromFormat('!Y-m-d', $fecha);
    return $t ? $t->format('d/m/Y') : $fecha;
}

/* 09:00:00 -> 09:00 */
function fmtHora(?string $h): string { return $h ? substr($h, 0, 5) : '—'; }

/* Importe -> "65,00 €" o "—" */
function fmtEuro($v): string { return ($v === null || $v === '') ? '—' : number_format((float) $v, 2, ',', '.') . ' €'; }
