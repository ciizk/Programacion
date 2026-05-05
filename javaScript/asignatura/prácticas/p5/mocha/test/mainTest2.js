// Test 2: método distancia().
const assert = require("assert");
const Punto = require("../Punto.js");

describe("Punto - distancia", function () {
  it("distancia entre (0,0) y (3,4) es 5", function () {
    const a = new Punto(0, 0);
    const b = new Punto(3, 4);
    assert.strictEqual(a.distancia(b), 5);
  });

  it("la distancia es simétrica: a.dist(b) === b.dist(a)", function () {
    const a = new Punto(1, 2);
    const b = new Punto(4, 6);
    assert.strictEqual(a.distancia(b), b.distancia(a));
  });

  it("distancia de un punto a sí mismo es 0", function () {
    const a = new Punto(7, 7);
    assert.strictEqual(a.distancia(a), 0);
  });
});
