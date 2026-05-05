/*--------------------------------------------------------------------------------------------
Fichero: concatenarFicheros.js
Autor: Francisco Indriago
Fecha: 11/04/2026
Descripción: programa que crea un nuevo fichero uniendo el contenido de otros dos ficheros. 
usando async e implementarse usando await con las funciones leerFichero() y escribirFichero().
--------------------------------------------------------------------------------------------*/

const fs = require("fs")

//------------------------------------------------------------------------------------------
//  LEER FICHERO CON PROMISE
//------------------------------------------------------------------------------------------

function leerFichero(nombreFichero){
  return new Promise(function(resolver, rechazar) {
    fs.readFile(nombreFichero, "utf-8", function(err, contenido){
      if(err){
        rechazar(err)
        return
      } 
      resolver(contenido)
    })
  })
}
//------------------------------------------------------------------------------------------
//  ESCRIBIR FICHERO CON PROMISE
//------------------------------------------------------------------------------------------

function escribirFichero(nombreFichero, contenido) {
    return new Promise((resolve, reject) => {
        fs.writeFile(nombreFichero, contenido, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

//------------------------------------------------------------------------------------------
//  CONCATENAR FICHEROS CON ASYNC Y AWAIT
//------------------------------------------------------------------------------------------

async function concatenarFicheros(nombreOrigen1, nombreOrigen2, nombreDestino) {
        let a = await leerFichero(nombreOrigen1)
        let b = await leerFichero(nombreOrigen2)

        let contenidoFinal = a + b

        await escribirFichero(nombreDestino, contenidoFinal)

        console.log("Ficheros concatenados correctamente")
}

//------------------------------------------------------------------------------------------
//  RESULTADO FINAL
//------------------------------------------------------------------------------------------

concatenarFicheros("datos.txt", "datos2.txt", "resultado.txt")