<?php
// POST /api/pacientes/crear.php  ·  Alta de paciente (SECRETARY)
// Campos: csrf_token, nombre, apellidos, email, dni?, telefono?, password?
// Crea usuario (rol paciente) + patient_profile. Password demo por defecto.
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../bbdd/repositories/UsuarioRepository.php';

exigeMetodo('POST');
$actor = actorApi();
exigeRolApi($actor, ROLE_SECRETARY);
exigeCsrf();

$nombre    = limpiarEntrada($_POST['nombre'] ?? '');
$apellidos = limpiarEntrada($_POST['apellidos'] ?? '');
$email     = strtolower(limpiarEntrada($_POST['email'] ?? ''));
$dni       = limpiarEntrada($_POST['dni'] ?? '') ?: null;
$telefono  = limpiarEntrada($_POST['telefono'] ?? '') ?: null;
$password  = (string) ($_POST['password'] ?? '');

if ($nombre === '' || $apellidos === '' || $email === '') {
    jsonFail('Nombre, apellidos y email son obligatorios.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonFail('Email no válido.', 400);
}
if ($password === '') {
    $password = 'clinica123'; // demo: contraseña por defecto (en real: invitación por email)
}

try {
    $repo = new UsuarioRepository(obtenerConexion());
    if ($repo->emailExiste($email)) {
        jsonFail('Ya existe un usuario con ese email.', 409);
    }
    $idUsuario = $repo->crearPaciente([
        'dni'             => $dni,
        'nombre'          => $nombre,
        'apellidos'       => $apellidos,
        'email'           => $email,
        'telefono'        => $telefono,
        'contrasena_hash' => password_hash($password, PASSWORD_BCRYPT),
    ]);
    jsonOk(['id_usuario' => $idUsuario, 'mensaje' => 'Paciente dado de alta.']);
} catch (Throwable $e) {
    error_log('pacientes/crear: ' . $e->getMessage());
    jsonFail('No se pudo dar de alta al paciente.', 500);
}
