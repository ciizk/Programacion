<?php
// =====================================================================
// AppointmentController.php  ·  Lógica de CITAS (sustituye a cursos/clases)
// Orquesta el AppointmentRepository y aplica las REGLAS DE ROL:
//   SECRETARY : gestión total de citas + alta de pacientes.
//   DOCTOR    : lectura de su agenda propia + notas clínicas / cerrar cita.
//   PATIENT   : lectura de sus citas futuras/historial + solicitar cita.
//
// No imprime nada: devuelve arrays o lanza AppointmentException (con
// código HTTP). Los endpoints en src/php/api/citas/ hacen el HTTP/JSON.
// =====================================================================

require_once __DIR__ . '/../bbdd/repositories/AppointmentRepository.php';

/** Excepción de dominio; el código es el status HTTP a devolver. */
class AppointmentException extends RuntimeException
{
    public function __construct(string $message, int $httpStatus = 400)
    {
        parent::__construct($message, $httpStatus);
    }
    public function status(): int { return $this->getCode() ?: 400; }
}

class AppointmentController
{
    private AppointmentRepository $repo;
    private const DUR_DEFAULT = 30; // minutos, si no hay tratamiento

    public function __construct(AppointmentRepository $repo)
    {
        $this->repo = $repo;
    }

    // =================================================================
    // LECTURA
    // =================================================================

    /** Agenda según el rol del actor (sesión $_SESSION['user']). */
    public function agenda(array $actor, array $filtros = []): array
    {
        switch ($actor['role'] ?? '') {
            case ROLE_SECRETARY:
                return $this->repo->listar($filtros);
            case ROLE_DOCTOR:
                return $this->repo->listarPorDoctor((int) $actor['id_usuario'], $filtros['desde'] ?? null, $filtros['hasta'] ?? null);
            case ROLE_PATIENT:
                return $this->repo->listarPorPaciente((int) $actor['id_usuario'], $filtros['ambito'] ?? 'todas');
            default:
                throw new AppointmentException('No autorizado', 403);
        }
    }

    /** Citas del paciente actual. $ambito: futuras|historial|todas. */
    public function misCitas(array $actor, string $ambito = 'todas'): array
    {
        $this->exigeRol($actor, ROLE_PATIENT);
        return $this->repo->listarPorPaciente((int) $actor['id_usuario'], $ambito);
    }

    /** Detalle de una cita, comprobando que el actor puede verla. */
    public function detalle(array $actor, int $idCita): array
    {
        $cita = $this->repo->obtenerPorId($idCita);
        if ($cita === null) {
            throw new AppointmentException('Cita no encontrada', 404);
        }
        $this->exigeAccesoCita($actor, $cita);
        return $cita;
    }

    /**
     * Huecos libres de un doctor en una fecha, para un tratamiento (o duración
     * por defecto). Base del autoservicio del paciente.
     * @return array<int,array{hora_inicio:string,hora_fin:string}>
     */
    public function disponibilidad(int $idDoctor, string $fecha, ?int $idTratamiento = null): array
    {
        $dt = DateTime::createFromFormat('!Y-m-d', $fecha);
        $errores = DateTime::getLastErrors();
        if (!$dt || ($errores && ($errores['warning_count'] || $errores['error_count']))) {
            throw new AppointmentException('Fecha inválida (formato YYYY-MM-DD).', 400);
        }
        if (!$this->repo->usuarioTieneRol($idDoctor, ROLE_DOCTOR)) {
            throw new AppointmentException('El doctor indicado no existe.', 404);
        }

        $duracion = self::DUR_DEFAULT;
        if ($idTratamiento !== null) {
            $d = $this->repo->duracionTratamiento($idTratamiento);
            if ($d === null) {
                throw new AppointmentException('Tratamiento no válido.', 400);
            }
            $duracion = $d;
        }

        $diaSemana = (int) $dt->format('N'); // 1=lunes … 7=domingo
        $franjas   = $this->repo->franjasDoctor($idDoctor, $diaSemana);
        $ocupadas  = $this->repo->citasOcupadas($idDoctor, $fecha);
        $ahora     = new DateTime();

        $slots = [];
        foreach ($franjas as $fr) {
            $cursor    = DateTime::createFromFormat('!Y-m-d H:i:s', "$fecha {$fr['hora_inicio']}");
            $finFranja = DateTime::createFromFormat('!Y-m-d H:i:s', "$fecha {$fr['hora_fin']}");
            if (!$cursor || !$finFranja) { continue; }

            while (true) {
                $slotFin = (clone $cursor)->modify("+{$duracion} minutes");
                if ($slotFin > $finFranja) { break; }

                if ($cursor > $ahora && !$this->pisaOcupada($cursor, $slotFin, $fecha, $ocupadas)) {
                    $slots[] = [
                        'hora_inicio' => $cursor->format('H:i'),
                        'hora_fin'    => $slotFin->format('H:i'),
                    ];
                }
                $cursor = $slotFin;
            }
        }
        return $slots;
    }

    // =================================================================
    // ESCRITURA
    // =================================================================

    /**
     * El PACIENTE solicita una cita (autoservicio). Solo para sí mismo.
     * $datos: id_doctor, fecha, hora_inicio, id_tratamiento?, id_sala?, motivo?
     */
    public function solicitar(array $actor, array $datos): int
    {
        $this->exigeRol($actor, ROLE_PATIENT);

        $datos['id_paciente']   = (int) $actor['id_usuario']; // nunca en nombre de otro
        $datos['origen']        = 'paciente';
        $datos['estado']        = 'programada';
        $datos['id_creado_por'] = (int) $actor['id_usuario'];

        return $this->crearCitaValidada($datos);
    }

    /**
     * La SECRETARÍA crea una cita para un paciente y doctor cualesquiera.
     * $datos: id_paciente, id_doctor, fecha, hora_inicio, id_tratamiento?, id_sala?, motivo?, estado?, coste?
     */
    public function crear(array $actor, array $datos): int
    {
        $this->exigeRol($actor, ROLE_SECRETARY);

        $datos['origen']        = 'secretaria';
        $datos['estado']        = $datos['estado'] ?? 'programada';
        $datos['id_creado_por'] = (int) $actor['id_usuario'];

        return $this->crearCitaValidada($datos);
    }

    /**
     * El DOCTOR completa su cita: estado -> completada + notas_clinicas (+ coste opcional).
     * Endpoint clave solicitado.
     */
    public function completar(array $actor, int $idCita, string $notasClinicas, ?float $coste = null): array
    {
        $this->exigeRol($actor, ROLE_DOCTOR);

        $cita = $this->repo->obtenerCruda($idCita);
        if ($cita === null) {
            throw new AppointmentException('Cita no encontrada', 404);
        }
        if ((int) $cita['id_doctor'] !== (int) $actor['id_usuario']) {
            throw new AppointmentException('Solo el doctor de la cita puede completarla.', 403);
        }
        if (in_array($cita['estado'], ['cancelada', 'no_asistio'], true)) {
            throw new AppointmentException('No se puede completar una cita cancelada o sin asistencia.', 409);
        }
        if (trim($notasClinicas) === '') {
            throw new AppointmentException('Las notas clínicas son obligatorias al completar.', 400);
        }

        $this->repo->completar($idCita, trim($notasClinicas), $coste);
        return $this->repo->obtenerPorId($idCita);
    }

    /**
     * Cambia el estado de una cita con reglas por rol:
     *   secretaria -> cualquier estado; doctor -> sus citas (confirmar/no_asistio/
     *   completar/cancelar); paciente -> cancelar solo su cita futura.
     */
    public function cambiarEstado(array $actor, int $idCita, string $estado): array
    {
        if (!in_array($estado, AppointmentRepository::ESTADOS_VALIDOS, true)) {
            throw new AppointmentException('Estado no válido.', 400);
        }
        $cita = $this->repo->obtenerCruda($idCita);
        if ($cita === null) {
            throw new AppointmentException('Cita no encontrada', 404);
        }

        $rol = $actor['role'] ?? '';
        $yo  = (int) $actor['id_usuario'];

        if ($rol === ROLE_SECRETARY) {
            // permitido cualquier estado
        } elseif ($rol === ROLE_DOCTOR) {
            if ((int) $cita['id_doctor'] !== $yo) {
                throw new AppointmentException('No es tu cita.', 403);
            }
            if (!in_array($estado, ['confirmada', 'completada', 'no_asistio', 'cancelada'], true)) {
                throw new AppointmentException('Transición no permitida para el doctor.', 403);
            }
        } elseif ($rol === ROLE_PATIENT) {
            if ((int) $cita['id_paciente'] !== $yo) {
                throw new AppointmentException('No es tu cita.', 403);
            }
            if ($estado !== 'cancelada') {
                throw new AppointmentException('Un paciente solo puede cancelar su cita.', 403);
            }
        } else {
            throw new AppointmentException('No autorizado', 403);
        }

        $this->repo->cambiarEstado($idCita, $estado);
        return $this->repo->obtenerPorId($idCita);
    }

    // =================================================================
    // Internos
    // =================================================================

    /** Valida datos + solape y crea la cita (comparte solicitar()/crear()). */
    private function crearCitaValidada(array $d): int
    {
        foreach (['id_paciente', 'id_doctor', 'fecha', 'hora_inicio'] as $req) {
            if (empty($d[$req])) {
                throw new AppointmentException("Falta el campo: $req", 400);
            }
        }
        if (!$this->repo->usuarioTieneRol((int) $d['id_doctor'], ROLE_DOCTOR)) {
            throw new AppointmentException('El doctor indicado no existe.', 400);
        }
        if (!$this->repo->usuarioTieneRol((int) $d['id_paciente'], ROLE_PATIENT)) {
            throw new AppointmentException('El paciente indicado no existe.', 400);
        }

        // Duración -> hora_fin
        $duracion = self::DUR_DEFAULT;
        if (!empty($d['id_tratamiento'])) {
            $dur = $this->repo->duracionTratamiento((int) $d['id_tratamiento']);
            if ($dur === null) {
                throw new AppointmentException('Tratamiento no válido.', 400);
            }
            $duracion = $dur;
        }

        $ini = DateTime::createFromFormat('!Y-m-d H:i', "{$d['fecha']} {$d['hora_inicio']}");
        if (!$ini) {
            throw new AppointmentException('Fecha u hora de inicio inválidas.', 400);
        }
        $fin = (clone $ini)->modify("+{$duracion} minutes");

        if ($ini <= new DateTime()) {
            throw new AppointmentException('La cita debe ser en el futuro.', 400);
        }
        $d['hora_inicio'] = $ini->format('H:i:s');
        $d['hora_fin']    = $fin->format('H:i:s');

        if ($this->repo->existeSolape((int) $d['id_doctor'], $d['fecha'], $d['hora_inicio'], $d['hora_fin'])) {
            throw new AppointmentException('Ese hueco ya está ocupado.', 409);
        }

        return $this->repo->crear($d);
    }

    private function exigeRol(array $actor, string $rol): void
    {
        if (($actor['role'] ?? '') !== $rol) {
            throw new AppointmentException('No autorizado', 403);
        }
    }

    /** El actor puede ver la cita si es la secretaría, o su doctor, o su paciente. */
    private function exigeAccesoCita(array $actor, array $cita): void
    {
        $rol = $actor['role'] ?? '';
        $yo  = (int) $actor['id_usuario'];
        $ok  = $rol === ROLE_SECRETARY
            || ($rol === ROLE_DOCTOR  && (int) $cita['id_doctor']   === $yo)
            || ($rol === ROLE_PATIENT && (int) $cita['id_paciente'] === $yo);
        if (!$ok) {
            throw new AppointmentException('No autorizado', 403);
        }
    }

    private function pisaOcupada(DateTime $ini, DateTime $fin, string $fecha, array $ocupadas): bool
    {
        foreach ($ocupadas as $oc) {
            $ocIni = DateTime::createFromFormat('!Y-m-d H:i:s', "$fecha {$oc['hora_inicio']}");
            $ocFin = DateTime::createFromFormat('!Y-m-d H:i:s', "$fecha {$oc['hora_fin']}");
            if ($ocIni && $ocFin && $ini < $ocFin && $fin > $ocIni) {
                return true;
            }
        }
        return false;
    }
}
