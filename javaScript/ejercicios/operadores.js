// 1. Crea una variable para cada operación aritmética
console.log('EJERCICIO 1.');
let age= 19;
let score = 6.7;
let nombre = 'fran';
let apellido = 'indriago';
let suma = 4;
suma += 1;
console.log(age);
console.log(score);
console.log(suma);
console.log(nombre);
console.log(apellido);


// 2. Crea una variable para cada tipo de operación de asignación, que haga uso de las variables utilizadas para las operaciones aritméticas
console.log('EJERCICIO 2.')
a = 5;
b = 10;
c = 15;

let faltas =2.5;

console.log( score - faltas);
console.log('suma= ' , a + b);
console.log('resta= ' , a - b);
console.log('multiplicacion= ' , a * b);
console.log('division= ' , a / b);
console.log('modulo= ' , a % b);
console.log('exponente= ' , a ** b);

console.log(nombre + ' ' + apellido);

// 3. Imprime 5 comparaciones verdades con diferentes operadores de comparación
console.log('EJERCICIO 3.')
console.log( a < b);
console.log( a+b > a-b);
console.log( a/b < a*b);
console.log( a != b );
console.log( a + b == c && c - b == a);
// 4. Imprime 5 comparaciones falsas con diferentes operadores de comparación 
console.log( 'EJERICIO 4.');
console.log(a == b);
console.log(a > b);
console.log(a + c == b);
console.log( nombre == apellido);
console.log(age == score);
// 5. Utiliza el operador lógico and
a != b && c == a + b;
// 6. Utiliza el operador lógico or
a + b == c || a - b == c;
// 7. Combina ambos operadores lógicos
a != b && c == a + b || a - b == c
// 8. Añade alguna negación
a < b && c != b || nombre == apellido;
// 9. Utiliza el operador ternario
const voyAprobar = true;
voyAprobar ? console.log('voy a pasar progra') : console.log('veo dificil pasar');
// 10. Combina operadores aritméticos, de comparáción y lógicas

let x = 10
let y = 40

const sumatorio = x + y 
const res = 50

let prueba = sumatorio == res 
let prueba1 = sumatorio != res

prueba ? console.log(prueba, 'todo va bien, la suma es ' , sumatorio) : 
console.log(prueba, 'esta dando', sumatorio , 'algo va mal');