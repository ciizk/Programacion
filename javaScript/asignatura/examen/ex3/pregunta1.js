function esta(a,b){
    let res= 0
    let i //hizo falta declarar la variable i
    if(a[i]===b[i]){
        esta.map(function(i){ // hizo falta poner "esta" antes de ".map"
            return "ok"
})
    } return a
}

// Versión mejorada: usando split para convertir la cadena en un array y luego map para comparar cada letra
function esta(a, b) {
    return a.split("").map(function(letra, i) {
        if (letra === b[i]) {
            return "OK";
        } else {
            return "NO";
        }
    });
}
console.log(esta("hola", "home"));



// Apartado 2 - Lo que puse

/* errores en el código:
- La función no devuelve nada si las condiciones no se cumplen.
- Existe una manera más sencilla de comparar los objetos sin necesidad de usar map.

function telefono (nombre, arr1, arr2){
    let num =arr1.map(function(i){
        return arr1.nombre
}) if(arr1.dni === arr2.dni){
    let numTelefono = arr2.telefono
    return numTelefono
    }
}
*/

// versión corregida: 
function telefono(nombre, arr1, arr2) {
    if (arr1.nombre === nombre && arr1.dni === arr2.dni) {
        return arr2.telefono;
    } else {
        return "No se encontró el número de teléfono";
    }
}   
console.log(telefono("Juan", {nombre: "Juan", dni: "1234"}, {dni: "1234", telefono: "555-1234"}));

