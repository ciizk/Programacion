/*--------------------------------------------------------------------------------------------
Fichero: sumar.js
Autor: Francisco Indriago
Fecha: 10/02/2026
Descripción: Suma los multiplos de tres de un valor (fin)
--------------------------------------------------------------------------------------------*/
// Función que suma números entre inicio y fin solo si cumplen una condición
function sumar(inicio, fin, condicion) {
  var total = 0

  for (var i = inicio; i <= fin; i++) {
    if (condicion(i)) { // Se comprueba si el número i cumple la condición
      total = total + i // Si cumple la condición, se suma i al total
    }
  }
  return total // Devuelve el resultado final de la suma
}

// Prueba ------------------------------------------------
// Llamada a la función sumar inicio = 1, fin = 10 se pasa una función como condición
   var s = sumar(1, 10, function (e) {
  return e % 3 == 0 // Comprueba si e es múltiplo de 3
})

console.log(s)


/*
¿Qué hace la función sumar()?

La función sumar() recorre los números desde "inicio" hasta "fin"
y va sumando únicamente aquellos valores que cumplen una condición.
La condición se pasa como una función (callback) y decide si un número se suma o no.
Devuelve el total de la suma al final.



¿Es asíncrona la función sumar()?

No. La función sumar() es síncrona.
Se ejecuta de principio a fin sin esperar eventos externos,
promesas, temporizadores ni operaciones asíncronas.
El resultado se obtiene inmediatamente.



¿Es la función function(e) { ... } un callback?

Sí. Es un callback.
Es una función que se pasa como parámetro a otra función (sumar)
y que se ejecuta dentro de ella para evaluar una condición.
En este caso, decide si un número es múltiplo de 3.



¿Cuál es el diseño de la función sumar()?

El diseño de la función es:
sumar(inicio, fin, condicion)
Donde:
- inicio: número inicial del rango
- fin: número final del rango
- condicion: función que recibe un número y devuelve true o false




¿Por qué cuando una función recibe un callback, éste no aparece en el diseño?

Porque el callback se define externamente.
La función sumar solo necesita saber que recibe una función,
no cómo está implementada.
Esto permite reutilizar sumar con distintas condiciones
sin modificar su código interno.

*/
