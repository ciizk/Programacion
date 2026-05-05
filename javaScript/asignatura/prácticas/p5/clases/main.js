// Apartado 1: clase Punto en un solo fichero (sin export).
// Sirve como prueba inicial de la clase antes de modularizarla.

class Punto {
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

  distancia(otro) {
    const dx = this.x - otro.x;
    const dy = this.y - otro.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

const p1 = new Punto(0, 0);
const p2 = new Punto(3, 4);

console.log("p1 =", "(" + p1.getX() + "," + p1.getY() + ")");
console.log("p2 =", "(" + p2.getX() + "," + p2.getY() + ")");
console.log("distancia(p1, p2) =", p1.distancia(p2)); // 5
