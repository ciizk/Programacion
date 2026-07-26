<?php
// =====================================================================
// paciente/solicitar-cita.php  ·  Autoservicio de reserva de cita
// Elegir tratamiento + doctor + fecha -> ver huecos libres -> reservar.
// Usa los endpoints JSON: disponibilidad.php y solicitar.php.
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../includes/ui.php';

requiereRol(ROLE_PATIENT);
$actor = usuarioActual();

$doctores = $tratamientos = [];
$errorCarga = '';
try {
    $repo = new AppointmentRepository(obtenerConexion());
    $doctores     = $repo->doctoresActivos();
    $tratamientos = $repo->tratamientosActivos();
} catch (Throwable $e) {
    error_log('solicitar-cita: ' . $e->getMessage());
    $errorCarga = 'No se pudo cargar el formulario de reserva.';
}
$csrf     = generarTokenCsrf();
$apiBase  = PHP_URL . '/api/citas';
$hoy      = date('Y-m-d');

$panelRole = 'paciente'; $panelActive = 'solicitar'; $panelTitle = 'Solicitar cita';
require __DIR__ . '/../includes/panel-top.php';
?>

<?php if ($errorCarga): ?><div class="alert alert-error"><?= ee($errorCarga) ?></div><?php endif; ?>

<div id="okBox" class="alert alert-ok" style="display:none"></div>
<div id="errBox" class="alert alert-error" style="display:none"></div>

<div class="card" style="max-width:720px">
    <h2 style="margin-top:0"><i class="fa-solid fa-calendar-plus" style="color:var(--c-primary)"></i> Reserva tu cita</h2>
    <p class="text-muted">Elige el tratamiento, el doctor y el día. Te mostramos los huecos libres al instante.</p>

    <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="field">
            <label for="trat">Tratamiento</label>
            <select id="trat" class="input">
                <?php foreach ($tratamientos as $t): ?>
                    <option value="<?= (int) $t['id_tratamiento'] ?>"><?= ee($t['nombre']) ?> (<?= (int) $t['duracion_min'] ?> min)</option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="field">
            <label for="doc">Doctor/a</label>
            <select id="doc" class="input">
                <?php foreach ($doctores as $d): ?>
                    <option value="<?= (int) $d['id'] ?>"><?= ee($d['name']) ?><?= $d['especialidad'] ? ' · ' . ee($d['especialidad']) : '' ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <div class="grid" style="grid-template-columns:1fr auto;align-items:end">
        <div class="field">
            <label for="fecha">Día</label>
            <input type="date" id="fecha" class="input" min="<?= ee($hoy) ?>" value="<?= ee($hoy) ?>">
        </div>
        <div class="field">
            <button id="btnVer" class="btn btn-ghost"><i class="fa-solid fa-magnifying-glass"></i> Ver horarios</button>
        </div>
    </div>

    <div id="slotsWrap" style="display:none;margin-top:.5rem">
        <label class="text-muted" style="font-weight:600;font-size:.9rem">Huecos disponibles</label>
        <div id="slots" class="slots" style="margin-top:.5rem"></div>
        <div id="noSlots" class="empty" style="display:none;margin-top:.5rem"><i class="fa-regular fa-calendar-xmark"></i> No hay huecos ese día. Prueba otra fecha o doctor.</div>
    </div>

    <div class="field" style="margin-top:1rem">
        <label for="motivo">Motivo (opcional)</label>
        <input type="text" id="motivo" class="input" maxlength="255" placeholder="Ej.: revisión, dolor de muela…">
    </div>

    <button id="btnReservar" class="btn btn-primary" disabled><i class="fa-solid fa-check"></i> Confirmar cita</button>
</div>

<script>
(function () {
    const API   = '<?= $apiBase ?>';
    const CSRF  = '<?= $csrf ?>';
    let slotSel = null;

    const $ = (id) => document.getElementById(id);
    const slotsWrap = $('slotsWrap'), slots = $('slots'), noSlots = $('noSlots');
    const btnReservar = $('btnReservar'), okBox = $('okBox'), errBox = $('errBox');

    function showErr(m){ errBox.textContent = m; errBox.style.display='block'; okBox.style.display='none'; }
    function clearMsg(){ errBox.style.display='none'; okBox.style.display='none'; }

    $('btnVer').addEventListener('click', async function () {
        clearMsg(); slotSel = null; btnReservar.disabled = true;
        slots.innerHTML = ''; slotsWrap.style.display='block'; noSlots.style.display='none';
        const q = new URLSearchParams({ id_doctor: $('doc').value, fecha: $('fecha').value, id_tratamiento: $('trat').value });
        try {
            const r = await fetch(API + '/disponibilidad.php?' + q.toString(), { headers: { 'Accept':'application/json' } });
            const d = await r.json();
            if (!d.ok) { showErr(d.error || 'No se pudo consultar la disponibilidad.'); slotsWrap.style.display='none'; return; }
            if (!d.slots.length) { noSlots.style.display='block'; return; }
            d.slots.forEach(function (s) {
                const b = document.createElement('button');
                b.type='button'; b.className='slot'; b.textContent = s.hora_inicio;
                b.addEventListener('click', function () {
                    document.querySelectorAll('.slot.sel').forEach(x=>x.classList.remove('sel'));
                    b.classList.add('sel'); slotSel = s.hora_inicio; btnReservar.disabled = false;
                });
                slots.appendChild(b);
            });
        } catch (e) { showErr('Error de red al consultar horarios.'); slotsWrap.style.display='none'; }
    });

    btnReservar.addEventListener('click', async function () {
        if (!slotSel) return;
        clearMsg(); btnReservar.disabled = true;
        const body = new URLSearchParams({
            csrf_token: CSRF, id_doctor: $('doc').value, fecha: $('fecha').value,
            hora_inicio: slotSel, id_tratamiento: $('trat').value, motivo: $('motivo').value
        });
        try {
            const r = await fetch(API + '/solicitar.php', { method:'POST', body });
            const d = await r.json();
            if (!d.ok) { showErr(d.error || 'No se pudo reservar la cita.'); btnReservar.disabled = false; return; }
            okBox.innerHTML = '✅ ¡Cita reservada! Redirigiendo a <b>Mis citas</b>…';
            okBox.style.display='block';
            setTimeout(()=>{ window.location.href = '<?= PHP_URL ?>/paciente/inicio.php'; }, 1400);
        } catch (e) { showErr('Error de red al reservar.'); btnReservar.disabled = false; }
    });
})();
</script>

<?php require __DIR__ . '/../includes/panel-bottom.php'; ?>
