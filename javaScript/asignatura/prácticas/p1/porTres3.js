/*------------------------------------------------------------
Fichero: porTres3.js
Autor: Francisco Indriago
Fecha: 10/02/2026
Descripción: Función que recibe un número real, lo multiplica por tres y espera 3 segundos para devolverlo.
-------------------------------------------------------------*/
function porTres(a, callback) {
  let resultado = a * 3;
  callback(resultado);
}

//Prueba:

//  Asignamos un valor a la variable a
let a = 1;

//----------------------------------------------------------
//  Ejecutamos el código después de 3000 ms
setTimeout(function () {

  //  Llamamos a la función porTres
  //  El resultado se recibe en el callback
  porTres(a, function (res) {

    //  Comprobamos si el resultado es correcto
    //  Si no es 3, mostramos un mensaje por pantalla
    if (res != 3) {
      console.log("Algo va mal");
    }

  });

}, 3000);
