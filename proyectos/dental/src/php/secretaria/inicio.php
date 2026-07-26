<?php
// =====================================================================
// secretaria/inicio.php  ·  Panel de SECRETARÍA
// Gestión total de la agenda (confirmar/cancelar) + alta de pacientes.
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../includes/ui.php';

requiereRol(ROLE_SECRETARY);
$actor = usuarioActual();
$hoy   = date('Y-m-d');

$errorCarga = ''; $agenda = []; $nPacientes = 0;
try {
    $pdo  = obtenerConexion();
    $repo = new AppointmentRepository($pdo);
    $agenda = $repo->listar();
    $nPacientes = (int) $pdo->query("SELECT COUNT(*) FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE r.nombre_rol='paciente'")->fetchColumn();
} catch (Throwable $e) {
    error_log('secretaria/inicio: ' . $e->getMessage());
    $errorCarga = 'No se pudo cargar la agenda.';
}

$proximas = array_values(array_filter($agenda, fn($c) => $c['fecha'] >= $hoy && !in_array($c['estado'], ['cancelada','completada'], true)));
$nHoy = count(array_filter($agenda, fn($c) => $c['fecha'] === $hoy));
$csrf    = generarTokenCsrf();
$apiBase = PHP_URL . '/api';

$panelRole = 'secretaria'; $panelActive = 'inicio'; $panelTitle = 'Agenda de la clínica';
require __DIR__ . '/../includes/panel-top.php';
?>

<?php if ($errorCarga): ?><div class="alert alert-error"><?= ee($errorCarga) ?></div><?php endif; ?>
<div id="okBox" class="alert alert-ok" style="display:none"></div>
<div id="errBox" class="alert alert-error" style="display:none"></div>

<div class="stats-row">
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-calendar-day"></i> Citas hoy</div><div class="v"><?= $nHoy ?></div></div>
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-calendar-check"></i> Próximas</div><div class="v"><?= count($proximas) ?></div></div>
    <div class="stat-tile"><div class="k"><i class="fa-solid fa-users"></i> Pacientes</div><div class="v"><?= $nPacientes ?></div></div>
</div>

<section class="panel-section">
    <h2><i class="fa-solid fa-calendar-days"></i> Próximas citas</h2>
    <?php if ($proximas): ?>
        <div class="table-wrap"><table class="appts">
            <thead><tr><th>Fecha y hora</th><th>Paciente</th><th>Doctor/a</th><th>Tratamiento</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
            <?php foreach ($proximas as $c): ?>
                <tr>
                    <td class="when"><b><?= ee(fmtFecha($c['fecha'])) ?></b><span><?= ee(fmtHora($c['hora_inicio'])) ?> – <?= ee(fmtHora($c['hora_fin'])) ?></span></td>
                    <td><?= ee($c['paciente_nombre']) ?><br><span class="text-muted" style="font-size:.82rem"><?= ee($c['paciente_telefono']) ?></span></td>
                    <td><?= ee($c['doctor_nombre']) ?></td>
                    <td><?= ee($c['tratamiento_nombre'] ?: $c['motivo'] ?: '—') ?></td>
                    <td><?= badgeEstado($c['estado']) ?></td>
                    <td>
                        <div class="flex" style="gap:.4rem;flex-wrap:wrap">
                            <?php if ($c['estado'] === 'programada'): ?>
                                <button class="btn btn-ghost btn-sm" onclick="setEstado(<?= (int)$c['id_cita'] ?>,'confirmada')"><i class="fa-solid fa-check"></i> Confirmar</button>
                            <?php endif; ?>
                            <button class="btn btn-ghost btn-sm" onclick="if(confirm('¿Cancelar esta cita?'))setEstado(<?= (int)$c['id_cita'] ?>,'cancelada')" style="color:var(--c-danger)">Cancelar</button>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php else: ?>
        <div class="empty"><i class="fa-regular fa-calendar"></i> No hay citas próximas.</div>
    <?php endif; ?>
</section>

<section class="panel-section" id="alta">
    <h2><i class="fa-solid fa-user-plus"></i> Alta de paciente</h2>
    <div class="card" style="max-width:640px">
        <div class="grid" style="grid-template-columns:1fr 1fr">
            <div class="field"><label>Nombre *</label><input id="p_nombre" class="input"></div>
            <div class="field"><label>Apellidos *</label><input id="p_apellidos" class="input"></div>
        </div>
        <div class="field"><label>Email *</label><input id="p_email" type="email" class="input"></div>
        <div class="grid" style="grid-template-columns:1fr 1fr">
            <div class="field"><label>DNI/NIE</label><input id="p_dni" class="input"></div>
            <div class="field"><label>Teléfono</label><input id="p_tel" class="input"></div>
        </div>
        <p class="text-muted" style="font-size:.84rem"><i class="fa-solid fa-circle-info"></i> Se creará con contraseña demo <b>clinica123</b> (en producción: invitación por email).</p>
        <button id="btnAlta" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Dar de alta</button>
    </div>
</section>

<script>
(function () {
    const API = '<?= $apiBase ?>', CSRF = '<?= $csrf ?>';
    const okBox = document.getElementById('okBox'), errBox = document.getElementById('errBox');
    function msg(box,t){ box.innerHTML=t; box.style.display='block'; window.scrollTo({top:0,behavior:'smooth'}); }
    function clear(){ okBox.style.display='none'; errBox.style.display='none'; }

    window.setEstado = async function (id, estado) {
        clear();
        const body = new URLSearchParams({ csrf_token: CSRF, id_cita: id, estado: estado });
        try {
            const r = await fetch(API + '/citas/estado.php', { method:'POST', body });
            const d = await r.json();
            if (!d.ok) { msg(errBox, d.error || 'No se pudo actualizar.'); return; }
            location.reload();
        } catch (e) { msg(errBox, 'Error de red.'); }
    };

    document.getElementById('btnAlta').addEventListener('click', async function () {
        clear();
        const body = new URLSearchParams({
            csrf_token: CSRF,
            nombre: document.getElementById('p_nombre').value,
            apellidos: document.getElementById('p_apellidos').value,
            email: document.getElementById('p_email').value,
            dni: document.getElementById('p_dni').value,
            telefono: document.getElementById('p_tel').value
        });
        try {
            const r = await fetch(API + '/pacientes/crear.php', { method:'POST', body });
            const d = await r.json();
            if (!d.ok) { msg(errBox, d.error || 'No se pudo dar de alta.'); return; }
            msg(okBox, '✅ Paciente dado de alta (id ' + d.id_usuario + ').');
            ['p_nombre','p_apellidos','p_email','p_dni','p_tel'].forEach(i=>document.getElementById(i).value='');
        } catch (e) { msg(errBox, 'Error de red.'); }
    });
})();
</script>

<?php require __DIR__ . '/../includes/panel-bottom.php'; ?>
