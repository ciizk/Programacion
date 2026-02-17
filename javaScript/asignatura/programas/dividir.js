/*--------------------------------------------------------------------------------------------
Fichero: dividir.js
Autor: Francisco Indriago
Fecha: 17/02/2026
Descripción: Función que divide y regresa mediante callbacks con prueba automáticas
--------------------------------------------------------------------------------------------*/

// -------------------- Función sencilla ------------------------------
function dividir(a,b){
return a / b ;
}

//-------------------- Probemos con un call back ------------------

function dividir1( x, y, callback){
    let resultado;
    resultado = x / y;
    if(y!=0){                             // Así lo hice yo, en condición a distinto de 0
        callback(resultado)
    } else {callback(0)}
}
//-----------------------------------------------------------------------------------------------
function dividir2( x, y, callback){
    let resultado;
    resultado = x / y;
    if(y==0){                           // Así lo hizo el profesor, en condición igual a 0
        callback("División por 0", null)
        return
    }
    var res = x / y;
    callback(null, res)
}

// ------------- Prueba automática -----------------
let x= 2
let y= 2
resultado =1

if(resultado != x/y){
    console.log("Algo va mal");
}