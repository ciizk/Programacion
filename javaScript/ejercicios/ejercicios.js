// ----- Ejercicios de programación: -----
// ----- Nota, para hacer algunos ejercicios se pueden llamar a funciones ya realizadas en otros. Fijaos que uso la palabra devolver, esto quiere decir que se puede usar cualquier método que tenga el lenguaje de programación para que las funciones nos den el resultado, lo ideal sería probar todos los métodos disponibles
// ----- Básicos:    
//-hacer una función que se le pase un número entero y te devuelva el entero siguiente
function siguiente(numero){
    numero++
    return numero
} 
console.log(siguiente(6))

//-calcular el factorial de un número
function factorial(valor){
    let resultado =1
    for( let i = 1; i <= valor; i++){
        resultado *= i
    } return resultado
} console.log(factorial(5))

//-introducir un número entero y que haga el sumatorio desde 1 a ese número

function sumatorio(num){
    let res = 0
    for(let i= 1; i <= num; i++){
        res += i
        console.log(res)
    } return res
} console.log(sumatorio(5))

//-introducir un número entero y que haga el productorio desde 1 a ese número

function productorio(num){
    let res = 1
    for(let i= 1; i <= num; i++){
        res *= i
        console.log(res)
    } return res
} console.log(productorio(5))

//-hacer una función de entrada que le pida al usuario un número hasta que el usuario introduzca un número positivo
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function pedirNumero() {
    rl.question("Introduce una contraseña: ", function(respuesta) {
        let numPos = Number(respuesta);

        if (numPos > 0) {
            console.log("Bien hecho! era un numero positivo");
            rl.close();
        } else {
            console.log("Mal hecho, prueba otra vez         (Pista: es un tipo de numero)");
            pedirNumero();
        }
    });
} pedirNumero();

//-hacer una función que reciba un año y nos diga si es bisiesto o no.

//-hacer una función que reciba un número y nos diga si es primo.

//-hacer una función que nos diga si un número es par.

//-hacer una función que nos diga si un número es positivo.

//-hacer una función que se le pasen 3 valores, 2  sean dos números y el tercero un número del 1 al 4, donde si es un 1 haremos una suma con los números, si es un 2 una resta, si es un 3 una multiplicación y si es un 4 una división
