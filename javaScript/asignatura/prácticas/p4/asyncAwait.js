function porDos(n) {
    return new Promise(function (resolver, rechazar) {
        setTimeout(function () {
            resolver(n * 2)
        }, 300)
    })
}

// Función async
async function hacerSuma() {
    let a = await porDos(3)
    let b = await porDos(4)
    let c = await porDos(5)

    return a + b + c
}

// Ejecutar
hacerSuma().then(function (resultado) {
    console.log("Resultado:", resultado)
})