function porDos(n, callback) {
    setTimeout(function () {
        callback(n * 2)
    }, 1000)
}

// Programa principal
porDos(3, function (a) {
    porDos(4, function (b) {
        porDos(5, function (c) {
            console.log("Resultado:", a + b + c)
        })
    })
})