<?php

if (session_status() === PHP_SESSION_NONE) {
    require_once __DIR__ . '/../src/php/bbdd/helpers.php';
    iniciarSesionSegura();
}

define('CONFIG_PATH', __DIR__);

// Configuración local opcional (puede predefinir BASE_URL, APP_URL, APP_ENV…).
if (is_file(__DIR__ . '/app.local.php')) {
    require_once __DIR__ . '/app.local.php';
}

// Ruta base del proyecto en el servidor (subcarpeta). Override por env/local
// (p. ej. BASE_URL='' cuando se sirve desde la raíz en desarrollo).
if (!defined('BASE_URL')) {
    $baseEnv = getenv('BASE_URL');
    define('BASE_URL', $baseEnv !== false ? $baseEnv : '/proyecto-gti');
}

// URL completa del proyecto.
if (!defined('APP_URL')) {
    $appUrlEnv = getenv('APP_URL');
    define('APP_URL', $appUrlEnv !== false && $appUrlEnv !== ''
        ? $appUrlEnv
        : 'https://ltufekc.upv.edu.es/proyecto-gti');
}

// Rutas generales del proyecto.
define('SRC_URL', BASE_URL . '/src');
define('ASSETS_URL', SRC_URL . '/assets');
define('PHP_URL', SRC_URL . '/php');

// Entorno de ejecución (dirigido por env; override en app.local.php).
if (!defined('APP_ENV')) {
    $envCfg = getenv('APP_ENV');
    define('APP_ENV', $envCfg !== false && $envCfg !== '' ? $envCfg : 'production');
}

// Carpeta de almacenamiento de archivos subidos.
if (!defined('STORAGE_PATH')) {
    $storageEnv = getenv('STORAGE_PATH');
    define('STORAGE_PATH', $storageEnv !== false && $storageEnv !== ''
        ? rtrim($storageEnv, "/\\")
        : dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'uploads');
}
