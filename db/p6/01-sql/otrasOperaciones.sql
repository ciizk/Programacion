-- otrasOperaciones.sql
-- Ejercicio Sección 1: otras operaciones de SQL.

-- Borrar una fila concreta
delete from Persona where dni = '20123458C';

-- Actualizar una fila sin borrar/reinsertar
update Persona set apellidos = 'Perez Lopez' where dni = '20123457B';

-- Borrar todas las filas de una tabla (la tabla sigue existiendo)
delete from Matricula;

-- Eliminar una tabla por completo
-- drop table Matricula;
