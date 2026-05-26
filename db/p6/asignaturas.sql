-- asignaturas.sql
CREATE TABLE Asignaturas (
  codigo   TEXT PRIMARY KEY,
  nombre   TEXT NOT NULL,
  creditos INTEGER NOT NULL
);

INSERT INTO Asignaturas VALUES ('PRG2', 'Programación 2', 6);
INSERT INTO Asignaturas VALUES ('BBDD', 'Bases de Datos', 6);