-- crearAsignatura.sql

create table Asignatura (
    codigo char(8)     not null,
    nombre varchar(40) not null,
    primary key (codigo)
);
