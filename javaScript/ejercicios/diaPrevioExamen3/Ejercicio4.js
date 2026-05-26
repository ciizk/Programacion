// Define una función en Javascript que reciba dos cadenas de caracteres 
// (representadas como arrays)  devuelva un prefijo común más largo. 
// Por ejemplo, el prefijo común más largo de “intrépido” e “interncional” 
// es “int”

function prefijoComun(cadena1, cadena2) {
    let prefijo = "";
    let longitudMin = Math.min(cadena1.length, cadena2.length);

    for (let i=0; i < longitudMin; i++){
        if (cadena1[i] === cadena2[i]){
            prefijo += cadena1[i];
        }
    } return prefijo;
}

// prueba automática

if (prefijoComun("intrépido", "internacional") !== "int") {
    console.log("Error"); 
} 
console.log(prefijoComun("intrépido", "internacional")); // resultado esperado: "int"


// Define una función en Javascript, utilizando reduce, que reciba 
// un array de objetos del tipo {a: 5, b: -3} y devuelva true 
// si la suma de los valores del campo a coincide 
// con la suma de los valores del campo b

// Reduce
function reducir(lista, valorInicial, callback){
    let acumulado = valorInicial; // inicia el acumulador con el valor inicial
    for(let i = 0; i < lista.length; i++){
        let elemento = lista[i]; // obtiene el elemento actual de la lista
        acumulado = callback(acumulado, elemento); // actualiza el acumulador usando la callback
    }
    return acumulado; 
}

function sumaArrays(array) {
    const sumaA = reducir(array, 0, (acumulado, elemento) => acumulado + elemento.a);
    const sumaB = reducir(array, 0, (acumulado, elemento) => acumulado + elemento.b);
    
    return sumaA === sumaB; // devuelve true si las sumas son iguales, false en caso contrario
}
// Prueba automática

const array1 = [{a: 5, b: -3}, {a: 2, b: -4}]; // suma a = 7, suma b = -7
const array2 = [{a: 1, b: 1}, {a: 2, b: 2}]; // suma a = 3, suma b = 3

console.log(sumaArrays(array1)); // resultado esperado: false
console.log(sumaArrays(array2)); // resultado esperado: true