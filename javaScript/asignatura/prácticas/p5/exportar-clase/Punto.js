// Apartado 3: exportar la clase Punto desde su propio módulo.

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
