-- =====================================================================
-- 003_communication.sql  ·  Comunicación y agenda de la clínica
-- Reutiliza el módulo de comunicación educativo, adaptado al dominio
-- dental (se retiran las FKs a asignaturas/grupos; se añade enlace a citas).
-- Importar DESPUÉS de 002.
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- anuncios · comunicados de la clínica (a todos o por rol)
CREATE TABLE IF NOT EXISTS anuncios (
    id_anuncio        INT AUTO_INCREMENT PRIMARY KEY,
    id_autor          INT NOT NULL,
    titulo            VARCHAR(150) NOT NULL,
    contenido         MEDIUMTEXT NOT NULL,
    destinatario_tipo ENUM('todos','pacientes','doctores','secretaria') NOT NULL DEFAULT 'todos',
    fecha_envio       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_programada  DATETIME NULL,
    estado            ENUM('activo','planificado') NOT NULL DEFAULT 'activo',
    CONSTRAINT fk_ann_autor FOREIGN KEY (id_autor) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- anuncio_destinatarios · segmentación fina (por rol o usuario concreto)
CREATE TABLE IF NOT EXISTS anuncio_destinatarios (
    id_destinatario   INT AUTO_INCREMENT PRIMARY KEY,
    id_anuncio        INT NOT NULL,
    tipo_destinatario ENUM('rol','usuario') NOT NULL,
    id_rol            INT NULL,
    id_usuario        INT NULL,
    CONSTRAINT fk_annd_anuncio FOREIGN KEY (id_anuncio) REFERENCES anuncios(id_anuncio) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_annd_rol     FOREIGN KEY (id_rol)     REFERENCES roles(id_rol)         ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_annd_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)   ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- anuncio_lecturas · control de leído por usuario
CREATE TABLE IF NOT EXISTS anuncio_lecturas (
    id_lectura    INT AUTO_INCREMENT PRIMARY KEY,
    id_anuncio    INT NOT NULL,
    id_usuario    INT NOT NULL,
    leido         BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura DATETIME NULL,
    UNIQUE KEY uq_ann_lectura (id_anuncio, id_usuario),
    CONSTRAINT fk_annl_anuncio FOREIGN KEY (id_anuncio) REFERENCES anuncios(id_anuncio) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_annl_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)  ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- mensajes · 1 emisor + 1 receptor (paciente ↔ doctor/secretaría)
-- Puede referirse opcionalmente a una cita concreta.
CREATE TABLE IF NOT EXISTS mensajes (
    id_mensaje           INT AUTO_INCREMENT PRIMARY KEY,
    id_emisor            INT NOT NULL,
    id_receptor          INT NOT NULL,
    id_cita              INT NULL,
    id_mensaje_respuesta INT NULL,
    tipo_mensaje         ENUM('consulta','cita','incidencia','otros') NOT NULL DEFAULT 'consulta',
    asunto               VARCHAR(150) NOT NULL,
    contenido            MEDIUMTEXT NOT NULL,
    fecha_envio          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido                BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura        DATETIME NULL,
    CONSTRAINT fk_msg_emisor    FOREIGN KEY (id_emisor)            REFERENCES usuarios(id_usuario)   ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_msg_receptor  FOREIGN KEY (id_receptor)          REFERENCES usuarios(id_usuario)   ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_msg_cita      FOREIGN KEY (id_cita)              REFERENCES appointments(id_cita)  ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_msg_respuesta FOREIGN KEY (id_mensaje_respuesta) REFERENCES mensajes(id_mensaje)   ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- eventos_calendario · agenda general (las citas alimentan el calendario)
CREATE TABLE IF NOT EXISTS eventos_calendario (
    id_evento    INT AUTO_INCREMENT PRIMARY KEY,
    id_creador   INT NOT NULL,
    id_cita      INT NULL,
    titulo       VARCHAR(150) NOT NULL,
    descripcion  TEXT NULL,
    tipo_evento  ENUM('cita','recordatorio','reunion','festivo','otro') NOT NULL DEFAULT 'otro',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin    DATETIME NULL,
    visibilidad  ENUM('publico','solo_doctores','solo_secretaria','privado_creador') NOT NULL DEFAULT 'publico',
    origen_tipo  ENUM('manual','cita') NOT NULL DEFAULT 'manual',
    CONSTRAINT fk_eve_creador FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)  ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_eve_cita    FOREIGN KEY (id_cita)    REFERENCES appointments(id_cita) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- faq · preguntas frecuentes (web informativa / panel)
CREATE TABLE IF NOT EXISTS faq (
    id_faq     INT AUTO_INCREMENT PRIMARY KEY,
    pregunta   VARCHAR(255) NOT NULL,
    respuesta  MEDIUMTEXT NOT NULL,
    orden      INT NOT NULL DEFAULT 0,
    activo     BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_faq_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- contacto_clinica · datos de contacto públicos (antes: contacto_secretaria)
CREATE TABLE IF NOT EXISTS contacto_clinica (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(150) NOT NULL,
    telefono    VARCHAR(30)  NOT NULL,
    direccion   VARCHAR(255) NULL,
    horario     VARCHAR(150) NULL,
    descripcion TEXT NULL,
    id_usuario  INT NOT NULL,
    CONSTRAINT fk_contacto_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
