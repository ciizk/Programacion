/*--------------------------------------------------------------------------------------------
Fichero: "consultas.sql"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: script con varias consultas SQL de prueba sobre la tabla Persona y la consulta
de los matriculados en una asignatura concreta (usa 2 tablas).
--------------------------------------------------------------------------------------------*/

-- toda la tabla Persona
select * from Persona;

-- solo los apellidos
select apellidos from Persona;

-- la persona apellidada Garcia
select * from Persona where apellidos = 'Garcia';

-- apellidos de los matriculados en 13928 (2 tablas)
select Persona.apellidos
  from Persona, Matricula
 where Matricula.codigo = '13928'
   and Matricula.dni    = Persona.dni;
