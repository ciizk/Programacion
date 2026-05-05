/*--------------------------------------------------------------------------------------------
Fichero: calidad.js
Autor: Francisco Indriago
Fecha: 05/05/2026
Descripción: Apartado 1 del 2° Examen de Programación 2
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
//  Diseño
//------------------------------------------------------------------------------------------

// Lista<objeto> -> calidad() [map()] -> lista<objeto>

//------------------------------------------------------------------------------------------
//  Función
//------------------------------------------------------------------------------------------

function calidad(pixel, k){
    let mejorCalidad = pixel.map(function(pixel){
        return {
            r: pixel.r + k,
            g: pixel.g + k,
            b: pixel.b + k
        };
    });
    return mejorCalidad
}

//------------------------------------------------------------------------------------------
//  Prueba automática
//------------------------------------------------------------------------------------------

let res = [
    {r: 15, g: 16, b: 17}
];
let pixel = [
    {r: 5, g: 6, b: 7}
];
let k = 10;

if(calidad(pixel, k) != res){
    console.log('va mal')
} else { 
    console.log('va bien')
}


// En el examen olvidé que en JavaScript los objetos, aunque tengan los mismos valores,
// se comparan por referencia y no por contenido, por lo que siempre dan distintos.
// La solución para este caso es compararlos usando JSON.stringify() ASÍ: 

/* if (JSON.stringify(calidad(pixel,k)) != JSON.stringify(res)){ 
    console.log('va mal')
} else { 
    console.log('va bien')
} */
