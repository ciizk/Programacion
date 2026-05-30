// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const sqlite3 = require( "sqlite3" )

const cargador = require( "./cargador.js" )

// --------------------------------------------------------------------------------
//
// nombreBD: Texto -> logica() -> Logica
//
// Donde:
//
// Logica = { 
//   f: ( Texto TArg -> () -> TRes ), // para llamar a una función de la lógica por
//                                     // su nombre en texto
//   funciones: [ { conexion: TDep, f: TArg -> () -> TRes } ]_Texto // array asociativo
//                                                             // con las funciones de logica
// }
//
// (ver cargador.js)
//
// --------------------------------------------------------------------------------
module.exports = function ( nombreBD ) {
	return new Promise( function( resolver, rechazar ) {

		var conexion = new sqlite3.Database( nombreBD , function( err ) {
			if ( err ) {
				rechazar( "Error en conexión a base de datos: " + err )
			}

			// console.log(" logica(): conexión abierta con: " + nombreBD )

			// conexión establecida con la BD
			// activo foreing_keys para sqlite3
			conexion.run( "PRAGMA foreign_keys = ON" )

			var logica = cargador( __dirname + "/funciones", conexion )

			// console.log(" logica(): funciones cargadas " )
			
			resolver( logica )

		}) // sqlite3.Database
	}) // new Promise
} // module.exports

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
