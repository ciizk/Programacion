<?php
// =====================================================================
// paciente/inicio.php  ·  Panel del PACIENTE
// Próximas citas, historial y perfil médico. Solo lectura + acceso a reserva.
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../includes/ui.php';

requiereRol(ROLE_PATIENT);
$actor = usuarioActual();

$errorCarga = '';
$futuras = $historial = [];
$perfil = null;
try {
    $pdo  = obtenerConexion();
    $repo = new AppointmentRepository($pdo);
    $ctrl = new AppointmentController($repo);
    $futuras   = $ctrl->misCitas($actor, 'futuras');
    $historial = $ctrl->misCitas($actor, 'historial');
    $perfil    = $repo->perfilPaciente((int) $actor['id_usuario']);
} catch (Throwable $e) {
    error_log('paciente/inicio: ' . $e->getMessage());
    $errorCarga = 'No se pudieron cargar tus datos en este momento.';
}

$panelRole = 'paciente'; $panelActive = 'inicio'; $panelTitle = 'Inicio';
require __DIR__ . '/../includes/panel-top.php';
?>

<?php if ($errorCarga): ?><div class="alert alert-error"><?= ee($errorCarga) ?></div><?php endif; ?>

<div class="stats-row">
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-calendar-check"></i> Próximas citas</div><div class="v"><?= count($futuras) ?></div></div>
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-clock-rotate-left"></i> Visitas en historial</div><div class="v"><?= count($historial) ?></div></div>
    <div class="stat-tile" style="display:flex;flex-direction:column;justify-content:center">
        <a class="btn btn-primary btn-block" href="<?= PHP_URL ?>/paciente/solicitar-cita.php"><i class="fa-solid fa-calendar-plus"></i> Solicitar cita</a>
    </div>
</div>

<section class="panel-section">
    <h2><i class="fa-solid fa-calendar-check"></i> Próximas citas</h2>
    <?php if ($futuras): ?>
        <div class="table-wrap"><table class="appts">
            <thead><tr><th>Fecha y hora</th><th>Doctor/a</th><th>Tratamiento</th><th>Estado</th></tr></thead>
            <tbody>
            <?php foreach ($futuras as $c): ?>
                <tr>
                    <td class="when"><b><?= ee(fmtFecha($c['fecha'])) ?></b><span><?= ee(fmtHora($c['hora_inicio'])) ?> – <?= ee(fmtHora($c['hora_fin'])) ?></span></td>
                    <td><?= ee($c['doctor_nombre']) ?><br><span class="text-muted" style="font-size:.82rem"><?= ee($c['doctor_especialidad']) ?></span></td>
                    <td><?= ee($c['tratamiento_nombre'] ?: $c['motivo'] ?: '—') ?></td>
                    <td><?= badgeEstado($c['estado']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php else: ?>
        <div class="empty"><i class="fa-regular fa-calendar"></i> No tienes citas próximas. <a href="<?= PHP_URL ?>/paciente/solicitar-cita.php">Solicita una cita</a>.</div>
    <?php endif; ?>
</section>

<section class="panel-section" id="historial">
    <h2><i class="fa-solid fa-notes-medical"></i> Mi historial</h2>
    <?php if ($historial): ?>
        <div class="table-wrap"><table class="appts">
            <thead><tr><th>Fecha</th><th>Doctor/a</th><th>Tratamiento</th><th>Estado</th><th>Notas del doctor</th></tr></thead>
            <tbody>
            <?php foreach ($historial as $c): ?>
                <tr>
                    <td class="when"><b><?= ee(fmtFecha($c['fecha'])) ?></b><span><?= ee(fmtHora($c['hora_inicio'])) ?></span></td>
                    <td><?= ee($c['doctor_nombre']) ?></td>
                    <td><?= ee($c['tratamiento_nombre'] ?: $c['motivo'] ?: '—') ?></td>
                    <td><?= badgeEstado($c['estado']) ?></td>
                    <td class="text-muted" style="max-width:280px"><?= ee($c['notas_clinicas'] ?: '—') ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php else: ?>
        <div class="empty"><i class="fa-regular fa-folder-open"></i> Aún no hay visitas en tu historial.</div>
    <?php endif; ?>
</section>

<section class="panel-section">
    <h2><i class="fa-solid fa-heart-pulse"></i> Mi ficha médica</h2>
    <?php if ($perfil): ?>
        <div class="card">
            <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Grupo sanguíneo</div><div><?= ee($perfil['grupo_sanguineo']) ?></div></div>
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Alergias</div><div><?= ee($perfil['alergias'] ?: 'Ninguna registrada') ?></div></div>
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Enfermedades crónicas</div><div><?= ee($perfil['enfermedades_cronicas'] ?: 'Ninguna') ?></div></div>
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Medicación actual</div><div><?= ee($perfil['medicacion_actual'] ?: 'Ninguna') ?></div></div>
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Contacto de emergencia</div><div><?= ee($perfil['contacto_emergencia'] ?: '—') ?></div></div>
                <div><div class="k text-muted" style="font-size:.8rem;font-weight:600">Seguro</div><div><?= ee($perfil['seguro_medico'] ?: '—') ?></div></div>
            </div>
            <p class="text-muted" style="margin:1rem 0 0;font-size:.85rem"><i class="fa-solid fa-lock"></i> Edición de la ficha médica — <strong>próximamente</strong>.</p>
        </div>
    <?php else: ?>
        <div class="empty">Tu ficha médica aún no está completa.</div>
    <?php endif; ?>
</section>

<?php require __DIR__ . '/../includes/panel-bottom.php'; ?>
