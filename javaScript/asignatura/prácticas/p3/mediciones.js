/*--------------------------------------------------------------------------------------------
Fichero: mediciones.js
Autor: Francisco Indriago
Fecha: 02/04/2026
Descripción: programa que simule obtener medidas de temperatura y las guarde en un fichero de texto
--------------------------------------------------------------------------------------------*/
//------------------------------------------------------------------------------------------
// 1. IMPORTAR MÓDULO FS
//------------------------------------------------------------------------------------------
var fs = require("fs");


//------------------------------------------------------------------------------------------
// 2. MEDIR TEMPERATURA
//------------------------------------------------------------------------------------------
function medirTemperatura() {
    return {
        hora: new Date().toLocaleTimeString(),
        temperatura: Math.random() * (20 - 15) + 15
    };
}


//------------------------------------------------------------------------------------------
// 3. TOMAR MEDICIONES (RECURSIVO)
//------------------------------------------------------------------------------------------
function tomarMediciones(cuantas, mediciones, callback) {

    if (cuantas == 0) {
        callback(mediciones);
        return;
    }

    mediciones.push(medirTemperatura());

    setTimeout(function() {
        tomarMediciones(cuantas - 1, mediciones, callback);
    }, 1000);
}


//------------------------------------------------------------------------------------------
// 4. MAIN (EJECUCIÓN PRINCIPAL)
//------------------------------------------------------------------------------------------
console.log("///////// MEDICIONES DE TEMPERATURA /////////");

var medidas = [];

// Tomar 7 mediciones
tomarMediciones(7, medidas, function(resultado) {

    console.log("Mediciones obtenidas:");
    console.log(resultado);

    // Convertir a JSON
    var texto = JSON.stringify(resultado);

    // Guardar en fichero
    fs.writeFile("datos.txt", texto, function(err) {
        if (err) {
            console.log("Error al escribir el fichero");
            return;
        }

        console.log("Datos guardados en datos.txt");
    });
});