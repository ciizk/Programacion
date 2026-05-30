-- ejercicios sueltos: borrar una fila, actualizar, borrar tabla...

-- borrar una persona
delete from Persona where dni = '20123458C';

-- cambiar los apellidos de otra (sin tener que borrarla y volver a meterla)
update Persona set apellidos = 'Perez Lopez' where dni = '20123457B';

-- vaciar la tabla matricula (sigue existiendo, vacia)
delete from Matricula;

-- borrar la tabla entera (lo dejo comentado para no romper la bd)
-- drop table Matricula;
