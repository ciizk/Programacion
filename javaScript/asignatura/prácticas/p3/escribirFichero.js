/*--------------------------------------------------------------------------------------------
Fichero: ficherosDeTexto1.js
Autor: Francisco Indriago
Fecha: 31/03/2026
Descripción:programa que escriba tu nombre en un fichero de texto llamado “nombre.txt”.
--------------------------------------------------------------------------------------------*/
//------------------------------------------------------------------------------------------
// 1 ESCRIBIR  FICHERO (nombre.txt)
//------------------------------------------------------------------------------------------
console.log("--> INICIANDO EL SCRIPT DE ESCRITURA...");

var fs = require("fs");
var miNombre = "FRANCISCO INDRIAGO";

fs.writeFile("nombre.txt", miNombre, function(err) {
  if (err) {
    console.log("Hubo un problema al escribir en nombre.txt:", err);
  } else {
    console.log("¡Fichero creado y nombre escrito con éxito!");
  }
});