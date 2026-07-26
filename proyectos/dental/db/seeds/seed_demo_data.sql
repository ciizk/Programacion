-- =====================================================================
-- seed_demo_data.sql  ·  Datos demo idempotentes · Clínica Dental
-- Importar EL ÚLTIMO (después de 001..004).
--
-- Contraseña demo (todos los usuarios): clinica123
-- (hash bcrypt real; las claves NUNCA se guardan en claro)
-- Roles: 1 paciente · 2 doctor · 3 secretaria
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Roles
INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
 (1,'paciente','Paciente de la clínica'),
 (2,'doctor','Odontólogo/a'),
 (3,'secretaria','Recepción y administración de la clínica')
ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol), descripcion=VALUES(descripcion);

-- ---------------------------------------------------------------------
-- Usuarios (login único) — pass demo: clinica123
--   1-2 secretaría · 3-5 doctores · 6-10 pacientes
INSERT INTO usuarios
 (id_usuario, dni, nombre, apellidos, email, contrasena_hash, id_rol, telefono, estado) VALUES
 (1 ,'21001001A','Marta','Ferrando Ortiz'   ,'recepcion@clinica-dental.es'  ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',3,'+34 962 000 001','activo'),
 (2 ,'21001002B','Pablo','Server Vidal'      ,'admin@clinica-dental.es'      ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',3,'+34 962 000 002','activo'),
 (3 ,'21002003C','Laura','Beltrán Ferrer'    ,'l.beltran@clinica-dental.es'  ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',2,'+34 962 000 003','activo'),
 (4 ,'21002004D','Sergio','Montesinos Gil'   ,'s.montesinos@clinica-dental.es','$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',2,'+34 962 000 004','activo'),
 (5 ,'21002005E','Nuria','Sanchis Roig'      ,'n.sanchis@clinica-dental.es'  ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',2,'+34 962 000 005','activo'),
 (6 ,'48111006F','Lucía','Torres Marí'       ,'lucia.torres@example.com'     ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',1,'+34 611 111 006','activo'),
 (7 ,'48111007G','Hugo','Escrivá Peiró'      ,'hugo.escriva@example.com'     ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',1,'+34 611 111 007','activo'),
 (8 ,'48111008H','Elena','Císcar Blai'       ,'elena.ciscar@example.com'     ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',1,'+34 611 111 008','activo'),
 (9 ,'48111009J','Andrés','Molina Fuster'    ,'andres.molina@example.com'    ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',1,'+34 611 111 009','activo'),
 (10,'48111010K','Carmen','Ruiz Sanchis'     ,'carmen.ruiz@example.com'      ,'$2y$10$8W.tcWH79ZYZdZ4Og15bROEfTON6enrMn30gfyCF9w.0HiuJxbtWW',1,'+34 611 111 010','activo')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellidos=VALUES(apellidos), id_rol=VALUES(id_rol), telefono=VALUES(telefono), estado=VALUES(estado);

-- ---------------------------------------------------------------------
-- Perfiles de SECRETARÍA (1-2)
INSERT INTO secretary_profiles (id_usuario, fecha_nacimiento, sexo, direccion, fecha_contratacion, salario, activo) VALUES
 (1,'1990-04-30','femenino','C/ Nueva 5, Gandía','2020-06-01',24000.00,TRUE),
 (2,'1988-01-12','masculino','Av. República Argentina 14, Gandía','2019-09-15',25000.00,TRUE)
ON DUPLICATE KEY UPDATE fecha_nacimiento=VALUES(fecha_nacimiento), sexo=VALUES(sexo), direccion=VALUES(direccion),
 fecha_contratacion=VALUES(fecha_contratacion), salario=VALUES(salario), activo=VALUES(activo);

-- Perfiles de DOCTOR (3-5)
INSERT INTO doctor_profiles (id_usuario, fecha_nacimiento, sexo, direccion, especialidad, num_colegiado, horario, salario, fecha_contratacion, activo) VALUES
 (3,'1982-05-09','femenino','C/ Roble 3, Gandía','Odontología general','COEV-4501','L-V 9:00-14:00',42000.00,'2021-03-01',TRUE),
 (4,'1979-12-18','masculino','Av. Blasco Ibáñez 88, Gandía','Ortodoncia','COEV-3820','L-X-V 10:00-18:00',48000.00,'2020-02-17',TRUE),
 (5,'1986-08-27','femenino','C/ Palma 21, Oliva','Endodoncia','COEV-5104','M-J 9:00-17:00',46000.00,'2022-01-10',TRUE)
ON DUPLICATE KEY UPDATE fecha_nacimiento=VALUES(fecha_nacimiento), sexo=VALUES(sexo), direccion=VALUES(direccion),
 especialidad=VALUES(especialidad), num_colegiado=VALUES(num_colegiado), horario=VALUES(horario),
 salario=VALUES(salario), fecha_contratacion=VALUES(fecha_contratacion), activo=VALUES(activo);

-- Perfiles de PACIENTE (6-10) — datos clínicos demo
INSERT INTO patient_profiles
 (id_usuario, fecha_nacimiento, sexo, direccion, grupo_sanguineo, alergias, enfermedades_cronicas, medicacion_actual, contacto_emergencia, seguro_medico, numero_poliza, fecha_registro, activo) VALUES
 (6 ,'1998-03-14','femenino','C/ Mayor 12, Gandía','0+','Penicilina','Ninguna','Ninguna','Ana Torres · +34 600 111 222','Adeslas','POL-100238','2025-11-15 10:00:00',TRUE),
 (7 ,'2001-07-22','masculino','Av. del Mar 45, Gandía','A+','Ninguna conocida','Asma leve','Salbutamol inhalador','Marc Escrivá · +34 600 333 444','Sanitas','POL-100477','2025-12-01 12:30:00',TRUE),
 (8 ,'1995-11-02','femenino','C/ Sol 7, Oliva','B-','Látex','Hipertensión','Enalapril 10mg','Luis Císcar · +34 600 555 666',NULL,NULL,'2026-01-20 09:15:00',TRUE),
 (9 ,'1990-06-08','masculino','C/ Del Pilar 30, Gandía','AB+','Ibuprofeno','Diabetes tipo 2','Metformina 850mg','Sara Molina · +34 600 777 888','DKV','POL-100912','2026-02-11 16:40:00',TRUE),
 (10,'1975-09-19','femenino','Av. d''Alacant 3, Gandía','A-','Ninguna conocida','Ninguna','Ninguna','José Ruiz · +34 600 999 000','Asisa','POL-101055','2026-03-05 11:05:00',TRUE)
ON DUPLICATE KEY UPDATE fecha_nacimiento=VALUES(fecha_nacimiento), sexo=VALUES(sexo), direccion=VALUES(direccion),
 grupo_sanguineo=VALUES(grupo_sanguineo), alergias=VALUES(alergias), enfermedades_cronicas=VALUES(enfermedades_cronicas),
 medicacion_actual=VALUES(medicacion_actual), contacto_emergencia=VALUES(contacto_emergencia),
 seguro_medico=VALUES(seguro_medico), numero_poliza=VALUES(numero_poliza), activo=VALUES(activo);

-- ---------------------------------------------------------------------
-- Salas / gabinetes
INSERT INTO salas (id_sala, nombre, descripcion, activo) VALUES
 (1,'Box 1','Gabinete polivalente',TRUE),
 (2,'Box 2','Gabinete polivalente',TRUE),
 (3,'Box 3','Gabinete de cirugía',TRUE)
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion), activo=VALUES(activo);

-- ---------------------------------------------------------------------
-- Catálogo de tratamientos (precio = Coming soon → NULL)
INSERT INTO treatments (id_tratamiento, codigo, nombre, categoria, descripcion, duracion_min, precio, activo) VALUES
 (1,'REV','Revisión y diagnóstico','Preventiva','Exploración y diagnóstico general.',20,NULL,TRUE),
 (2,'HIG','Limpieza dental (higiene)','Preventiva','Tartrectomía y profilaxis.',30,NULL,TRUE),
 (3,'OBT','Empaste (obturación)','Restauradora','Obturación con composite.',45,NULL,TRUE),
 (4,'END','Endodoncia','Restauradora','Tratamiento de conductos.',60,NULL,TRUE),
 (5,'ORT','Ortodoncia (revisión)','Ortodoncia','Control y ajuste de ortodoncia.',30,NULL,TRUE),
 (6,'EST','Blanqueamiento','Estética','Blanqueamiento dental en clínica.',60,NULL,TRUE),
 (7,'CIR','Extracción','Cirugía','Exodoncia simple.',40,NULL,TRUE)
ON DUPLICATE KEY UPDATE categoria=VALUES(categoria), descripcion=VALUES(descripcion), duracion_min=VALUES(duracion_min), activo=VALUES(activo);

-- ---------------------------------------------------------------------
-- Agendas de doctor (dia_semana: 1=lunes … 7=domingo)
INSERT INTO doctor_schedules (id_horario, id_doctor, dia_semana, hora_inicio, hora_fin, activo) VALUES
 (1 ,3,1,'09:00:00','14:00:00',TRUE),(2 ,3,2,'09:00:00','14:00:00',TRUE),(3 ,3,3,'09:00:00','14:00:00',TRUE),(4 ,3,4,'09:00:00','14:00:00',TRUE),(5 ,3,5,'09:00:00','14:00:00',TRUE),
 (6 ,4,1,'10:00:00','18:00:00',TRUE),(7 ,4,3,'10:00:00','18:00:00',TRUE),(8 ,4,5,'10:00:00','18:00:00',TRUE),
 (9 ,5,2,'09:00:00','17:00:00',TRUE),(10,5,4,'09:00:00','17:00:00',TRUE)
ON DUPLICATE KEY UPDATE hora_inicio=VALUES(hora_inicio), hora_fin=VALUES(hora_fin), activo=VALUES(activo);

-- ---------------------------------------------------------------------
-- Citas (hoy de referencia: 2026-07-23, jueves)
--   Pasadas completadas (con notas), confirmadas y programadas futuras.
INSERT INTO appointments
 (id_cita, id_paciente, id_doctor, id_tratamiento, id_sala, fecha, hora_inicio, hora_fin, motivo, estado, coste, notas_clinicas, origen, id_creado_por) VALUES
 (1, 6,3,2,1,'2026-07-20','09:30:00','10:00:00','Limpieza semestral','completada',45.00,'Tartrectomía completa. Buena higiene. Próxima revisión en 6 meses.','secretaria',1),
 (2, 7,5,4,3,'2026-07-21','10:00:00','11:00:00','Dolor molar inferior','completada',180.00,'Endodoncia en 3.6. Sin incidencias. Se cita para revisión en 2 semanas.','secretaria',1),
 (3, 8,3,1,1,'2026-07-24','09:00:00','09:20:00','Revisión general','confirmada',NULL,NULL,'secretaria',1),
 (4, 9,4,5,2,'2026-07-27','10:00:00','10:30:00','Ajuste de brackets','programada',NULL,NULL,'secretaria',1),
 (5,10,5,1,1,'2026-07-28','09:00:00','09:20:00','Primera visita','programada',NULL,NULL,'paciente',10),
 (6, 6,3,3,1,'2026-07-22','12:00:00','12:45:00','Empaste','cancelada',NULL,NULL,'paciente',6)
ON DUPLICATE KEY UPDATE estado=VALUES(estado), coste=VALUES(coste), notas_clinicas=VALUES(notas_clinicas), motivo=VALUES(motivo);

-- ---------------------------------------------------------------------
-- Anuncios
INSERT INTO anuncios (id_anuncio, id_autor, titulo, contenido, destinatario_tipo, fecha_envio, estado) VALUES
 (1,1,'Horario de verano','En agosto la clínica atenderá de 9:00 a 15:00.','todos','2026-07-01 09:00:00','activo'),
 (2,3,'Cuidados tras la higiene dental','Evita alimentos muy fríos o calientes durante las primeras horas.','pacientes','2026-07-20 13:00:00','activo')
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), contenido=VALUES(contenido), estado=VALUES(estado);

INSERT INTO anuncio_destinatarios (id_destinatario, id_anuncio, tipo_destinatario, id_rol, id_usuario) VALUES
 (1,2,'rol',1,NULL)
ON DUPLICATE KEY UPDATE tipo_destinatario=VALUES(tipo_destinatario);

INSERT INTO anuncio_lecturas (id_lectura, id_anuncio, id_usuario, leido, fecha_lectura) VALUES
 (1,1,6,TRUE,'2026-07-01 10:15:00')
ON DUPLICATE KEY UPDATE leido=VALUES(leido), fecha_lectura=VALUES(fecha_lectura);

-- ---------------------------------------------------------------------
-- Mensajes (paciente ↔ doctor, ligados a una cita)
INSERT INTO mensajes (id_mensaje, id_emisor, id_receptor, id_cita, id_mensaje_respuesta, tipo_mensaje, asunto, contenido, fecha_envio, leido, fecha_lectura) VALUES
 (1, 7,5,2,NULL,'consulta','Molestias tras endodoncia','Tengo algo de sensibilidad, ¿es normal?','2026-07-21 18:00:00',TRUE,'2026-07-21 19:00:00'),
 (2, 5,7,2,1  ,'consulta','Re: Molestias tras endodoncia','Es normal los primeros días. Si persiste, avísanos.','2026-07-21 19:05:00',FALSE,NULL)
ON DUPLICATE KEY UPDATE asunto=VALUES(asunto), contenido=VALUES(contenido), leido=VALUES(leido);

-- ---------------------------------------------------------------------
-- Eventos de calendario (citas + festivo manual)
INSERT INTO eventos_calendario (id_evento, id_creador, id_cita, titulo, descripcion, tipo_evento, fecha_inicio, fecha_fin, visibilidad, origen_tipo) VALUES
 (1,1,3,'Cita · Elena Císcar','Revisión general','cita','2026-07-24 09:00:00','2026-07-24 09:20:00','publico','cita'),
 (2,1,4,'Cita · Andrés Molina','Ajuste de brackets','cita','2026-07-27 10:00:00','2026-07-27 10:30:00','publico','cita'),
 (3,2,NULL,'Festivo local','Clínica cerrada','festivo','2026-10-09 00:00:00',NULL,'publico','manual')
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), descripcion=VALUES(descripcion), visibilidad=VALUES(visibilidad);

-- ---------------------------------------------------------------------
-- FAQ (autor: secretaría)
INSERT INTO faq (id_faq, pregunta, respuesta, orden, activo, id_usuario) VALUES
 (1,'¿Cómo pido una cita?','Desde tu área de paciente, en "Solicitar cita", eliges tratamiento, doctor y un hueco libre.',1,TRUE,1),
 (2,'¿Puedo cambiar o cancelar mi cita?','Sí, desde "Mis citas" o llamando a recepción con al menos 24h de antelación.',2,TRUE,1)
ON DUPLICATE KEY UPDATE respuesta=VALUES(respuesta), orden=VALUES(orden), activo=VALUES(activo);

-- ---------------------------------------------------------------------
-- Contacto de la clínica (web informativa)
INSERT INTO contacto_clinica (id_contacto, email, telefono, direccion, horario, descripcion, id_usuario) VALUES
 (1,'info@clinica-dental.es','+34 962 84 90 00','Carrer del Paranimf, 1, 46730 Gandía, Valencia','Lunes a viernes, 9:00 a 20:00','Clínica dental en Gandía. Pide tu cita online.',1)
ON DUPLICATE KEY UPDATE email=VALUES(email), telefono=VALUES(telefono), direccion=VALUES(direccion), horario=VALUES(horario), descripcion=VALUES(descripcion);
