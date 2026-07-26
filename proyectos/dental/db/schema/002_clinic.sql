-- =====================================================================
-- 002_clinic.sql  ·  Módulo clínico dental
-- Perfiles (1:1 con usuarios), salas, tratamientos, agendas y CITAS.
-- Importar DESPUÉS de 001.
--
-- Patrón de personas: Class-Table Inheritance.
--   usuarios = columna vertebral (identidad + auth); cada *_profiles la
--   EXTIENDE 1:1 con los datos propios del rol.
-- =====================================================================
SET NAMES utf8mb4;

-- =====================================================================
-- PERFILES (1:1 con usuarios)
-- =====================================================================

-- PatientProfile · (antes: Student)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id_perfil_paciente    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    fecha_nacimiento      DATE NULL,
    sexo                  ENUM('masculino','femenino','otro','no_especificado') NOT NULL DEFAULT 'no_especificado',
    direccion             VARCHAR(255) NULL,
    grupo_sanguineo       ENUM('A+','A-','B+','B-','AB+','AB-','0+','0-','desconocido') NOT NULL DEFAULT 'desconocido',
    alergias              MEDIUMTEXT NULL,
    enfermedades_cronicas MEDIUMTEXT NULL,
    medicacion_actual     MEDIUMTEXT NULL,
    contacto_emergencia   VARCHAR(255) NULL,
    seguro_medico         VARCHAR(150) NULL,
    numero_poliza         VARCHAR(100) NULL,
    fecha_registro        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo                BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_patient_usuario (id_usuario),
    CONSTRAINT fk_patient_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DoctorProfile · (antes: Teacher)
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id_perfil_doctor   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario         INT NOT NULL,
    fecha_nacimiento   DATE NULL,
    sexo               ENUM('masculino','femenino','otro','no_especificado') NOT NULL DEFAULT 'no_especificado',
    direccion          VARCHAR(255) NULL,
    especialidad       VARCHAR(150) NULL,          -- Odontología general, Ortodoncia, Endodoncia…
    num_colegiado      VARCHAR(50)  NULL,          -- nº de colegiado (licencia)
    horario            VARCHAR(255) NULL,          -- resumen legible; la agenda real va en doctor_schedules
    salario            DECIMAL(10,2) NULL,
    fecha_contratacion DATE NULL,
    activo             BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_doctor_usuario (id_usuario),
    CONSTRAINT fk_doctor_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SecretaryProfile · (antes: Admin/Bedel)
CREATE TABLE IF NOT EXISTS secretary_profiles (
    id_perfil_secretaria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario         INT NOT NULL,
    fecha_nacimiento   DATE NULL,
    sexo               ENUM('masculino','femenino','otro','no_especificado') NOT NULL DEFAULT 'no_especificado',
    direccion          VARCHAR(255) NULL,
    fecha_contratacion DATE NULL,
    salario            DECIMAL(10,2) NULL,
    activo             BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_secretary_usuario (id_usuario),
    CONSTRAINT fk_secretary_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- RECURSOS DE AGENDA
-- =====================================================================

-- salas · gabinetes/boxes donde se atiende
CREATE TABLE IF NOT EXISTS salas (
    id_sala     INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_salas_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- treatments · catálogo de tratamientos/servicios
--   NOTA MVP: catálogo completo y PRECIOS son "Coming soon"
--   (ver db/docs/treatments_catalog.md). 'precio' es NULL-able a propósito.
--   'duracion_min' se usa para calcular los huecos disponibles de agenda.
CREATE TABLE IF NOT EXISTS treatments (
    id_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
    codigo         VARCHAR(50)  NULL,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    TEXT NULL,
    categoria      VARCHAR(100) NULL,              -- Preventiva, Restauradora, Estética, Cirugía, Ortodoncia…
    duracion_min   INT NOT NULL DEFAULT 30,
    precio         DECIMAL(10,2) NULL,             -- Coming soon
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_treatments_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- doctor_schedules · franjas de disponibilidad semanal de cada doctor
--   Base para "ver horarios disponibles" (autoservicio del paciente):
--   los huecos libres = franjas - citas ya ocupadas.
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id_horario  INT AUTO_INCREMENT PRIMARY KEY,
    id_doctor   INT NOT NULL,                       -- FK usuarios (rol doctor)
    dia_semana  TINYINT NOT NULL,                   -- 1=lunes … 7=domingo (ISO-8601)
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    KEY idx_sched_doctor (id_doctor, dia_semana),
    CONSTRAINT fk_sched_doctor FOREIGN KEY (id_doctor)
        REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- appointments · CITAS (tabla central · sustituye a matriculas)
-- Ciclo de estado: programada → confirmada → completada
--                                 ↘ cancelada / no_asistio
-- 'notas_clinicas' las rellena el doctor al completar la cita.
-- =====================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id_cita             INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente         INT NOT NULL,               -- FK usuarios (rol paciente)
    id_doctor           INT NOT NULL,               -- FK usuarios (rol doctor)
    id_tratamiento      INT NULL,                   -- FK treatments
    id_sala             INT NULL,                   -- FK salas
    fecha               DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    motivo              VARCHAR(255) NULL,
    estado              ENUM('programada','confirmada','completada','cancelada','no_asistio') NOT NULL DEFAULT 'programada',
    coste               DECIMAL(10,2) NULL,
    notas_clinicas      MEDIUMTEXT NULL,
    origen              ENUM('secretaria','paciente','doctor') NOT NULL DEFAULT 'secretaria',  -- quién la solicitó
    id_creado_por       INT NULL,                   -- FK usuarios (auditoría)
    fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_appt_doctor_fecha   (id_doctor, fecha),
    KEY idx_appt_paciente_fecha (id_paciente, fecha),
    KEY idx_appt_estado         (estado),
    CONSTRAINT fk_appt_paciente    FOREIGN KEY (id_paciente)    REFERENCES usuarios(id_usuario)      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor      FOREIGN KEY (id_doctor)      REFERENCES usuarios(id_usuario)      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appt_tratamiento FOREIGN KEY (id_tratamiento) REFERENCES treatments(id_tratamiento) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_appt_sala        FOREIGN KEY (id_sala)        REFERENCES salas(id_sala)             ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_appt_creado_por  FOREIGN KEY (id_creado_por)  REFERENCES usuarios(id_usuario)      ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
