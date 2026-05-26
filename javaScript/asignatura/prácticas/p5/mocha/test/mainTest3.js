/*--------------------------------------------------------------------------------------------
Fichero: mainTest3.js
Autor: Francisco Indriago
Fecha: 05/05/2026
Descripción: metodo diferencia()
--------------------------------------------------------------------------------------------*/
const assert = require("assert");
const Punto = require("../Punto.js");

describe("Punto - diferencia", function () {
  it("devuelve una instancia de Punto", function () {
    const a = new Punto(5, 7);
    const b = new Punto(2, 3);
    const d = a.diferencia(b);
    assert.ok(d instanceof Punto);
  });

  it("(5,7).diferencia((2,3)) === (3,4)", function () {
    const a = new Punto(5, 7);
    const b = new Punto(2, 3);
    const d = a.diferencia(b);
    assert.strictEqual(d.getX(), 3);
    assert.strictEqual(d.getY(), 4);
  });

  it("no muta los puntos originales", function () {
    const a = new Punto(5, 7);
    const b = new Punto(2, 3);
    a.diferencia(b);
    assert.strictEqual(a.getX(), 5);
    assert.strictEqual(a.getY(), 7);
    assert.strictEqual(b.getX(), 2);
    assert.strictEqual(b.getY(), 3);
  });

  it("diferencia es coherente con distancia", function () {
    // |a - b| debe ser igual a distancia(a, b)
    const a = new Punto(5, 7);
    const b = new Punto(2, 3);
    const d = a.diferencia(b);
    const modulo = Math.sqrt(d.getX() * d.getX() + d.getY() * d.getY());
    assert.strictEqual(modulo, a.distancia(b));
  });
});
