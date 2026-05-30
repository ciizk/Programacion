-- consultaTresTablas.sql
-- Ejercicio Sección 1: consulta que involucra 3 tablas.
-- Obtener el nombre de todas las personas matriculadas de "Programacion 2".
select Persona.nombre
  from Persona, Matricula, Asignatura
 where Asignatura.nombre = 'Programacion 2'
   and Matricula.codigo  = Asignatura.codigo
   and Matricula.dni     = Persona.dni;
