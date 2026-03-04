/*--------------------------------------------------------------------------------------------
Fichero: mapear.js
Autor: Francisco Indriago
Fecha: 17/02/2026
Descripción: función mapear()
--------------------------------------------------------------------------------------------*/

function map(callback, array){   // declara f(x) con 'callback' que transforma cada elemento y 'array' que es la lista original a recorrer
    let newArray = []; // crea un array vacio

    for(let i = 0; i < array.length; i++){
        let elemOG = array[i];

        let elemTransformado = callback(elemOG); //llama la funcion 'callback' y guarda el resultado transformado

        newArray.push(elemTransformado); // el nuevo elemento transformado lo mete dentro de la nueva lista
    }

    return newArray;
}
//------------------------------------------------------------------------------------------
//  Prueba automática
//------------------------------------------------------------------------------------------

const listaPalabras = ["programacion", "javaScript", "jugar", "casa", "once", "martes", "manzana"];

function obtenerLongitud(string){   // f(x) que recibe strings 
    return string.length;           // devuelve la cantidad de caracteres de la palabra (string)
}

const resultado = map(obtenerLongitud, listaPalabras);  // Van en este orden, ya que primero va el cambio o transformacion 

console.log("Palabras: ", listaPalabras);
console.log("Longitud de palabras: ", resultado);
//------------------------------------------------------------------------------------------