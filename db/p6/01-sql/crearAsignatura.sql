/*--------------------------------------------------------------------------------------------
Fichero: "crearAsignatura.sql"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: script que crea la tabla Asignatura en la base de datos.
--------------------------------------------------------------------------------------------*/

create table Asignatura (
    codigo char(8)     not null,
    nombre varchar(40) not null,
    primary key (codigo)
);
