var fs=require("fs")
//----------------------------------------------------------------
// nombreFichero:Texto -> leerFichero() -> contenido:Texto | Error
//----------------------------------------------------------------

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




