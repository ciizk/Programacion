/*--------------------------------------------------------------------------------------------
Fichero: "otrasOperaciones.sql"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: ejemplos de otras operaciones SQL: borrar una fila, actualizar una fila sin
borrarla, vaciar una tabla y borrar una tabla entera.
--------------------------------------------------------------------------------------------*/

-- borrar una persona
delete from Persona where dni = '20123458C';

-- cambiar los apellidos de otra (sin tener que borrarla y volver a meterla)
update Persona set apellidos = 'Perez Lopez' where dni = '20123457B';

-- vaciar la tabla matricula (sigue existiendo, vacia)
delete from Matricula;

-- borrar la tabla entera (lo dejo comentado para no romper la bd)
-- drop table Matricula;
