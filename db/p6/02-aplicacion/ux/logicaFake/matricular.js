/*--------------------------------------------------------------------------------------------
Fichero: "matricular.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que define el proxy del cliente que invoca la función matricular del
servidor mediante POST /f/matricular.
--------------------------------------------------------------------------------------------*/

// ---------------------------------------------------
// fake
// ---------------------------------------------------
function matricular( datos, cb ) {

	llamar( "/f/matricular", datos, cb )

} // ()
