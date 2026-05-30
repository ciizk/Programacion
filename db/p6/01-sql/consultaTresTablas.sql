-- ejercicio: nombre de los matriculados en Programacion 2
-- (involucra las 3 tablas)

select Persona.nombre
  from Persona, Matricula, Asignatura
 where Asignatura.nombre = 'Programacion 2'
   and Matricula.codigo  = Asignatura.codigo
   and Matricula.dni     = Persona.dni;
