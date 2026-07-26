<?php
// =====================================================================
// UsuarioRepository.php  ·  Acceso a datos de usuarios (clínica)
// Solo consultas (prepared statements). Sin lógica de negocio.
// Tabla única: usuarios (+ roles). Login unificado.
// =====================================================================

class UsuarioRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Busca un usuario por email, con el nombre de rol resuelto.
     * Incluye contrasena_hash y estado para que el servicio decida.
     * @return array|null
     */
    public function buscarPorEmail(string $email): ?array
    {
        $sql = 'SELECT u.id_usuario, u.dni, u.nombre, u.apellidos,
                       u.email, u.contrasena_hash, u.estado,
                       r.nombre_rol AS rol
                FROM usuarios u
                JOIN roles r ON r.id_rol = u.id_rol
                WHERE u.email = :email
                LIMIT 1';
        $st = $this->pdo->prepare($sql);
        $st->execute([':email' => $email]);
        return $st->fetch() ?: null;
    }

    /* Perfil del usuario por id (datos de cuenta + rol). */
    public function obtenerPerfil(int $idUsuario): ?array
    {
        $sql = 'SELECT u.id_usuario, u.dni, u.nombre, u.apellidos, u.email,
                       u.telefono, u.foto_perfil,
                       u.notificaciones_email, u.notificaciones_whatsapp,
                       u.estado, u.fecha_creacion,
                       r.nombre_rol AS rol
                FROM usuarios u
                JOIN roles r ON r.id_rol = u.id_rol
                WHERE u.id_usuario = :id LIMIT 1';
        $st = $this->pdo->prepare($sql);
        $st->execute([':id' => $idUsuario]);
        return $st->fetch() ?: null;
    }

    /* ¿Existe ya ese email? (para registro). */
    public function emailExiste(string $email): bool
    {
        $st = $this->pdo->prepare('SELECT 1 FROM usuarios WHERE email = :e LIMIT 1');
        $st->execute([':e' => $email]);
        return (bool) $st->fetchColumn();
    }

    /* id_rol a partir del nombre de rol. */
    public function idRolPorNombre(string $nombreRol): ?int
    {
        $st = $this->pdo->prepare('SELECT id_rol FROM roles WHERE nombre_rol = :n LIMIT 1');
        $st->execute([':n' => $nombreRol]);
        $id = $st->fetchColumn();
        return $id === false ? null : (int) $id;
    }

    public function actualizarPerfilEditable(int $idUsuario, ?string $telefono, bool $notifEmail, bool $notifWhatsapp, ?string $fotoPerfil): void
    {
        $sql = 'UPDATE usuarios
                SET telefono = :tel,
                    notificaciones_email = :nf,
                    notificaciones_whatsapp = :nw'
                . ($fotoPerfil !== null ? ', foto_perfil = :fp' : '') . '
                WHERE id_usuario = :id';
        $params = [
            ':tel' => $telefono,
            ':nf'  => $notifEmail ? 1 : 0,
            ':nw'  => $notifWhatsapp ? 1 : 0,
            ':id'  => $idUsuario,
        ];
        if ($fotoPerfil !== null) $params[':fp'] = $fotoPerfil;
        $this->pdo->prepare($sql)->execute($params);
    }

    /**
     * Crea un usuario paciente + su patient_profile en una transacción.
     * Usado por el alta de pacientes (secretaría) y el registro público.
     * @param array $u    ['dni','nombre','apellidos','email','contrasena_hash','telefono']
     * @param array $perfil ['fecha_nacimiento','sexo','direccion', ...] (todos opcionales)
     * @return int  id_usuario creado
     */
    public function crearPaciente(array $u, array $perfil = []): int
    {
        $idRolPaciente = $this->idRolPorNombre('paciente');
        if ($idRolPaciente === null) {
            throw new RuntimeException('No existe el rol paciente.');
        }

        $this->pdo->beginTransaction();
        try {
            $st = $this->pdo->prepare(
                'INSERT INTO usuarios (dni, nombre, apellidos, email, contrasena_hash, id_rol, telefono)
                 VALUES (:dni, :nombre, :apellidos, :email, :hash, :id_rol, :telefono)'
            );
            $st->execute([
                ':dni'       => $u['dni']             ?? null,
                ':nombre'    => $u['nombre']          ?? '',
                ':apellidos' => $u['apellidos']       ?? '',
                ':email'     => $u['email']           ?? '',
                ':hash'      => $u['contrasena_hash'] ?? '',
                ':id_rol'    => $idRolPaciente,
                ':telefono'  => $u['telefono']        ?? null,
            ]);
            $idUsuario = (int) $this->pdo->lastInsertId();

            $stp = $this->pdo->prepare(
                'INSERT INTO patient_profiles
                    (id_usuario, fecha_nacimiento, sexo, direccion, grupo_sanguineo,
                     alergias, enfermedades_cronicas, medicacion_actual, contacto_emergencia,
                     seguro_medico, numero_poliza)
                 VALUES
                    (:id, :fnac, :sexo, :dir, :grupo,
                     :alergias, :cronicas, :medicacion, :emergencia,
                     :seguro, :poliza)'
            );
            $stp->execute([
                ':id'         => $idUsuario,
                ':fnac'       => $perfil['fecha_nacimiento']      ?? null,
                ':sexo'       => $perfil['sexo']                  ?? 'no_especificado',
                ':dir'        => $perfil['direccion']             ?? null,
                ':grupo'      => $perfil['grupo_sanguineo']       ?? 'desconocido',
                ':alergias'   => $perfil['alergias']              ?? null,
                ':cronicas'   => $perfil['enfermedades_cronicas'] ?? null,
                ':medicacion' => $perfil['medicacion_actual']     ?? null,
                ':emergencia' => $perfil['contacto_emergencia']   ?? null,
                ':seguro'     => $perfil['seguro_medico']         ?? null,
                ':poliza'     => $perfil['numero_poliza']         ?? null,
            ]);

            $this->pdo->commit();
            return $idUsuario;
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
