/*--------------------------------------------------------------------------------------------
Fichero: "mainTest4.js"
Autor: Francisco Indriago
Fecha: 30/05/2026
Descripción: programa que comprueba con mocha que la función
buscarAsignaturasDePersonaPorApellidos devuelve los códigos de las asignaturas en que está
matriculada una persona dada por sus apellidos.
--------------------------------------------------------------------------------------------*/

// --------------------------------------------------------------------------------
// mainTest4.js : buscar asignaturas matriculadas de una persona por apellidos
// --------------------------------------------------------------------------------
const logica = require( "../logica.js" )

var assert = require ('assert')

// --------------------------------------------------------------------------------
describe( "Test 4: asignaturas en que está matriculada una persona", function() {

	var laLogica = null

	it ( "cargo la lógica abriendo conexión ", async function() {
		laLogica = await logica( "../bd/datos.bd" )
	})

	it( "borro todas las filas", async function() {
		await laLogica.borrarFilasDeTodasLasTablas()
	})

	it( "preparo datos: persona, asignaturas y matrículas", async function() {
		await laLogica.insertarPersona(
			{ dni: "1234A", nombre: "Pepe", apellidos: "García Pérez" } )
		await laLogica.insertarAsignatura(
			{ codigo: "13929", nombre: "Programacion 2" } )
		await laLogica.insertarAsignatura(
			{ codigo: "13928", nombre: "Programacion 1" } )
		await laLogica.matricular( { dni: "1234A", codigo: "13929" } )
		await laLogica.matricular( { dni: "1234A", codigo: "13928" } )
	})

	it( "obtengo las asignaturas en las que está matriculada García Pérez",
		async function() {
			var res = await laLogica.buscarAsignaturasDePersonaPorApellidos(
				{ apellidos: "García Pérez" } )
			assert.equal( res.length, 2, "¿no son 2 asignaturas?" )
			var codigos = res.map( r => r.codigo ).sort()
			assert.deepEqual( codigos, [ "13928", "13929" ],
				"¿no son las dos asignaturas matriculadas?" )
		})

	it( "una persona sin apellidos coincidentes devuelve lista vacía",
		async function() {
			var res = await laLogica.buscarAsignaturasDePersonaPorApellidos(
				{ apellidos: "NoExiste" } )
			assert.equal( res.length, 0, "¿debería estar vacía?" )
		})

	it( "cierro conexion con base de datos", async function() {
		await laLogica.cerrarConexion()
	})

}) // describe
