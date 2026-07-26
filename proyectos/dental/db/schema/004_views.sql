-- =====================================================================
-- 004_views.sql  ·  Vistas de solo lectura (consultas comunes)
-- Importar DESPUÉS de 003 (último paso de schema, antes del seed).
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- vw_usuarios_roles · usuario + etiqueta de rol
CREATE OR REPLACE VIEW vw_usuarios_roles AS
SELECT  u.id_usuario,
        u.dni,
        u.nombre,
        u.apellidos,
        u.email,
        r.nombre_rol AS rol,
        u.telefono,
        u.estado,
        u.fecha_creacion
FROM usuarios u
JOIN roles r ON r.id_rol = u.id_rol;

-- ---------------------------------------------------------------------
-- Entidades de persona completas (columna vertebral ⋈ perfil)
-- ---------------------------------------------------------------------

-- vw_patient_profiles · PatientProfile completo
CREATE OR REPLACE VIEW vw_patient_profiles AS
SELECT  u.id_usuario                       AS id,
        CONCAT(u.nombre, ' ', u.apellidos) AS name,
        p.fecha_nacimiento,
        p.sexo,
        u.dni,
        u.telefono,
        u.email,
        p.direccion,
        p.grupo_sanguineo,
        p.alergias,
        p.enfermedades_cronicas,
        p.medicacion_actual,
        p.contacto_emergencia,
        p.seguro_medico,
        p.numero_poliza,
        p.fecha_registro,
        p.activo
FROM usuarios u
JOIN patient_profiles p ON p.id_usuario = u.id_usuario;

-- vw_doctor_profiles · DoctorProfile completo
CREATE OR REPLACE VIEW vw_doctor_profiles AS
SELECT  u.id_usuario                       AS id,
        CONCAT(u.nombre, ' ', u.apellidos) AS name,
        d.fecha_nacimiento,
        d.sexo,
        u.dni,
        u.telefono,
        u.email,
        d.direccion,
        d.especialidad,
        d.num_colegiado,
        d.horario,
        d.salario,
        d.fecha_contratacion,
        d.activo
FROM usuarios u
JOIN doctor_profiles d ON d.id_usuario = u.id_usuario;

-- vw_secretary_profiles · SecretaryProfile completo
CREATE OR REPLACE VIEW vw_secretary_profiles AS
SELECT  u.id_usuario                       AS id,
        CONCAT(u.nombre, ' ', u.apellidos) AS name,
        s.fecha_nacimiento,
        s.sexo,
        u.dni,
        u.telefono,
        u.email,
        s.direccion,
        s.fecha_contratacion,
        s.salario,
        s.activo
FROM usuarios u
JOIN secretary_profiles s ON s.id_usuario = u.id_usuario;

-- ---------------------------------------------------------------------
-- vw_appointments · VISTA CENTRAL (cita + paciente + doctor + tratamiento + sala)
CREATE OR REPLACE VIEW vw_appointments AS
SELECT  a.id_cita,
        a.fecha,
        a.hora_inicio,
        a.hora_fin,
        a.estado,
        a.motivo,
        a.coste,
        a.notas_clinicas,
        a.origen,
        a.id_paciente,
        CONCAT(pu.nombre, ' ', pu.apellidos) AS paciente_nombre,
        pu.telefono                          AS paciente_telefono,
        a.id_doctor,
        CONCAT(du.nombre, ' ', du.apellidos) AS doctor_nombre,
        dp.especialidad                      AS doctor_especialidad,
        a.id_tratamiento,
        t.nombre                             AS tratamiento_nombre,
        t.duracion_min                       AS tratamiento_duracion_min,
        a.id_sala,
        s.nombre                             AS sala_nombre,
        a.fecha_creacion,
        a.fecha_actualizacion
FROM appointments a
JOIN usuarios pu       ON pu.id_usuario   = a.id_paciente
JOIN usuarios du       ON du.id_usuario   = a.id_doctor
LEFT JOIN doctor_profiles dp ON dp.id_usuario = a.id_doctor
LEFT JOIN treatments t ON t.id_tratamiento = a.id_tratamiento
LEFT JOIN salas s      ON s.id_sala        = a.id_sala;

-- ---------------------------------------------------------------------
-- vw_treatments_activos · catálogo publicable
CREATE OR REPLACE VIEW vw_treatments_activos AS
SELECT t.id_tratamiento, t.codigo, t.nombre, t.categoria, t.descripcion, t.duracion_min, t.precio
FROM treatments t
WHERE t.activo = TRUE;
