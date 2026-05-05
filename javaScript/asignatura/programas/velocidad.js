/*--------------------------------------------------------------------------------------------
Fichero: velocidad.js
Autor: Francisco Indriago
Fecha: 05/03/2026
Descripción: calcular velocidad por tramo usando mapear()
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
//  MAPEAR()
//------------------------------------------------------------------------------------------

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
//  VELOCIDAD
//------------------------------------------------------------------------------------------

function velocidad(tramo){
    return tramo.s / tramo.t;
}

function velocidades(trayecto){
    return map(velocidades, trayecto);
}


//------------------------------------------------------------------------------------------
//  PRUEBA AUTOMÁTICA
//------------------------------------------------------------------------------------------

