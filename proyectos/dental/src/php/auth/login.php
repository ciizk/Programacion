<?php
// =====================================================================
// auth/login.php  ·  Login ÚNICO de la clínica
// Web informativa -> gestión. Enruta por rol tras autenticar.
// (Vista mínima funcional; el rediseño visual llega en la Fase 2.)
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';
require_once __DIR__ . '/../bbdd/services/AuthService.php';

// Ya logueado -> a su panel.
if (usuarioActual() !== null) {
    redirigirPorRol(usuarioActual()['role'] ?? null);
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrfPostValido()) {
        $error = 'Sesión caducada. Vuelve a intentarlo.';
    } else {
        $email    = limpiarEntrada($_POST['email'] ?? '');
        $password = (string) ($_POST['password'] ?? '');

        try {
            $auth    = new AuthService(new UsuarioRepository(obtenerConexion()));
            $usuario = $auth->autenticar($email, $password);
        } catch (Throwable $e) {
            error_log('login: ' . $e->getMessage());
            $usuario = null;
            $error   = 'No se pudo conectar. Inténtalo más tarde.';
        }

        if ($usuario !== null) {
            // Fija sesión y previene fijación de sesión.
            session_regenerate_id(true);
            $_SESSION['user'] = $usuario;
            redirigirPorRol($usuario['role']);
        } elseif ($error === '') {
            $error = 'Email o contraseña incorrectos.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso · Clínica Dental</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="<?= ASSETS_URL ?>/css/clinica/design-system.css">
    <style>
        .auth-wrap { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem;
            background: radial-gradient(1000px 500px at 50% -20%, var(--c-primary-100), transparent 60%), var(--c-bg); }
        .auth-card { width: 100%; max-width: 400px; }
        .auth-brand { display:flex; align-items:center; gap:.5rem; justify-content:center; font-weight:800;
            color: var(--c-primary-700); font-size:1.2rem; margin-bottom:1.2rem; }
        .auth-brand i { color: var(--c-primary); font-size:1.5rem; }
        .demo-hint { font-size:.82rem; color:var(--c-muted); text-align:center; margin-top:1rem; }
    </style>
</head>
<body>
<div class="auth-wrap">
    <div class="card auth-card">
        <div class="auth-brand"><i class="fa-solid fa-tooth"></i> Clínica Dental</div>

        <?php if ($error !== ''): ?>
            <div class="alert alert-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <form method="post" action="">
            <?= campoCsrf() ?>
            <div class="field">
                <label for="email">Email</label>
                <input class="input" id="email" type="email" name="email" required autocomplete="username" autofocus>
            </div>
            <div class="field">
                <label for="password">Contraseña</label>
                <input class="input" id="password" type="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
        </form>

        <p class="demo-hint">
            <i class="fa-solid fa-circle-info"></i> Demo · contraseña <b>clinica123</b><br>
            <a href="<?= BASE_URL ?>/index.php">← Volver a la web</a>
        </p>
    </div>
</div>
</body>
</html>
