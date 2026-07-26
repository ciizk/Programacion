<?php
// =====================================================================
// conexion.php  ·  Conexión PDO única a MySQL/MariaDB
// ---------------------------------------------------------------------
// Uso:
//   require_once __DIR__ . '/conexion.php';
//   $pdo = obtenerConexion();
//
// Configuración (orden de prioridad):
//   1) Variables de entorno DB_HOST / DB_PORT / DB_NAME /
//      DB_USER / DB_PASS / DB_CHARSET  (útil en Plesk/CI).
//   2) config/database.local.php.
//   3) config/database.example.php.
//
// La conexión es perezosa y se reutiliza.
// =====================================================================

if (!defined('CONFIG_DIR_DB')) {
    // .../src/php/bbdd  ->  .../config
    define('CONFIG_DIR_DB', dirname(__DIR__, 3) . '/config');
}

/**
 * Carga el array de configuración de la base de datos.
 * @return array{host:string,port:string,dbname:string,user:string,password:string,charset:string}
 */
function cargarConfiguracionBd(): array
{
    // 1) Override por variables de entorno
    $hostEnvBd = getenv('DB_HOST');
    if ($hostEnvBd !== false && $hostEnvBd !== '') {
        return [
            'host'     => $hostEnvBd,
            'port'     => (string) (getenv('DB_PORT') ?: ''),
            'dbname'   => (string) (getenv('DB_NAME') ?: ''),
            'user'     => (string) (getenv('DB_USER') ?: ''),
            'password' => (string) (getenv('DB_PASS') ?: ''),
            'charset'  => (string) (getenv('DB_CHARSET') ?: 'utf8mb4'),
        ];
    }

    // 2) Archivo local 
    $rutaLocalBd = CONFIG_DIR_DB . '/database.local.php';
    if (is_file($rutaLocalBd)) {
        return require $rutaLocalBd;
    }

    // 3) Plantilla de ejemplo 
    $rutaEjemploBd = CONFIG_DIR_DB . '/database.example.php';
    if (is_file($rutaEjemploBd)) {
        return require $rutaEjemploBd;
    }

    throw new RuntimeException('No se encontró configuración de base de datos (database.local.php / database.example.php).');
}

/**
 * Devuelve la conexión PDO (la crea la primera vez y la reutiliza).
 * @throws PDOException si la conexión falla.
 */
function obtenerConexion(): PDO
{
    static $conexionBd = null;

    if ($conexionBd instanceof PDO) {
        return $conexionBd;
    }

    $configBd = cargarConfiguracionBd();

    $hostBd    = $configBd['host']    ?? 'localhost';
    $puertoBd  = $configBd['port']    ?? '';
    $nombreBd  = $configBd['dbname']  ?? '';
    $usuarioBd = $configBd['user']    ?? '';
    $claveBd   = $configBd['password']?? '';
    $charsetBd = $configBd['charset'] ?? 'utf8mb4';

    // El puerto es opcional: si no se indica, MySQL usa 3306 por defecto.
    $dsnBd = "mysql:host={$hostBd};";
    if ($puertoBd !== '' && $puertoBd !== null) {
        $dsnBd .= "port={$puertoBd};";
    }
    $dsnBd .= "dbname={$nombreBd};charset={$charsetBd}";

    $opcionesBd = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_STRINGIFY_FETCHES  => false,
    ];

    $conexionBd = new PDO($dsnBd, $usuarioBd, $claveBd, $opcionesBd);

    return $conexionBd;
}
