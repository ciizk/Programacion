<?php
require_once __DIR__ . '/config/app.php';

$usuario     = usuarioActual();
$isLoggedIn  = $usuario !== null;
$panelUrl    = PHP_URL . '/' . ($usuario['role'] ?? '') . '/inicio.php';

// --- Datos para la web informativa (lectura pública; degrada si no hay BD) ---
$tratamientos = [];
$doctores     = [];
$contacto     = null;
try {
    $pdo = obtenerConexion();
    $tratamientos = $pdo->query('SELECT nombre, categoria, descripcion, duracion_min FROM vw_treatments_activos ORDER BY id_tratamiento LIMIT 6')->fetchAll();
    $doctores     = $pdo->query("SELECT name, especialidad, num_colegiado FROM vw_doctor_profiles WHERE activo = 1 ORDER BY id LIMIT 4")->fetchAll();
    $contacto     = $pdo->query('SELECT email, telefono, direccion, horario FROM contacto_clinica LIMIT 1')->fetch() ?: null;
} catch (Throwable $e) {
    error_log('landing: ' . $e->getMessage());
}

/* Icono FontAwesome según la categoría del tratamiento. */
function iconoCategoria(?string $cat): string {
    $c = strtolower((string) $cat);
    if (str_contains($c, 'prevent'))  return 'fa-shield-heart';
    if (str_contains($c, 'estét') || str_contains($c, 'estet')) return 'fa-wand-magic-sparkles';
    if (str_contains($c, 'cirug'))    return 'fa-user-doctor';
    if (str_contains($c, 'ortodon'))  return 'fa-teeth';
    if (str_contains($c, 'prótesis') || str_contains($c, 'protesis')) return 'fa-crown';
    return 'fa-tooth';
}
function e(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function iniciales(string $nombre): string {
    $p = preg_split('/\s+/', trim($nombre));
    $i = strtoupper(mb_substr($p[0] ?? '', 0, 1) . mb_substr($p[1] ?? ($p[0] ?? ''), 0, 1));
    return $i ?: 'DR';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clínica Dental · Tu sonrisa, en buenas manos</title>
    <meta name="description" content="Clínica dental. Revisiones, higiene, ortodoncia, estética dental y más. Pide tu cita online.">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="<?= ASSETS_URL ?>/css/clinica/design-system.css">
    <link rel="stylesheet" href="<?= ASSETS_URL ?>/css/clinica/landing.css">
</head>
<body>

<header class="site-header">
    <div class="container">
        <a class="brand" href="<?= BASE_URL ?>/index.php" aria-label="Inicio">
            <i class="fa-solid fa-tooth"></i> Clínica Dental Raquel Virgüez
        </a>
        <nav class="nav" id="nav">
            <a class="navlink" href="#servicios">Servicios</a>
            <a class="navlink" href="#equipo">Equipo</a>
            <a class="navlink" href="#porque">Por qué nosotros</a>
            <a class="navlink" href="#contacto">Contacto</a>
            <div class="nav-actions">
                <?php if ($isLoggedIn): ?>
                    <a class="btn btn-ghost" href="<?= e($panelUrl) ?>"><i class="fa-solid fa-gauge"></i> Mi panel</a>
                    <a class="btn btn-primary" href="<?= PHP_URL ?>/auth/logout.php">Salir</a>
                <?php else: ?>
                    <a class="btn btn-ghost" href="<?= PHP_URL ?>/auth/login.php">Acceder</a>
                    <a class="btn btn-primary" href="<?= PHP_URL ?>/auth/login.php"><i class="fa-solid fa-calendar-check"></i> Pedir cita</a>
                <?php endif; ?>
            </div>
        </nav>
        <button class="menu-toggle" id="menuToggle" aria-label="Menú"><i class="fa-solid fa-bars"></i></button>
    </div>
</header>

<main>
    <!-- HERO -->
    <section class="hero" id="inicio">
        <div class="container hero-grid">
            <div>
                <span class="eyebrow"><i class="fa-solid fa-heart-pulse"></i> Cuidamos tu salud bucodental</span>
                <h1>Tu sonrisa, en las mejores manos</h1>
                <p class="lead">Clínica dental en Gandía con un equipo cercano y tecnología moderna.
                   Pide tu cita online en segundos y elige el hueco que mejor te venga.</p>
                <div class="hero-cta">
                    <a class="btn btn-primary" href="<?= PHP_URL ?>/auth/login.php"><i class="fa-solid fa-calendar-check"></i> Pedir cita online</a>
                    <a class="btn btn-ghost" href="#servicios">Ver servicios</a>
                </div>
                <div class="hero-stats">
                    <div class="stat"><b><?= count($doctores) ?: '3' ?></b><span>Especialistas</span></div>
                    <div class="stat"><b>+15</b><span>Años de experiencia</span></div>
                    <div class="stat"><b>4.9★</b><span>Valoración pacientes</span></div>
                </div>
            </div>
            <div class="hero-card">
                <h3><i class="fa-solid fa-calendar-check" style="color:var(--c-primary)"></i> Cita online 24/7</h3>
                <p class="text-muted mb-0">Reserva sin llamar. Elige tratamiento, doctor y hora.</p>
                <ul class="mini-list">
                    <li><i class="fa-solid fa-circle-check"></i> Ver horarios disponibles al instante</li>
                    <li><i class="fa-solid fa-circle-check"></i> Recordatorios por email y WhatsApp</li>
                    <li><i class="fa-solid fa-circle-check"></i> Tu historial y citas siempre a mano</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- SERVICIOS -->
    <section class="section" id="servicios">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Servicios</span>
                <h2>Tratamientos para toda la familia</h2>
                <p>Desde revisiones y limpiezas hasta ortodoncia y estética dental.</p>
            </div>
            <div class="grid services-grid">
                <?php if ($tratamientos): foreach ($tratamientos as $t): ?>
                    <article class="card card-hover service-card">
                        <div class="ico"><i class="fa-solid <?= iconoCategoria($t['categoria']) ?>"></i></div>
                        <h3><?= e($t['nombre']) ?></h3>
                        <p class="text-muted mb-0"><?= e($t['descripcion'] ?: $t['categoria']) ?></p>
                        <div class="meta">
                            <span><i class="fa-regular fa-clock"></i> <?= (int) $t['duracion_min'] ?> min</span>
                            <span><i class="fa-solid fa-tag"></i> <?= e($t['categoria']) ?></span>
                        </div>
                    </article>
                <?php endforeach; else: ?>
                    <?php foreach (['Revisión y diagnóstico','Limpieza dental','Ortodoncia','Estética dental'] as $n): ?>
                        <article class="card card-hover service-card">
                            <div class="ico"><i class="fa-solid fa-tooth"></i></div>
                            <h3><?= e($n) ?></h3>
                            <p class="text-muted mb-0">Tratamiento realizado por nuestros especialistas.</p>
                        </article>
                    <?php endforeach; endif; ?>
            </div>
            <p class="text-center text-muted" style="margin-top:1.5rem">
                <i class="fa-solid fa-circle-info"></i> Catálogo completo y precios — <strong>próximamente</strong>.
            </p>
        </div>
    </section>

    <!-- EQUIPO -->
    <section class="section" id="equipo" style="background:var(--c-surface-2)">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Equipo</span>
                <h2>Conoce a nuestros doctores</h2>
                <p>Profesionales colegiados y en formación continua.</p>
            </div>
            <div class="grid team-grid">
                <?php if ($doctores): foreach ($doctores as $d): ?>
                    <article class="card card-hover doctor-card">
                        <div class="avatar"><?= e(iniciales($d['name'])) ?></div>
                        <h3 class="mb-0"><?= e($d['name']) ?></h3>
                        <div class="spec"><?= e($d['especialidad'] ?: 'Odontología') ?></div>
                        <?php if (!empty($d['num_colegiado'])): ?><div class="col">Nº col. <?= e($d['num_colegiado']) ?></div><?php endif; ?>
                    </article>
                <?php endforeach; else: ?>
                    <p class="text-center text-muted">Equipo disponible próximamente.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- POR QUÉ -->
    <section class="section" id="porque">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Por qué nosotros</span>
                <h2>Una clínica pensada para ti</h2>
            </div>
            <div class="grid why-grid">
                <div class="why-item"><i class="fa-solid fa-calendar-check"></i><div><h3>Cita online</h3><p class="text-muted">Reserva y gestiona tus citas sin llamadas.</p></div></div>
                <div class="why-item"><i class="fa-solid fa-notes-medical"></i><div><h3>Historial digital</h3><p class="text-muted">Tu información clínica, segura y accesible.</p></div></div>
                <div class="why-item"><i class="fa-brands fa-whatsapp"></i><div><h3>Recordatorios</h3><p class="text-muted">Avisos por email y WhatsApp para no olvidar tu cita.</p></div></div>
                <div class="why-item"><i class="fa-solid fa-user-shield"></i><div><h3>Trato cercano</h3><p class="text-muted">Un equipo que te acompaña en cada visita.</p></div></div>
            </div>
        </div>
    </section>

    <!-- CONTACTO -->
    <section class="section" id="contacto" style="background:var(--c-surface-2)">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Contacto</span>
                <h2>Estamos aquí para ayudarte</h2>
            </div>
            <div class="grid contact-grid">
                <div class="card">
                    <h3>Datos de la clínica</h3>
                    <ul class="contact-list">
                        <li><i class="fa-solid fa-location-dot"></i> <span><?= e($contacto['direccion'] ?? 'Carrer del Paranimf, 1, 46730 Gandía, Valencia') ?></span></li>
                        <li><i class="fa-solid fa-phone"></i> <span><?= e($contacto['telefono'] ?? '+34 962 84 90 00') ?></span></li>
                        <li><i class="fa-solid fa-envelope"></i> <span><?= e($contacto['email'] ?? 'info@clinica-dental.es') ?></span></li>
                        <li><i class="fa-regular fa-clock"></i> <span><?= e($contacto['horario'] ?? 'Lunes a viernes, 9:00 a 20:00') ?></span></li>
                    </ul>
                    <a class="btn btn-primary" href="<?= PHP_URL ?>/auth/login.php" style="margin-top:.6rem"><i class="fa-solid fa-calendar-check"></i> Pedir cita</a>
                </div>
                <div class="card contact-map" style="padding:.5rem">
                    <iframe title="Ubicación de la clínica" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2118.40437225478!2d-0.1681442044772555!3d38.995851467604865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd61c2a3069621fd%3A0xdb8ad87b84df4b24!2sUPV%20Campus%20de%20Gandia!5e1!3m2!1ses!2ses!4v1777733066329"></iframe>
                </div>
            </div>

            <div class="cta-band" style="margin-top:2.5rem">
                <h2>¿List@ para tu próxima visita?</h2>
                <p>Pide tu cita online y elige el hueco que mejor te venga.</p>
                <a class="btn btn-light" href="<?= PHP_URL ?>/auth/login.php" style="margin-top:.8rem"><i class="fa-solid fa-calendar-check"></i> Reservar ahora</a>
            </div>
        </div>
    </section>
</main>

<footer class="site-footer">
    <div class="container">
        <div>
            <div class="brand" style="color:#fff"><i class="fa-solid fa-tooth"></i> Clínica Dental</div>
            <p class="muted" style="margin-top:.5rem;max-width:34ch">Cuidamos tu salud bucodental con un trato cercano y tecnología moderna.</p>
        </div>
        <div>
            <p style="font-weight:700;color:#fff">Enlaces</p>
            <p><a href="#servicios">Servicios</a></p>
            <p><a href="#equipo">Equipo</a></p>
            <p><a href="<?= PHP_URL ?>/auth/login.php">Acceder</a></p>
        </div>
        <div>
            <p style="font-weight:700;color:#fff">Contacto</p>
            <p class="muted"><?= e($contacto['telefono'] ?? '+34 962 84 90 00') ?></p>
            <p class="muted"><?= e($contacto['email'] ?? 'info@clinica-dental.es') ?></p>
        </div>
    </div>
    <div class="container muted" style="margin-top:1.5rem;border-top:1px solid rgba(255,255,255,.1);padding-top:1rem">
        © <?= date('Y') ?> Clínica Dental · Demo MVP
    </div>
</footer>

<script>
    document.getElementById('menuToggle')?.addEventListener('click', function () {
        document.getElementById('nav')?.classList.toggle('open');
    });
    document.querySelectorAll('#nav .navlink').forEach(function (a) {
        a.addEventListener('click', function () { document.getElementById('nav')?.classList.remove('open'); });
    });
</script>
</body>
</html>
