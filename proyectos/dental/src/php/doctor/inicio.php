<?php
// =====================================================================
// doctor/inicio.php  ·  Panel del DOCTOR
// Agenda propia; confirmar/marcar no asistió; COMPLETAR cita + notas clínicas.
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../includes/ui.php';

requiereRol(ROLE_DOCTOR);
$actor = usuarioActual();
$hoy   = date('Y-m-d');

$errorCarga = '';
$agenda = [];
try {
    $repo = new AppointmentRepository(obtenerConexion());
    $agenda = $repo->listarPorDoctor((int) $actor['id_usuario']);
} catch (Throwable $e) {
    error_log('doctor/inicio: ' . $e->getMessage());
    $errorCarga = 'No se pudo cargar tu agenda.';
}

// Actuables (hoy/futuras y no terminales) vs. resto (historial).
$actuables = array_values(array_filter($agenda, fn($c) => $c['fecha'] >= $hoy && in_array($c['estado'], ['programada','confirmada'], true)));
$restantes = array_values(array_filter($agenda, fn($c) => !($c['fecha'] >= $hoy && in_array($c['estado'], ['programada','confirmada'], true))));
usort($restantes, fn($a,$b) => strcmp($b['fecha'].$b['hora_inicio'], $a['fecha'].$a['hora_inicio']));

$nHoy        = count(array_filter($agenda, fn($c) => $c['fecha'] === $hoy));
$nCompletadas = count(array_filter($agenda, fn($c) => $c['estado'] === 'completada'));
$csrf    = generarTokenCsrf();
$apiBase = PHP_URL . '/api/citas';

$panelRole = 'doctor'; $panelActive = 'inicio'; $panelTitle = 'Mi agenda';
require __DIR__ . '/../includes/panel-top.php';
?>

<?php if ($errorCarga): ?><div class="alert alert-error"><?= ee($errorCarga) ?></div><?php endif; ?>
<div id="okBox" class="alert alert-ok" style="display:none"></div>
<div id="errBox" class="alert alert-error" style="display:none"></div>

<div class="stats-row">
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-calendar-day"></i> Citas hoy</div><div class="v"><?= $nHoy ?></div></div>
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-hourglass-half"></i> Pendientes</div><div class="v"><?= count($actuables) ?></div></div>
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-circle-check"></i> Completadas</div><div class="v"><?= $nCompletadas ?></div></div>
</div>

<section class="panel-section">
    <h2><i class="fa-solid fa-list-check"></i> Próximas y pendientes</h2>
    <?php if ($actuables): ?>
        <div class="table-wrap"><table class="appts">
            <thead><tr><th>Fecha y hora</th><th>Paciente</th><th>Tratamiento</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
            <?php foreach ($actuables as $c): ?>
                <tr>
                    <td class="when"><b><?= ee(fmtFecha($c['fecha'])) ?></b><span><?= ee(fmtHora($c['hora_inicio'])) ?> – <?= ee(fmtHora($c['hora_fin'])) ?></span></td>
                    <td><?= ee($c['paciente_nombre']) ?><br><span class="text-muted" style="font-size:.82rem"><?= ee($c['paciente_telefono']) ?></span></td>
                    <td><?= ee($c['tratamiento_nombre'] ?: $c['motivo'] ?: '—') ?></td>
                    <td><?= badgeEstado($c['estado']) ?></td>
                    <td>
                        <div class="flex" style="gap:.4rem;flex-wrap:wrap">
                            <?php if ($c['estado'] === 'programada'): ?>
                                <button class="btn btn-ghost btn-sm" onclick="cambiarEstado(<?= (int)$c['id_cita'] ?>,'confirmada')"><i class="fa-solid fa-check"></i> Confirmar</button>
                            <?php endif; ?>
                            <button class="btn btn-primary btn-sm" onclick="abrirCompletar(<?= (int)$c['id_cita'] ?>, '<?= ee(addslashes($c['paciente_nombre'])) ?>')"><i class="fa-solid fa-notes-medical"></i> Completar</button>
                            <button class="btn btn-ghost btn-sm" onclick="cambiarEstado(<?= (int)$c['id_cita'] ?>,'no_asistio')">No asistió</button>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php else: ?>
        <div class="empty"><i class="fa-regular fa-calendar-check"></i> No tienes citas pendientes.</div>
    <?php endif; ?>
</section>

<section class="panel-section">
    <h2><i class="fa-solid fa-clock-rotate-left"></i> Historial</h2>
    <?php if ($restantes): ?>
        <div class="table-wrap"><table class="appts">
            <thead><tr><th>Fecha</th><th>Paciente</th><th>Tratamiento</th><th>Estado</th><th>Notas</th></tr></thead>
            <tbody>
            <?php foreach ($restantes as $c): ?>
                <tr>
                    <td class="when"><b><?= ee(fmtFecha($c['fecha'])) ?></b><span><?= ee(fmtHora($c['hora_inicio'])) ?></span></td>
                    <td><?= ee($c['paciente_nombre']) ?></td>
                    <td><?= ee($c['tratamiento_nombre'] ?: $c['motivo'] ?: '—') ?></td>
                    <td><?= badgeEstado($c['estado']) ?></td>
                    <td class="text-muted" style="max-width:260px"><?= ee($c['notas_clinicas'] ?: '—') ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php else: ?>
        <div class="empty">Sin historial todavía.</div>
    <?php endif; ?>
</section>

<!-- Modal completar -->
<div class="modal-back" id="modal">
    <div class="modal">
        <h3><i class="fa-solid fa-notes-medical" style="color:var(--c-primary)"></i> Completar cita</h3>
        <p class="text-muted" id="modalPaciente" style="margin-top:-.4rem"></p>
        <div class="field">
            <label for="notas">Notas clínicas <span style="color:var(--c-danger)">*</span></label>
            <textarea id="notas" class="input" placeholder="Diagnóstico, procedimiento realizado, indicaciones…"></textarea>
        </div>
        <div class="field">
            <label for="coste">Coste (€, opcional)</label>
            <input type="number" id="coste" class="input" min="0" step="0.01" placeholder="Ej.: 45.00">
        </div>
        <div class="flex justify-between" style="margin-top:.5rem">
            <button class="btn btn-ghost" onclick="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnGuardar"><i class="fa-solid fa-check"></i> Marcar completada</button>
        </div>
    </div>
</div>

<script>
(function () {
    const API = '<?= $apiBase ?>', CSRF = '<?= $csrf ?>';
    const modal = document.getElementById('modal');
    const okBox = document.getElementById('okBox'), errBox = document.getElementById('errBox');
    let citaId = null;

    function msg(box, t){ box.innerHTML = t; box.style.display='block'; }
    function clearMsg(){ okBox.style.display='none'; errBox.style.display='none'; }

    window.abrirCompletar = function (id, paciente) {
        citaId = id;
        document.getElementById('modalPaciente').textContent = 'Paciente: ' + paciente;
        document.getElementById('notas').value = '';
        document.getElementById('coste').value = '';
        modal.classList.add('open');
    };
    window.cerrarModal = function () { modal.classList.remove('open'); };

    document.getElementById('btnGuardar').addEventListener('click', async function () {
        clearMsg();
        const notas = document.getElementById('notas').value.trim();
        if (!notas) { msg(errBox, 'Las notas clínicas son obligatorias.'); return; }
        const body = new URLSearchParams({ csrf_token: CSRF, id_cita: citaId, notas_clinicas: notas, coste: document.getElementById('coste').value });
        try {
            const r = await fetch(API + '/completar.php', { method:'POST', body });
            const d = await r.json();
            if (!d.ok) { msg(errBox, d.error || 'No se pudo completar la cita.'); return; }
            cerrarModal(); msg(okBox, '✅ Cita completada.'); setTimeout(()=>location.reload(), 900);
        } catch (e) { msg(errBox, 'Error de red.'); }
    });

    window.cambiarEstado = async function (id, estado) {
        clearMsg();
        const body = new URLSearchParams({ csrf_token: CSRF, id_cita: id, estado: estado });
        try {
            const r = await fetch(API + '/estado.php', { method:'POST', body });
            const d = await r.json();
            if (!d.ok) { msg(errBox, d.error || 'No se pudo actualizar.'); return; }
            location.reload();
        } catch (e) { msg(errBox, 'Error de red.'); }
    };

    modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
})();
</script>

<?php require __DIR__ . '/../includes/panel-bottom.php'; ?>
