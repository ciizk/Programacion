/*--------------------------------------------------------------------------------------------
Fichero: objetos.js
Autor: Francisco Indriago
Fecha: 30/03/2026
Descripción: Diseña, implementa y prueba un objeto pila (consultar Pila) 
             con operaciones apilar(), desapilar() y cima()
--------------------------------------------------------------------------------------------*/
//------------------------------------------------------------------------------------------
// 1. COCHE
//------------------------------------------------------------------------------------------
var coche = {
    color: "rojo",
    precio: 1234.56
};

console.log("///////// COCHE /////////");
console.log(coche);
console.log("Color:", coche.color);
console.log("Precio:", coche.precio);


// ------------------------------------------------------------------------------------------
// 2. OBJETO CON MÉTODOS
// ------------------------------------------------------------------------------------------
var calculadora = {
    valor: 1234,

    metodo: function(a) {
        return this.valor * a;
    },

    incrementar: function() {
        this.valor++;
    }
};

console.log("/////////OBJETO CON MÉTODOS /////////");

calculadora.incrementar();
var resultado = calculadora.metodo(2);

console.log("Valor actual:", calculadora.valor);
console.log("Resultado:", resultado);


// ------------------------------------------------------------------------------------------
// 3. PILA
// ------------------------------------------------------------------------------------------
var pila = {
    elementos: [],

    apilar: function(valor) {
        this.elementos.push(valor);
    },

    desapilar: function() {
        if (this.elementos.length === 0) {
            return undefined;
        }
        return this.elementos.pop();
    },

    cima: function() {
        if (this.elementos.length === 0) {
            return undefined;
        }
        return this.elementos[this.elementos.length - 1];
    }
};

console.log("///////// PILA /////////");

// Pruebas
pila.apilar(10);
pila.apilar(20);
pila.apilar(30);

console.log("Elementos:", pila.elementos);
console.log("Cima:", pila.cima());

console.log("Desapilar:", pila.desapilar());
console.log("Desapilar:", pila.desapilar());

console.log("Elementos finales:", pila.elementos);