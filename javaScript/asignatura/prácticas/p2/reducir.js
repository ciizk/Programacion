/*--------------------------------------------------------------------------------------------
Fichero: reducir.js
Autor: Francisco Indriago
Fecha: 14/03/2026
Descripción: función reducir()
--------------------------------------------------------------------------------------------*/

function calcularArea(alturas, dx){
    function sumarArea(acumulado, altura){
        let areaRectangulo = altura * dx;
        return acumulado + areaRectangulo;
    }
    let areaTotal = reducir(alturas, 0, sumarArea);

    return areaTotal;
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
