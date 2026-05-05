/*--------------------------------------------------------------------------------------------
Fichero: cálculos.js
Autor: Francisco Indriago
Fecha: 04/04/2026
Descripción: programa que a partir de la información guardada en el fichero "datos.txt" calcule
la media de las temperaturas guardadas y cuál es la máxima y la mínima temperatura registrada y las horas
en que se produjeron.
--------------------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------------------
// 1. IMPORTAR MÓDULO FS
//------------------------------------------------------------------------------------------
var fs = require("fs");


//------------------------------------------------------------------------------------------
// 2. FUNCIÓN CALCULAR MEDIA
//------------------------------------------------------------------------------------------
function calcularMedia(mediciones) {
    var suma = 0;

    for (var i = 0; i < mediciones.length; i++) {
        suma += mediciones[i].temperatura;
    }

    return suma / mediciones.length;
}


//------------------------------------------------------------------------------------------
// 3. FUNCIÓN ENCONTRAR TEMPERATURA MÁXIMA
//------------------------------------------------------------------------------------------
function encontrarMaxima(mediciones) {
    var max = mediciones[0];

    for (var i = 1; i < mediciones.length; i++) {
        if (mediciones[i].temperatura > max.temperatura) {
            max = mediciones[i];
        }
    }

    return max;
}


//------------------------------------------------------------------------------------------
// 4. FUNCIÓN ENCONTRAR TEMPERATURA MÍNIMA
//------------------------------------------------------------------------------------------
function encontrarMinima(mediciones) {
    var min = mediciones[0];

    for (var i = 1; i < mediciones.length; i++) {
        if (mediciones[i].temperatura < min.temperatura) {
            min = mediciones[i];
        }
    }

    return min;
}


//------------------------------------------------------------------------------------------
// 5. LEER FICHERO Y CALCULAR RESULTADOS
//------------------------------------------------------------------------------------------
console.log("///////// CÁLCULOS DE TEMPERATURA /////////");

fs.readFile("datos.txt", "utf8", function(err, contenido) {

    if (err) {
        console.log("Error al leer el fichero");
        return;
    }

    var mediciones = JSON.parse(contenido);

    console.log("Mediciones leídas:");
    console.log(mediciones);

    var media = calcularMedia(mediciones);
    var maxima = encontrarMaxima(mediciones);
    var minima = encontrarMinima(mediciones);

    console.log("Media:", media);
    console.log("Máxima:", maxima.temperatura, "Hora:", maxima.hora);
    console.log("Mínima:", minima.temperatura, "Hora:", minima.hora);
});