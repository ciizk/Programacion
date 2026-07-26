<?php
// =====================================================================
// AppointmentRepository.php  ·  Acceso a datos de CITAS
// Solo consultas (prepared statements). La lógica vive en el controller.
// Tabla: appointments (+ vw_appointments, doctor_schedules).
// =====================================================================

class AppointmentRepository
{
    private PDO $pdo;

    // Estados que "ocupan" un hueco de agenda (no cancelada/no_asistio).
    public const ESTADOS_OCUPAN = ['programada', 'confirmada', 'completada'];
    public const ESTADOS_VALIDOS = ['programada', 'confirmada', 'completada', 'cancelada', 'no_asistio'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /* Cita enriquecida (join) por id. */
    public function obtenerPorId(int $idCita): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM vw_appointments WHERE id_cita = :id LIMIT 1');
        $st->execute([':id' => $idCita]);
        return $st->fetch() ?: null;
    }

    /* Fila cruda (sin joins) por id — para comprobaciones de propiedad/estado. */
    public function obtenerCruda(int $idCita): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM appointments WHERE id_cita = :id LIMIT 1');
        $st->execute([':id' => $idCita]);
        return $st->fetch() ?: null;
    }

    /**
     * Agenda de un doctor (opcionalmente acotada por fechas).
     */
    public function listarPorDoctor(int $idDoctor, ?string $desde = null, ?string $hasta = null): array
    {
        $sql = 'SELECT * FROM vw_appointments WHERE id_doctor = :doc';
        $params = [':doc' => $idDoctor];
        if ($desde !== null) { $sql .= ' AND fecha >= :desde'; $params[':desde'] = $desde; }
        if ($hasta !== null) { $sql .= ' AND fecha <= :hasta'; $params[':hasta'] = $hasta; }
        $sql .= ' ORDER BY fecha, hora_inicio';
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    /**
     * Citas de un paciente. $ambito: 'futuras' | 'historial' | 'todas'.
     * 'futuras'   = fecha >= hoy y estado programada/confirmada.
     * 'historial' = fecha < hoy o estado terminal (completada/cancelada/no_asistio).
     */
    public function listarPorPaciente(int $idPaciente, string $ambito = 'todas'): array
    {
        $sql = 'SELECT * FROM vw_appointments WHERE id_paciente = :pac';
        $params = [':pac' => $idPaciente];

        if ($ambito === 'futuras') {
            $sql .= " AND fecha >= CURDATE() AND estado IN ('programada','confirmada')";
            $sql .= ' ORDER BY fecha, hora_inicio';
        } elseif ($ambito === 'historial') {
            $sql .= " AND (fecha < CURDATE() OR estado IN ('completada','cancelada','no_asistio'))";
            $sql .= ' ORDER BY fecha DESC, hora_inicio DESC';
        } else {
            $sql .= ' ORDER BY fecha DESC, hora_inicio DESC';
        }
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    /* Listado general (secretaría) con filtros opcionales. */
    public function listar(array $filtros = []): array
    {
        $sql = 'SELECT * FROM vw_appointments WHERE 1=1';
        $params = [];
        if (!empty($filtros['fecha']))    { $sql .= ' AND fecha = :f';       $params[':f']   = $filtros['fecha']; }
        if (!empty($filtros['estado']))   { $sql .= ' AND estado = :e';      $params[':e']   = $filtros['estado']; }
        if (!empty($filtros['id_doctor'])){ $sql .= ' AND id_doctor = :d';   $params[':d']   = (int) $filtros['id_doctor']; }
        $sql .= ' ORDER BY fecha, hora_inicio';
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    /* Catálogo: doctores activos (para selectores de reserva). */
    public function doctoresActivos(): array
    {
        return $this->pdo->query(
            'SELECT id, name, especialidad FROM vw_doctor_profiles WHERE activo = 1 ORDER BY name'
        )->fetchAll();
    }

    /* Catálogo: tratamientos activos. */
    public function tratamientosActivos(): array
    {
        return $this->pdo->query(
            'SELECT id_tratamiento, nombre, categoria, duracion_min FROM vw_treatments_activos ORDER BY id_tratamiento'
        )->fetchAll();
    }

    /* Catálogo: salas activas. */
    public function salasActivas(): array
    {
        return $this->pdo->query('SELECT id_sala, nombre FROM salas WHERE activo = 1 ORDER BY nombre')->fetchAll();
    }

    /* Perfil clínico de un paciente (para su panel). */
    public function perfilPaciente(int $idUsuario): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM vw_patient_profiles WHERE id = :id LIMIT 1');
        $st->execute([':id' => $idUsuario]);
        return $st->fetch() ?: null;
    }

    /* Duración (min) de un tratamiento activo, o null si no existe. */
    public function duracionTratamiento(int $idTratamiento): ?int
    {
        $st = $this->pdo->prepare('SELECT duracion_min FROM treatments WHERE id_tratamiento = :id AND activo = 1 LIMIT 1');
        $st->execute([':id' => $idTratamiento]);
        $v = $st->fetchColumn();
        return $v === false ? null : (int) $v;
    }

    /* ¿El usuario indicado tiene el rol indicado? (validación de FKs de cita). */
    public function usuarioTieneRol(int $idUsuario, string $nombreRol): bool
    {
        $st = $this->pdo->prepare(
            'SELECT 1 FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = :id AND r.nombre_rol = :rol AND u.estado = \'activo\' LIMIT 1'
        );
        $st->execute([':id' => $idUsuario, ':rol' => $nombreRol]);
        return (bool) $st->fetchColumn();
    }

    /* Franjas de disponibilidad de un doctor para un día de la semana (1-7 ISO). */
    public function franjasDoctor(int $idDoctor, int $diaSemana): array
    {
        $st = $this->pdo->prepare(
            'SELECT hora_inicio, hora_fin FROM doctor_schedules
             WHERE id_doctor = :doc AND dia_semana = :dia AND activo = 1
             ORDER BY hora_inicio'
        );
        $st->execute([':doc' => $idDoctor, ':dia' => $diaSemana]);
        return $st->fetchAll();
    }

    /* Citas que ocupan agenda de un doctor en una fecha (para calcular huecos). */
    public function citasOcupadas(int $idDoctor, string $fecha): array
    {
        $in = "'" . implode("','", self::ESTADOS_OCUPAN) . "'";
        $st = $this->pdo->prepare(
            "SELECT hora_inicio, hora_fin FROM appointments
             WHERE id_doctor = :doc AND fecha = :fecha AND estado IN ($in)
             ORDER BY hora_inicio"
        );
        $st->execute([':doc' => $idDoctor, ':fecha' => $fecha]);
        return $st->fetchAll();
    }

    /* ¿La franja [ini,fin) del doctor en esa fecha pisa otra cita? */
    public function existeSolape(int $idDoctor, string $fecha, string $ini, string $fin, ?int $excluirCita = null): bool
    {
        $in = "'" . implode("','", self::ESTADOS_OCUPAN) . "'";
        $sql = "SELECT 1 FROM appointments
                WHERE id_doctor = :doc AND fecha = :fecha AND estado IN ($in)
                  AND hora_inicio < :fin AND hora_fin > :ini";
        $params = [':doc' => $idDoctor, ':fecha' => $fecha, ':ini' => $ini, ':fin' => $fin];
        if ($excluirCita !== null) { $sql .= ' AND id_cita <> :exc'; $params[':exc'] = $excluirCita; }
        $sql .= ' LIMIT 1';
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        return (bool) $st->fetchColumn();
    }

    /**
     * Inserta una cita. Devuelve el id.
     * @param array $d claves: id_paciente,id_doctor,id_tratamiento,id_sala,fecha,
     *                 hora_inicio,hora_fin,motivo,estado,coste,origen,id_creado_por
     */
    public function crear(array $d): int
    {
        $st = $this->pdo->prepare(
            'INSERT INTO appointments
                (id_paciente, id_doctor, id_tratamiento, id_sala, fecha, hora_inicio, hora_fin,
                 motivo, estado, coste, origen, id_creado_por)
             VALUES
                (:pac, :doc, :trat, :sala, :fecha, :ini, :fin,
                 :motivo, :estado, :coste, :origen, :creado_por)'
        );
        $st->execute([
            ':pac'        => (int) $d['id_paciente'],
            ':doc'        => (int) $d['id_doctor'],
            ':trat'       => $d['id_tratamiento'] ?? null,
            ':sala'       => $d['id_sala'] ?? null,
            ':fecha'      => $d['fecha'],
            ':ini'        => $d['hora_inicio'],
            ':fin'        => $d['hora_fin'],
            ':motivo'     => $d['motivo'] ?? null,
            ':estado'     => $d['estado'] ?? 'programada',
            ':coste'      => $d['coste'] ?? null,
            ':origen'     => $d['origen'] ?? 'secretaria',
            ':creado_por' => $d['id_creado_por'] ?? null,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    /* Cambia solo el estado. */
    public function cambiarEstado(int $idCita, string $estado): bool
    {
        $st = $this->pdo->prepare('UPDATE appointments SET estado = :e WHERE id_cita = :id');
        return $st->execute([':e' => $estado, ':id' => $idCita]);
    }

    /**
     * Marca la cita como COMPLETADA y adjunta notas clínicas (y coste opcional).
     */
    public function completar(int $idCita, string $notasClinicas, ?float $coste = null): bool
    {
        $sql = 'UPDATE appointments
                SET estado = :estado, notas_clinicas = :notas'
                . ($coste !== null ? ', coste = :coste' : '') . '
                WHERE id_cita = :id';
        $params = [':estado' => 'completada', ':notas' => $notasClinicas, ':id' => $idCita];
        if ($coste !== null) $params[':coste'] = $coste;
        return $this->pdo->prepare($sql)->execute($params);
    }
}
