/*--------------------------------------------------------------------------------------------
Fichero: setTimeout.js
Autor: Francisco Indriago
Fecha: 10/02/2026
Descripción: Espera 2 segundos para imprimir ambos mensajes
--------------------------------------------------------------------------------------------*/


//Espera 2000ms para realizar la acción indicada. 
//En este caso: imprimir en consola hola 1.
setTimeout ( function () {
console.log (" hola 1 ");
}, 2000 )

//Espera 2000ms para realizar la acción indicada. 
//En este caso: imprimir en consola hola 2.
setTimeout ( function () {
console.log (" hola 2 ");
}, 2000 )

//----------------------------------------------------------------------
//  Respuesta: como esperan el mismo tiempo, se imprimirán a la vez.
//----------------------------------------------------------------------