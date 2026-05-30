/*--------------------------------------------------------------------------------------------
Fichero: "buscarAsignaturasDePersonaPorApellidos.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que define el proxy del cliente que invoca la función
buscarAsignaturasDePersonaPorApellidos del servidor mediante POST
/f/buscarAsignaturasDePersonaPorApellidos.
--------------------------------------------------------------------------------------------*/

// ---------------------------------------------------
// fake
// ---------------------------------------------------
function buscarAsignaturasDePersonaPorApellidos( datos, cb ) {

	llamar( "/f/buscarAsignaturasDePersonaPorApellidos", datos, cb )

} // ()
