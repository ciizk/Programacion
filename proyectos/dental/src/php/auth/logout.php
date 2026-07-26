<?php
// =====================================================================
// auth/logout.php  ·  Cierra la sesión y vuelve al login.
// =====================================================================
require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../bbdd/helpers.php';

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
}
session_destroy();

$destino = defined('PHP_URL') ? PHP_URL . '/auth/login.php' : '/';
if (!headers_sent()) {
    header('Location: ' . $destino);
}
exit;
