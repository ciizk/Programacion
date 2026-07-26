<?php
// =====================================================================
// includes/panel-top.php  ·  Cabecera/layout compartido de los paneles
// La página debe definir antes de incluir:
//   $panelRole   'paciente'|'doctor'|'secretaria'
//   $panelActive clave de nav activa (p.ej. 'inicio')
//   $panelTitle  título de la página
// y haber llamado a requiereRol(...) previamente.
// =====================================================================
require_once __DIR__ . '/ui.php';
$__user = usuarioActual() ?? [];
$__name = trim(($__user['name'] ?? '') . ' ' . ($__user['surname'] ?? ''));
$__ini  = strtoupper(mb_substr($__user['name'] ?? 'U', 0, 1) . mb_substr($__user['surname'] ?? '', 0, 1));
$__roleLabel = ['paciente' => 'Paciente', 'doctor' => 'Doctor/a', 'secretaria' => 'Secretaría'][$panelRole] ?? '';

// Navegación por rol: [clave => [etiqueta, icono, url|null(ComingSoon)]]
$__nav = [
    'paciente' => [
        'inicio'    => ['Inicio', 'fa-gauge', PHP_URL . '/paciente/inicio.php'],
        'solicitar' => ['Solicitar cita', 'fa-calendar-plus', PHP_URL . '/paciente/solicitar-cita.php'],
        'perfil'    => ['Mi perfil médico', 'fa-notes-medical', null],
    ],
    'doctor' => [
        'inicio'    => ['Mi agenda', 'fa-calendar-day', PHP_URL . '/doctor/inicio.php'],
        'pacientes' => ['Pacientes', 'fa-users', null],
    ],
    'secretaria' => [
        'inicio'    => ['Agenda', 'fa-calendar-days', PHP_URL . '/secretaria/inicio.php'],
        'alta'      => ['Alta de paciente', 'fa-user-plus', PHP_URL . '/secretaria/inicio.php#alta'],
        'doctores'  => ['Doctores', 'fa-user-doctor', null],
    ],
][$panelRole] ?? [];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= ee($panelTitle ?? 'Panel') ?> · Clínica Dental</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="<?= ASSETS_URL ?>/css/clinica/design-system.css">
    <link rel="stylesheet" href="<?= ASSETS_URL ?>/css/clinica/panel.css">
</head>
<body>
<div class="panel-backdrop" id="backdrop"></div>
<div class="panel-body">

    <aside class="sidebar" id="sidebar">
        <a class="brand" href="<?= BASE_URL ?>/index.php"><i class="fa-solid fa-tooth"></i> Clínica Dental</a>
        <span class="role-chip"><?= ee($__roleLabel) ?></span>
        <nav>
            <?php foreach ($__nav as $key => $item): [$lbl, $ico, $url] = $item; ?>
                <?php if ($url !== null): ?>
                    <a href="<?= ee($url) ?>" class="<?= $panelActive === $key ? 'active' : '' ?>"><i class="fa-solid <?= $ico ?>"></i> <?= ee($lbl) ?></a>
                <?php else: ?>
                    <a href="#" title="Próximamente" onclick="return false" style="opacity:.6"><i class="fa-solid <?= $ico ?>"></i> <?= ee($lbl) ?> <span style="margin-left:auto;font-size:.62rem">SOON</span></a>
                <?php endif; ?>
            <?php endforeach; ?>
        </nav>
        <div class="sidebar-foot">
            <a href="<?= PHP_URL ?>/auth/logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión</a>
        </div>
    </aside>

    <div class="panel-main">
        <header class="topbar">
            <div class="flex items-center" style="gap:.7rem">
                <button class="hamburger" id="hamburger" aria-label="Menú"><i class="fa-solid fa-bars"></i></button>
                <h1><?= ee($panelTitle ?? 'Panel') ?></h1>
            </div>
            <div class="user">
                <div class="av"><?= ee($__ini) ?></div>
                <div><?= ee($__name) ?></div>
            </div>
        </header>
        <main class="panel-content">
