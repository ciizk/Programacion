-- =====================================================================
-- 001_core.sql  ·  Núcleo: identidad, autenticación y archivos
-- Clínica Dental · esquema unificado (sustituye a gti_/doa_).
--
-- Un ÚNICO login para toda la plataforma (web informativa -> gestión).
-- 'usuarios' fusiona las antiguas gti_usuarios + doa_usuarios.
--
-- Convención: identificadores en inglés donde son conceptos nuevos;
-- columnas en snake_case español, como el resto del proyecto.
-- Motor InnoDB · utf8mb4_unicode_ci · CREATE TABLE IF NOT EXISTS.
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- roles · tipos de persona de la clínica
CREATE TABLE IF NOT EXISTS roles (
    id_rol      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol  ENUM('paciente','doctor','secretaria') NOT NULL,
    descripcion TEXT NULL,
    UNIQUE KEY uq_roles_nombre (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- usuarios · tabla ÚNICA de identidad + autenticación (login único)
--   - Pacientes captados desde la web informativa y personal de la clínica
--     comparten esta tabla; el rol decide a qué panel se enruta.
--   - 'dni' es NULL-able: un lead puede registrarse solo con email y
--     completar sus datos al convertirse en paciente.
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario              INT AUTO_INCREMENT PRIMARY KEY,
    dni                     VARCHAR(30)  NULL,           -- DNI/NIE/pasaporte
    nombre                  VARCHAR(100) NOT NULL,
    apellidos               VARCHAR(150) NOT NULL,
    email                   VARCHAR(150) NOT NULL,
    contrasena_hash         VARCHAR(255) NOT NULL,
    id_rol                  INT NOT NULL,
    telefono                VARCHAR(30)  NULL,
    foto_perfil             VARCHAR(255) NULL,
    notificaciones_email    BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,  -- recordatorios/seguimiento (visión: WhatsApp)
    estado                  ENUM('activo','inactivo','baja') NOT NULL DEFAULT 'activo',
    fecha_creacion          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuarios_email (email),
    UNIQUE KEY uq_usuarios_dni (dni),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- archivos · tabla central de ficheros (radiografías, documentos, fotos…)
-- Gancho para la visión: expedientes con archivos/fotografías/recetas.
CREATE TABLE IF NOT EXISTS archivos (
    id_archivo      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    ruta            VARCHAR(255) NOT NULL,
    tipo            VARCHAR(100) NOT NULL,
    extension       VARCHAR(20)  NOT NULL,
    tamano_bytes    INT NOT NULL,
    id_usuario      INT NULL,
    fecha_subida    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_archivos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- remember_tokens · "recuérdame" (selector público + hash)
CREATE TABLE IF NOT EXISTS remember_tokens (
    id_token         INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    selector         VARCHAR(100) NOT NULL,
    token_hash       VARCHAR(255) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revocado         BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_remember_selector (selector),
    CONSTRAINT fk_remember_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- recuperacion_contrasena · tokens de reseteo
CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
    id_recuperacion  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    token_hash       VARCHAR(255) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado            BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recup_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
