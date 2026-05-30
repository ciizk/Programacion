/*--------------------------------------------------------------------------------------------
Fichero: "insertarAsignatura.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que define el proxy del cliente que invoca la función
insertarAsignatura del servidor mediante POST /f/insertarAsignatura.
--------------------------------------------------------------------------------------------*/

// ---------------------------------------------------
// fake
// ---------------------------------------------------
function insertarAsignatura( datos, cb ) {

	llamar( "/f/insertarAsignatura", datos, cb )

} // ()
