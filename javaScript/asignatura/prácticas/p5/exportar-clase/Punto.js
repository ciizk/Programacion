/*--------------------------------------------------------------------------------------------
Fichero: Punto.js
Autor: Francisco Indriago
Fecha: 04/05/2026
Descripción: exportar punto
--------------------------------------------------------------------------------------------*/


module.exports = class Punto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
};

export class Punto {}
