<?php
// =====================================================================
// AuthService.php  ·  Autenticación única de la clínica
// Un solo login para toda la plataforma (web informativa -> gestión).
// Usa UsuarioRepository + password_verify. No toca la sesión: valida
// y devuelve los datos "seguros" del usuario (sin el hash) o null.
// =====================================================================

require_once __DIR__ . '/../repositories/UsuarioRepository.php';

class AuthService
{
    private UsuarioRepository $usuarioRepo;

    public function __construct(UsuarioRepository $usuarioRepo)
    {
        $this->usuarioRepo = $usuarioRepo;
    }

    /**
     * Autentica a un usuario de la clínica.
     * Reglas: existe + estado 'activo' + contraseña correcta.
     * No revela si falló el email o la clave.
     * @return array|null  datos de sesión (sin hash) o null.
     */
    public function autenticar(string $email, string $password): ?array
    {
        $email = strtolower(trim($email));
        if ($email === '' || $password === '') {
            return null;
        }

        $usuario = $this->usuarioRepo->buscarPorEmail($email);
        if ($usuario === null) {
            return null;
        }
        if (($usuario['estado'] ?? '') !== 'activo') {
            return null;
        }
        if (!password_verify($password, (string) ($usuario['contrasena_hash'] ?? ''))) {
            return null;
        }

        // Datos seguros para $_SESSION['user']. El rol es el valor de BD
        // (paciente | doctor | secretaria); no hay mapeos ocultos.
        return [
            'id_usuario' => (int) ($usuario['id_usuario'] ?? 0),
            'dni'        => $usuario['dni']       ?? '',
            'name'       => $usuario['nombre']    ?? '',
            'surname'    => $usuario['apellidos'] ?? '',
            'email'      => $usuario['email']     ?? '',
            'role'       => $usuario['rol']       ?? '',
        ];
    }
}
