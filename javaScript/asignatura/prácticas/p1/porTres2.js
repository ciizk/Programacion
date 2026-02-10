/*--------------------------------------------------------------------------------------------
Fichero: porTres2.js
Autor: Francisco Indriago
Fecha: 10/02/2026
Descripción: Función que recibe un callback de la fucnión porTres y lo devuelve.
--------------------------------------------------------------------------------------------*/

function porTres(a, callback) {

  //  Calculamos el resultado multiplicando a por 3
  let resultado = a * 3;

  //  Devolvemos el resultado usando el callback
  callback(resultado);
}

//----------------------------------------------------------
//  Prueba:

//  Asignamos un valor a la variable a
let a = 1;

//----------------------------------------------------------
//  Llamamos a la función porTres
//  El resultado se recibe en el callback
porTres(a, function (res) {

  //  Comprobamos si el resultado es correcto
  //  Si el resultado no es 3, mostramos un mensaje de error
  if (res != 3) {
    console.log("Algo va mal");
  }

});
