
// --------------------------------------------------------------------------------
// mainTest2.js : alta de asignaturas
// --------------------------------------------------------------------------------
const logica = require( "../logica.js" )

var assert = require ('assert')

// --------------------------------------------------------------------------------
describe( "Test 2: insertar una asignatura", function() {

	var laLogica = null

	it ( "cargo la lógica abriendo conexión ", async function() {
		laLogica = await logica( "../bd/datos.bd" )
	})

	it( "borro todas las filas", async function() {
		await laLogica.borrarFilasDeTodasLasTablas()
	})

	it( "inserto una asignatura", async function() {
		await laLogica.insertarAsignatura(
			{ codigo: "13929", nombre: "Programacion 2" } )
	})

	it( "no puedo insertar una asignatura con código que ya está",
		async function() {
			var error = null
			try {
				await laLogica.insertarAsignatura(
					{ codigo: "13929", nombre: "Otra Asignatura" } )
			} catch( err ) {
				error = err
			}
			assert( error, "¿Ha insertado un código ya existente?" )
		})

	it( "cierro conexion con base de datos", async function() {
		await laLogica.cerrarConexion()
	})

}) // describe
