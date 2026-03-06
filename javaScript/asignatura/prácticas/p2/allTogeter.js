/*--------------------------------------------------------------------------------------------
Fichero: allTogether.js
Autor: Francisco Indriago
Fecha: 06/03/2026
Descripción: 
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
//  FILTRAR()
//------------------------------------------------------------------------------------------

function filtrar(array, condición){ 
    let res = []        
    
    
    for(let i= 0; i < array.length; i++){
        if(condición(array[i]) == true){
            res.push(array[i]);
        }
    }
    return res;
}

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
//  REDUCIR()
//------------------------------------------------------------------------------------------

function reducir(lista, valorInicial, callback){
    let acumulado = valorInicial; // inicia el acumulador con el valor inicial

    for(let i = 0; i < lista.length; i++){
        let elemento = lista[i]; // obtiene el elemento actual de la lista

        acumulado = callback(acumulado, elemento); // actualiza el acumulador usando la callback
        
    }

    return acumulado; 
}






//------------------------------------------------------------------------------------------
//  PALABRAS
//------------------------------------------------------------------------------------------



const palabras = ["Es", "ahora", "tu", "oportunidad", "para", "aprovechar", "este", "día"];




//------------------------------------------------------------------------------------------
//  PALABRAS AL REVÉS
//------------------------------------------------------------------------------------------

function invertir(palabra){ 
    return palabra.split('').reverse().join('');
};
const listaInvertida = map(invertir, palabras);

console.log("Del revés: ", listaInvertida);

//------------------------------------------------------------------------------------------
//  TOTAL DE CARACTÉRES
//------------------------------------------------------------------------------------------

function cuantos(acumulado, palabra){
    return acumulado + palabra.length;
}
const totalCaracteres = reducir(palabras, 0, cuantos);
console.log("Total de caracteres: ", totalCaracteres);

//------------------------------------------------------------------------------------------
//  MÁS DE 5 LETRAS
//------------------------------------------------------------------------------------------

function masDeCinco(palabra){
    if(palabra.length > 5) return true;
    return false;
}
const palabrasLargas = filtrar(palabras,masDeCinco);
const cantidadLargas = palabrasLargas.length;
console.log("Cantidad > 5 letras: ", cantidadLargas);

//------------------------------------------------------------------------------------------
//  CONCATENACIÓN
//------------------------------------------------------------------------------------------

function tresOMenos(palabra) {
    return palabra.length <= 3;
}

function pegarPalabras(acumulado, palabra) {
    return acumulado + palabra;
}

let palabrasCortas = filtrar(palabras, tresOMenos);
let resultadoConcatenado = reducir(palabrasCortas, "", pegarPalabras);

console.log("Concatenación:", resultadoConcatenado); 