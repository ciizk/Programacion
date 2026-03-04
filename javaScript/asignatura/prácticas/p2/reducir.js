/*--------------------------------------------------------------------------------------------
Fichero: reducir.js
Autor: Francisco Indriago
Fecha: 14/03/2026
Descripción: función reducir()
--------------------------------------------------------------------------------------------*/

function reducir(lista, valorInicial, callback){
    let acumulado = valorInicial; // inicia el acumulador con el valor inicial

    for(let i = 0; i < lista.length; i++){
        let elemento = lista[i]; // obtiene el elemento actual de la lista

        acumulado = callback(acumulado, elemento); // actualiza el acumulador usando la callback
        
    }

    return acumulado; 
}
//------------------------------------------------------------------------------------------
//  Prueba automática
//------------------------------------------------------------------------------------------
const numeros = [1, 2, 3, 4, 5];

function sumar(a,b){
    return a + b; // funcion sumar
}

const resultado = reducir(numeros, 0, sumar); // reduce el array sumando todo desde 0 ; parecido a un sumatorio

console.log("Resultado final:", resultado); 
//------------------------------------------------------------------------------------------
