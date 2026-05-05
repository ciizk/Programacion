// 1. Crea un objeto con 3 propiedades
let movil = {
    color: "negro",
    forma: "cuadrada",
    cargador: "Usb-C",
}
// 2. Accede y muestra su valor
console.log(movil)
// 3. Agrega una nueva propiedad
movil.camara = "48px"
console.log(movil)
// 4. Elimina una de las 3 primeras propiedades
delete movil.forma
console.log(movil)
// 5. Agrega una función e invócala
movil.carga = function(){
    console.log("el movil esta cargando")
}
movil.carga()
// 6. Itera las propiedades del objeto
for (let key in movil){
    console.log(key, movil[key])
}
// 7. Crea un objeto anidado
movilDetallado = {
    color: "negro",
    forma: "cuadrada",
    cargador: "Usb-C",
    carga: function(){
        console.log("el telefono esta cargando")
    },
    marca: {
        marca: "apple",
        modelo: "iphone 17",
        sistema: "iOS"

    }
} 

// 8. Accede y muestra el valor de las propiedades anidadas
console.log(movilDetallado.marca.modelo)
// 9. Comprueba si los dos objetos creados son iguales
console.log(movil == movilDetallado)
// 10. Comprueba si dos propiedades diferentes son iguales
console.log(movil.color === movilDetallado.color)