/*--------------------------------------------------------------------------------------------
Fichero: "mainTest3.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que comprueba con mocha que la función matricular de la lógica
matricula a una persona en una asignatura y respeta las claves (no permite duplicados ni
dni inexistentes).
--------------------------------------------------------------------------------------------*/

// --------------------------------------------------------------------------------
// mainTest3.js : matrícula
// --------------------------------------------------------------------------------
const logica = require( "../logica.js" )

var assert = require ('assert')

// --------------------------------------------------------------------------------
describe( "Test 3: matricular a una persona en una asignatura", function() {

	var laLogica = null

	it ( "cargo la lógica abriendo conexión ", async function() {
		laLogica = await logica( "../bd/datos.bd" )
	})

	it( "borro todas las filas", async function() {
		await laLogica.borrarFilasDeTodasLasTablas()
	})

	it( "preparo persona y asignatura", async function() {
		await laLogica.insertarPersona(
			{ dni: "1234A", nombre: "Pepe", apellidos: "García Pérez" } )
		await laLogica.insertarAsignatura(
			{ codigo: "13929", nombre: "Programacion 2" } )
	})

	it( "puedo matricular a la persona en la asignatura", async function() {
		await laLogica.matricular( { dni: "1234A", codigo: "13929" } )
	})

	it( "no puedo matricular dos veces a la misma persona en la misma asignatura",
		async function() {
			var error = null
			try {
				await laLogica.matricular( { dni: "1234A", codigo: "13929" } )
			} catch( err ) {
				error = err
			}
			assert( error, "¿Ha matriculado dos veces a la misma persona?" )
		})

	it( "no puedo matricular con un dni que no existe", async function() {
		var error = null
		try {
			await laLogica.matricular( { dni: "9999Z", codigo: "13929" } )
		} catch( err ) {
			error = err
		}
		assert( error, "¿Ha aceptado un dni inexistente (clave ajena)?" )
	})

	it( "cierro conexion con base de datos", async function() {
		await laLogica.cerrarConexion()
	})

}) // describe
