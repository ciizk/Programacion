/*--------------------------------------------------------------------------------------------
Fichero: dividir.js
Autor: Francisco Indriago
Fecha: 05/05/2026
Descripción: Apartado 2 del 2° Examen de Programación 2
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
//  Función
//------------------------------------------------------------------------------------------


function dividir(n,d){
    return new Promise (function(resolver,rechazar){
        setTimeout(function (){
            let res = n/d;
            if (d === 0){
                rechazar(new Error)
            } else { 
                resolver(res)
            }
        } ,1000);
    });
}