/*--------------------------------------------------------------------------------------------
Fichero: Punto.js
Autor: Francisco Indriago
Fecha: 05/05/2026
Descripción: clase punto completa, exportada para usar en los tests
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

  // Distancia euclídea entre this y otro punto.
  distancia(otro) {
    const dx = this.x - otro.x;
    const dy = this.y - otro.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Devuelve un nuevo Punto cuyas coords son (this.x - otro.x, this.y - otro.y).
  // Uno de los puntos es this (el otro es el argumento).
  diferencia(otro) {
    const Punto = this.constructor;
    return new Punto(this.x - otro.x, this.y - otro.y);
  }
};
