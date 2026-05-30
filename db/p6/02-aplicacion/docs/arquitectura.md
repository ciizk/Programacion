Notas de diseño
===============

Esquema de tablas
-----------------

Persona(dni, nombre, apellidos)
   pk: dni

Asignatura(codigo, nombre)
   pk: codigo

Matricula(dni, codigo)
   pk: (dni, codigo)
   fk: dni    -> Persona(dni)
   fk: codigo -> Asignatura(codigo)


Funciones de la logica
----------------------

Cada una vive en su propio fichero dentro de logica/funciones/.
El cargador.js las descubre solas y les inyecta la conexion a la bd.

    prueba                                    ()                       -> texto
    borrarFilasDeTodasLasTablas               ()                       ->
    insertarPersona                           {dni, nombre, apellidos} ->
    buscarPersonaConDNI                       {dni}                    -> [persona]
    insertarAsignatura                        {codigo, nombre}         ->
    matricular                                {dni, codigo}            ->
    buscarAsignaturasDePersonaPorApellidos    {apellidos}              -> [asignatura]
    cerrarConexion                            ()                       ->


Reglas REST
-----------

GET  /prueba                  -> devuelve "¡Funciona!"
POST /f/<nombreFuncion>       -> llama a esa funcion de la logica.
                                 Argumentos en el body (JSON).
                                 Devuelve lo que devuelva la funcion.

Lo de tener una sola regla es para no tener que tocar el servidor cada vez
que añado una funcion nueva. Rompe un poco la idea REST pero a cambio
todo lo que hay en logica/funciones/ queda expuesto solo.


UX
--

Aplicacion.html: formularios con dni, nombre, apellidos, codigo, etc. y
botones para llamar a cada funcion.

ux/logicaFake/llamar.js: el proxy que hace XMLHttpRequest contra
POST /f/<nombre>.

ux/logicaFake/<funcion>.js: una "fachada" por cada funcion, asi desde
los handlers del HTML llamo a insertarPersona(...) como si la tuviera
en local.
