-- consultas.sql
-- Consultas de ejemplo de la Sección 1 del enunciado

-- 1) Obtener toda la información de la tabla Persona
select * from Persona;

-- 2) Obtener solo los apellidos de todas las personas
select apellidos from Persona;

-- 3) Obtener los datos de la persona apellidada "Garcia"
select * from Persona where apellidos = 'Garcia';

-- 4) Apellidos de las personas matriculadas en la asignatura cuyo código es 13928
select Persona.apellidos
  from Persona, Matricula
 where Matricula.codigo = '13928'
   and Matricula.dni    = Persona.dni;
