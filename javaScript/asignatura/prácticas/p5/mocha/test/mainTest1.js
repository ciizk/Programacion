/*--------------------------------------------------------------------------------------------
Fichero: mainTest1.js
Autor: Francisco Indriago
Fecha: 04/05/2026
Descripción: constructor y getters de Punto
--------------------------------------------------------------------------------------------*/
const assert = require("assert");
const Punto = require("../Punto.js");

describe("Punto - constructor y getters", function () {
  it("getX() devuelve la coord x pasada al constructor", function () {
    const p = new Punto(3, 4);
    assert.strictEqual(p.getX(), 3);
  });

  it("getY() devuelve la coord y pasada al constructor", function () {
    const p = new Punto(3, 4);
    assert.strictEqual(p.getY(), 4);
  });

  it("acepta coordenadas negativas", function () {
    const p = new Punto(-2, -7);
    assert.strictEqual(p.getX(), -2);
    assert.strictEqual(p.getY(), -7);
  });
});
