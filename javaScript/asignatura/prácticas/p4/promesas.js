function porDos(n) {
    return new Promise(function (resolver, rechazar) {
        setTimeout(function () {
            resolver(n * 2)
        }, 300)
    })
}

var a, b, c

porDos(3)
    .then(function (r) {
        a = r
        return porDos(4)
    })
    .then(function (r) {
        b = r
        return porDos(5)
    })
    .then(function (r) {
        c = r
        return a + b + c
    })
    .then(function (total) {
        console.log("Total:", total)
    })