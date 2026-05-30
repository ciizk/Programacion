/*--------------------------------------------------------------------------------------------
Fichero: "mainTest2.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que comprueba con mocha que las reglas REST de las nuevas funciones de
la lógica (insertarAsignatura, matricular y buscarAsignaturasDePersonaPorApellidos)
responden correctamente a través del servidor.
--------------------------------------------------------------------------------------------*/

// --------------------------------------------------------------------------------
// mainTest2.js  (recuerda arrancar el servidor)
// --------------------------------------------------------------------------------
const request = require ('request')
const assert = require ('assert')

const IP_PUERTO = "http://localhost:8080"

// --------------------------------------------------------------------------------
describe( "Test 2: asignaturas, matrículas y consultas (recuerda arrancar el servidor)", function() {

	// ........................................................................
	it( "POST /f/borrarFilasDeTodasLasTablas", function( hecho ) {
		request.post(
			{ url: IP_PUERTO + "/f/borrarFilasDeTodasLasTablas",
			  headers: { 'User-Agent': 'jordi', 'Content-Type': 'application/json' },
			  body: null
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null )
				assert.equal( respuesta.statusCode, 200 )
				hecho()
			}
		)
	})

	// ........................................................................
	it( "POST /f/insertarAsignatura", function( hecho ) {
		request.post(
			{ url: IP_PUERTO + "/f/insertarAsignatura",
			  headers: { 'User-Agent': 'jordi', 'Content-Type': 'application/json' },
			  body: JSON.stringify( { codigo: "13929", nombre: "Programacion 2" } )
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null, "¿error?: " + err )
				assert.equal( respuesta.statusCode, 200 )
				hecho()
			}
		)
	})

	// ........................................................................
	it( "POST /f/insertarPersona", function( hecho ) {
		request.post(
			{ url: IP_PUERTO + "/f/insertarPersona",
			  headers: { 'User-Agent': 'jordi', 'Content-Type': 'application/json' },
			  body: JSON.stringify( { dni: "1234A", nombre: "Pepe", apellidos: "García Pérez" } )
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null )
				assert.equal( respuesta.statusCode, 200 )
				hecho()
			}
		)
	})

	// ........................................................................
	it( "POST /f/matricular", function( hecho ) {
		request.post(
			{ url: IP_PUERTO + "/f/matricular",
			  headers: { 'User-Agent': 'jordi', 'Content-Type': 'application/json' },
			  body: JSON.stringify( { dni: "1234A", codigo: "13929" } )
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null )
				assert.equal( respuesta.statusCode, 200 )
				hecho()
			}
		)
	})

	// ........................................................................
	it( "POST /f/buscarAsignaturasDePersonaPorApellidos", function( hecho ) {
		request.post(
			{ url: IP_PUERTO + "/f/buscarAsignaturasDePersonaPorApellidos",
			  headers: { 'User-Agent': 'jordi', 'Content-Type': 'application/json' },
			  body: JSON.stringify( { apellidos: "García Pérez" } )
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null )
				assert.equal( respuesta.statusCode, 200 )
				var resultados = JSON.parse( carga )
				assert.equal( resultados.length, 1, "¿no hay una asignatura?" )
				assert.equal( resultados[0].codigo, "13929" )
				hecho()
			}
		)
	})

}) // describe
