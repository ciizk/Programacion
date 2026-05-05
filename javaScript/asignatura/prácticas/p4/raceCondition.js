// –––––––––––––––––––––––––––––––-
var elAsiento = "nadie" // variable global (mala idea)

// –––––––––––––––––––––––––––––––-
function cambiarNombre(nombre) {
    setTimeout(function () {
        console.log(" *** elAsiento es para: " + nombre + "***")
        elAsiento = nombre
    }, 100)
}

// –––––––––––––––––––––––––––––––-
function hacerReserva(nombre) {
    if (elAsiento == "nadie") {
        cambiarNombre(nombre)
        return
    }
}

// –––––––––––––––––––––––––––––––-
// main
console.log("Intento reservar para juan.")
console.log("Como es el primero en reservar, el asiento debería ser para él")
hacerReserva("juan")

console.log("Intento reservar para pepe.")
hacerReserva("pepe")

setTimeout(() => console.log("el Asiento finalmente es para " + elAsiento), 1000)