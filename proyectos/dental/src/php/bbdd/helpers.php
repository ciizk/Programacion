<?php
// =====================================================================
// helpers.php  ·  Funciones de apoyo para backend (sesión, auth, redirect)
// ---------------------------------------------------------------------
// Solo DEFINE funciones reutilizables; no ejecuta nada al incluirse.
// Login único de la clínica: la sesión se guarda en $_SESSION['user']:
//   ['id_usuario'=>int, 'name'=>..., 'surname'=>..., 'email'=>...,
//    'dni'=>..., 'role'=>'paciente'|'doctor'|'secretaria']
//
// Archivo de utilidades compartidas para login, sesión, roles y redirecciones.
// =====================================================================

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/validador.php';

// Roles de la clínica (valor tal cual se guarda en roles.nombre_rol).
if (!defined('ROLE_PATIENT'))   define('ROLE_PATIENT',   'paciente');
if (!defined('ROLE_DOCTOR'))    define('ROLE_DOCTOR',    'doctor');
if (!defined('ROLE_SECRETARY')) define('ROLE_SECRETARY', 'secretaria');

// =====================================================================
// CSRF · protección de formularios POST state-changing
// =====================================================================

/* Genera y devuelve el token CSRF de la sesión actual. */
function generarTokenCsrf(): string
{
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token']) || $_SESSION['csrf_token'] === '') {
        try {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        } catch (Throwable $e) {
            $_SESSION['csrf_token'] = hash('sha256', uniqid('', true) . microtime(true));
        }
    }
    return $_SESSION['csrf_token'];
}

/* Devuelve un <input type="hidden"> con el token CSRF listo para imprimir. */
function campoCsrf(): string
{
    $token = generarTokenCsrf();
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
}

/* Comparación constante-tiempo del token recibido vs el de sesión. */
function validarTokenCsrf(?string $tokenRecibido): bool
{
    if (!is_string($tokenRecibido) || $tokenRecibido === '') return false;
    $esperado = $_SESSION['csrf_token'] ?? '';
    if (!is_string($esperado) || $esperado === '') return false;
    return hash_equals($esperado, $tokenRecibido);
}

/**Atajo para validar el token de un POST. */
function csrfPostValido(): bool
{
    return $_SERVER['REQUEST_METHOD'] === 'POST' && validarTokenCsrf($_POST['csrf_token'] ?? null);
}

function limpiarEntrada($valorEntrada)
{
    if (is_array($valorEntrada)) {
        return array_map('limpiarEntrada', $valorEntrada);
    }
    if ($valorEntrada === null) {
        return null;
    }
    $textoEntrada = trim((string) $valorEntrada);
    // Quita caracteres de control por seguridad.
    $textoEntrada = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $textoEntrada);
    return $textoEntrada;
}

/*
Inicia la sesión con parámetros seguros si aún no está iniciada.
Idempotente: si ya hay sesión, no hace nada.
 */
function iniciarSesionSegura(): void
{
    if (session_status() !== PHP_SESSION_NONE) {
        return;
    }

    $esHttpsSesion = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? null) == 443);

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $esHttpsSesion,   
        'httponly' => true,             
        'samesite' => 'Lax',
    ]);

    session_start();
}

/**
 * Devuelve el usuario en sesión o null.
 * @return array|null
 */
function usuarioActual(): ?array
{
    if (session_status() === PHP_SESSION_NONE) {
        iniciarSesionSegura();
    }
    return $_SESSION['user'] ?? null;
}

/*
Exige que haya un usuario logueado. Si no, redirige al login.
 */
function requiereLogin(): void
{
    if (usuarioActual() === null) {
        $loginUrl = defined('PHP_URL') ? PHP_URL . '/auth/login.php' : '/';
        redirigirSeguro($loginUrl);
    }
}

/**
 * Exige login + un rol concreto.
 * @param string|string[] $rolesPermitidos  'paciente' | 'doctor' | 'secretaria'
 */
function requiereRol($rolesPermitidos): void
{
    requiereLogin();

    $usuarioRol = usuarioActual()['role'] ?? null;
    $listaRoles = is_array($rolesPermitidos) ? $rolesPermitidos : [$rolesPermitidos];

    if (!in_array($usuarioRol, $listaRoles, true)) {
        // Rol incorrecto: lo mandamos a su propio panel.
        redirigirPorRol($usuarioRol);
    }
}

/*
Redirige al panel inicial correspondiente al rol indicado.
Las rutas de panel se materializan en la Fase 2 (rediseño del front-end).
 */
function redirigirPorRol(?string $rol): void
{
    $base = defined('PHP_URL') ? PHP_URL : '';

    switch ($rol) {
        case ROLE_PATIENT:
            redirigirSeguro($base . '/paciente/inicio.php');
            break;
        case ROLE_DOCTOR:
            redirigirSeguro($base . '/doctor/inicio.php');
            break;
        case ROLE_SECRETARY:
            redirigirSeguro($base . '/secretaria/inicio.php');
            break;
        default:
            redirigirSeguro($base . '/auth/login.php');
            break;
    }
}

/*
Redirección segura: solo permite rutas internas.
Evita "open redirect" hacia dominios externos.
 */
function redirigirSeguro(string $url): void
{
    $urlDestino = trim($url);

    // Bloquea URLs absolutas externas (http://, https://, //host) salvo APP_URL.
    $esExterna = preg_match('#^(https?:)?//#i', $urlDestino) === 1;
    if ($esExterna) {
        $appUrl = defined('APP_URL') ? APP_URL : '';
        if ($appUrl === '' || strpos($urlDestino, $appUrl) !== 0) {
            // No es de nuestro dominio: caemos a una ruta interna segura.
            $urlDestino = defined('BASE_URL') ? BASE_URL . '/index.php' : '/';
        }
    }

    if (!headers_sent()) {
        header('Location: ' . $urlDestino);
    }
    exit;
}

/**
 * Sanitiza HTML procedente del editor de texto enriquecido para mostrarlo de
 * forma segura. Conserva un conjunto reducido de etiquetas de formato y elimina
 * scripts, estilos y atributos peligrosos (on*, javascript:).
 */
function sanitizarHtmlRicoDoa(string $html): string
{
    if (trim($html) === '') return '';

    // Etiquetas de formato permitidas.
    $permitidas = '<p><br><b><strong><i><em><u><s><ul><ol><li><a><blockquote><h3><h4><span>';
    $limpio = strip_tags($html, $permitidas);

    // Eliminar atributos de evento (onclick, onload, …) y javascript: en href.
    $limpio = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $limpio);
    $limpio = preg_replace('/(href|src)\s*=\s*("javascript:[^"]*"|\'javascript:[^\']*\')/i', '$1="#"', $limpio);

    return $limpio;
}

/**
 * Convierte HTML enriquecido a texto plano (para vistas previas en tablas).
 */
function htmlRicoATextoPlano(string $html, int $max = 80): string
{
    $texto = trim(preg_replace('/\s+/', ' ', strip_tags($html)));
    $texto = html_entity_decode($texto, ENT_QUOTES, 'UTF-8');
    if (mb_strlen($texto) > $max) {
        $texto = mb_substr($texto, 0, $max) . '…';
    }
    return $texto;
}
