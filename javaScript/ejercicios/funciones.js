//--------------------------------------------------------------------------------------------------------------
// Una función recibe algo y devuelve algo!
//--------------------------------------------------------------------------------------------------------------
// Estructura básica de una función
function nombreDeLaFunción(ParametrosDeLaFunción){  // los parametros son los valores que recibe la funcion (opcional)
    // Aquí se escribe el código que se ejecuta
    return resultado;   // importante poner return ya que es lo que devuelve
}
//--------------------------------------------------------------------------------------------------------------
// El ejemplo más sencillo 
//--------------------------------------------------------------------------------------------------------------
function suma (a, b){ // la función se llama suma y recibe 2 valores, a y b
    return a + b  // la función devuelve a + b
}

// Para usar esta función hay que darle valores a los parametros e imprimirlo en consola
let resultado = suma(5, 5) // de esta manera, se guarda en "resultado"
console.log(resultado)
//--------------------------------------------------------------------------------------------------------------
// Existen 5 tipos de funciones
//--------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------
// Función con parametros y return         (ejemplo, la multiplicación o suma)
//--------------------------------------------------------------------------------------------------------------
function multiplicar(a, b){
    return a * b
}
resultado = multiplicar(5, 5)
console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// Funciones sin parametros ni return
//--------------------------------------------------------------------------------------------------------------
function saludar(){
    console.log("Hola!")
}  saludar() // con esto llamamos a la función

//--------------------------------------------------------------------------------------------------------------
// Función sin return
 //--------------------------------------------------------------------------------------------------------------
function mostrarNum(Num){      //CUIDADO, esto no devuelve nada, solo muestra el parametro
    console.log(Num)
} mostrarNum(5) // con esto llamamos a la función

//--------------------------------------------------------------------------------------------------------------
// Función flecha, más moderna   (tiene 2 versionas)
//--------------------------------------------------------------------------------------------------------------
// Versión normal
const suma1 = (a, b) => { return a + b } 
// Versión corta
const suma2 = (a, b) => a + b;
// vamos a llamarlas
resultado= suma1(5, 10); console.log(resultado); resultado = suma2(10, 5); console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// IDEA CLAVE! 
// Como podemos observar, una función NO HACE NADA hasta que la llames!
//--------------------------------------------------------------------------------------------------------------
// observemos abajo
function adios() {
    console.log("Adios");
}

// aquí no pasa nada

adios(); // ahora sí se ejecuta

//--------------------------------------------------------------------------------------------------------------
// Ejercicios 
//--------------------------------------------------------------------------------------------------------------
// Resta, recibe 2 numeros y devuleve la resta
//--------------------------------------------------------------------------------------------------------------
function resta(a,b){
    return a-b
} resultado = resta(10, 5)
console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
//esPar, recibe un numero y devuelve un booleano
//--------------------------------------------------------------------------------------------------------------
function esPar(num){
    if(num % 2 === 0){
        return true
    } else return false
} resultado = esPar(10)
console.log(resultado)
// tambien se puede hacer de esta manera más simplificada, sin usar if o else
function esPar2(num){
    return num % 2 === 0;
} resultado = esPar2(12)
console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// Saludo personal
//--------------------------------------------------------------------------------------------------------------
function saludoPersonal2(nombre){
    console.log("Hola " + nombre)
} saludoPersonal2("Francisco")

//--------------------------------------------------------------------------------------------------------------
// mayorNumero, recibe 2 numeros y devuelve el mayor
//--------------------------------------------------------------------------------------------------------------

function mayorNumero(a, b){
    if( a > b){
        return a
    } else return b
}
resultado = mayorNumero(50, 10); console.log("El numero más grande es: " + resultado)
// Esta es la forma si lo queremos usar con operadores tenarios
function mayorNumero(a, b){
    return a > b ? a : b;
}

//--------------------------------------------------------------------------------------------------------------
// Area rectangulo, recibe ancho y alto y devuelve el area
//--------------------------------------------------------------------------------------------------------------

function areaRectangulo(a, b){
    return a * b
} resultado = areaRectangulo(5, 10); console.log("El area del rectangulo es: "+ resultado +" cm²")

//--------------------------------------------------------------------------------------------------------------
// puedeConducir, recibe una edad y devuelve si puede conducir o no
//--------------------------------------------------------------------------------------------------------------

function puedeConducir(edad){
    if(edad >= 18){
        return "Puede conducir"
    } else 
        return "No puede conducir"
} 
    
resultado = puedeConducir(15); console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// tabla del numero, recibe un numero y devuelve su tabla del 1 al 10
//--------------------------------------------------------------------------------------------------------------
function tablaDelNumero(a){
   for(let i = 1; i <= 10; i++){
    console.log(a + "x" + i + " = " + (a * i))
   }
} 
tablaDelNumero(5)

//--------------------------------------------------------------------------------------------------------------
// es positivo o negativo, recibe un numebro y devuelve su valor
//--------------------------------------------------------------------------------------------------------------
function esPositivo(a){
    if (a === 0){
        return "Es cero"
    } else if 
        (a < 0){
            return "Negativo"
        
    } else return "Positivo"
}
resultado = esPositivo(-5)
console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// sumarArray, recibe un array de numeros y devuelve la suma de estos
//--------------------------------------------------------------------------------------------------------------
function sumarArray(array){
    let suma3 = 0 // Guardamos esto para el total
    for( let i = 0; i < array.length; i++){
        suma3 += array[i] // sumamos cada numero
    }
    return suma3
} 
resultado = sumarArray([5, 10, 15])
console.log("La suma del array es: " + resultado)

//--------------------------------------------------------------------------------------------------------------
// numeroMayorArray, recibe un array y devuelve el numero más grande
//--------------------------------------------------------------------------------------------------------------
function numeroMayorArray(array1){
    let mayor = array1[0]
    for(let i = 0; i < array1.length; i++){
        if(array1[i] > mayor){
            mayor = array1[i]
        }
    }
    return mayor
}
resultado = numeroMayorArray([5, 15, 10]); console.log("El numero: " + resultado + " es el mayor del array")

//--------------------------------------------------------------------------------------------------------------
// contarPares, recibe un array y devuelve cuantos numeros pares hay dentro del array
//--------------------------------------------------------------------------------------------------------------
function contarPares(array2){
    let contador = 0
    for(let i= 0; i < array2.length; i++){
        if(array2[i] % 2 === 0){
            contador++;
        }
    }
    return contador
} 
resultado = contarPares([5, 10, 15, 12, 20, 25]); console.log("En este array, hay " + resultado + " numeros pares")

//--------------------------------------------------------------------------------------------------------------
// invertirArray, recibe un array y devuelve el array al reves
//--------------------------------------------------------------------------------------------------------------

function invertirArray(array3){
    let nuevoArray =[]
    for(let i= array3.length - 1; i >= 0 ; i--){
        nuevoArray.push(array3[i])
    } return nuevoArray
} resultado = invertirArray([1, 2, 3])
console.log(resultado)


//--------------------------------------------------------------------------------------------------------------
// buscarNumero, recibe un array + 1 numero y devuelve booleano 
//--------------------------------------------------------------------------------------------------------------
function buscarNumero(array4, buscar){
    for(let i=0; array4.length >= i - 1; i++){
        if( array4[i] === buscar){
            return true
        } 
 } return false
} resultado = buscarNumero([1, 2, 3], 2)
console.log(resultado)

//--------------------------------------------------------------------------------------------------------------
// filtrarPares, recibe un array y devuelve un array nuevo con SOLO los numeros pares dentro del array original
//--------------------------------------------------------------------------------------------------------------

function filtrarPares(array5){
    let contenedor = []
    for(let i= 0; i < array5.length; i++){
        if(array5[i] % 2 === 0 ){
            contenedor.push(array5[i])
        }
    } return contenedor
} console.log(filtrarPares([1, 2, 3, 4]))


//--------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------
