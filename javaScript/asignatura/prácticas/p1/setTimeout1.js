/*--------------------------------------------------------------------------------------------
Fichero: setTimeout1.js
Autor: Francisco Indriago
Fecha: 10/02/2026
Descripción: Imprimir 2 mensajes, el segundo mensaje con un delay de 2 segundos
--------------------------------------------------------------------------------------------*/

//Espera 2000ms para realizar la acción indicada. 
setTimeout ( function () {
console.log (" hola 1 ");
}, 2000 )

//Espera 4000ms para realizar la acción indicada. 
setTimeout ( function () {
console.log (" hola 2 ");
}, 4000 )

//----------------------------------------------------------------------
//  Respuesta: se imprimirá el "hola 2", 2 segundos despues.
//--------------------------------------------------------------