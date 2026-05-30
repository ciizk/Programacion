Practica 6 - PRG2
=================

Apuntes y codigo de la practica de bases de datos, logica y servidor REST.

He partido en dos carpetas para tenerlo mas claro:

  01-sql/         lo de la seccion 1 (SQL puro con sqlite3)
  02-aplicacion/  el resto (logica en node + servidor REST + pagina web)


01-sql/
-------

Aqui estan los scripts que vamos ejecutando con:

    ./sqlite3 datos.bd < fichero.sql

Orden en el que los ejecute:

    1. crearPersona.sql
    2. crearAsignatura.sql
    3. crearMatricula.sql
    4. insertarPersonas.sql
    5. insertarAsignaturas.sql
    6. insertarMatricula.sql

Y luego para probar consultas:

    consultas.sql          -> select * from Persona, etc.
    consultaTresTablas.sql -> el ejercicio de los matriculados en Prog 2
    otrasOperaciones.sql   -> delete, update, drop (lo del ultimo ejercicio)


02-aplicacion/
--------------

Estructura que pide el guion:

    bd/           la base de datos
    logica/       Logica.js (aqui esta como cargador + funciones sueltas)
    servidorREST/ el servidor express
    ux/           la pagina web del usuario
    docs/         notas de diseño

Para arrancarlo todo (la primera vez):

    cd logica && npm install
    cd ../servidorREST && npm install

Para probar la logica sola:

    cd logica
    npm test

Para arrancar el servidor:

    cd servidorREST
    npm run servidor

Y desde otra ventana:

    npm test                       (para los tests automaticos)
    http://localhost:8080/Aplicacion.html   (para usar la app)


Notas
-----

- Mis nuevas funciones de la logica (las de los ejercicios 1, 2 y 3 de la
  seccion 2.2) son:
    insertarAsignatura
    matricular
    buscarAsignaturasDePersonaPorApellidos

  Sus tests estan en logica/test/mainTest2.js, mainTest3.js y mainTest4.js.

- En el servidor REST, en vez de tener una regla por funcion, hay una sola
  regla universal POST /f/<nombreFuncion> y eso reenvia a la funcion de la
  logica con el body como argumento. Asi cada funcion nueva queda expuesta
  automaticamente, no hace falta tocar ReglasREST.

- En la web (ux/) cada boton llama a un "fake" en logicaFake/ que en
  realidad hace POST /f/... al servidor. Asi el codigo de la pagina parece
  que esta llamando directamente a la logica.
