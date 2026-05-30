/*--------------------------------------------------------------------------------------------
Fichero: "consultaTresTablas.sql"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: consulta SQL que devuelve el nombre de las personas matriculadas en la
asignatura "Programacion 2" usando las 3 tablas (Persona, Matricula y Asignatura).
--------------------------------------------------------------------------------------------*/

select Persona.nombre
  from Persona, Matricula, Asignatura
 where Asignatura.nombre = 'Programacion 2'
   and Matricula.codigo  = Asignatura.codigo
   and Matricula.dni     = Persona.dni;
