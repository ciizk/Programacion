/*--------------------------------------------------------------------------------------------
Fichero: main.js
Autor: Francisco Indriago
Fecha: 04/05/2026
Descripción: importar clase y usarla
--------------------------------------------------------------------------------------------*/

const Punto = require("./Punto.js");

var p1 = new Punto(3, 4);
console.log("p1.getX() =", p1.getX()); // 3
console.log("p1.getY() =", p1.getY()); // 4
