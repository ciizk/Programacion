// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
const request = require ('request')
const assert = require ('assert')

const IP_PUERTO="http://localhost:8080"

// --------------------------------------------------------------------------------
// main ()
// --------------------------------------------------------------------------------
describe( "Test 1: pon aquí tu comentario (recuerda arrancar el servidor)", function() {

	// ........................................................................... 
	// 1.
	// ........................................................................... 
	it( "probar que GET /prueba responde ¡Funciona!", function( hecho ) {
		request.get(
			{ url : IP_PUERTO+"/prueba", headers : { 'User-Agent' : 'jordi' }},
			function( err, respuesta, carga ) {
				assert.equal( err, null, "¿ha habido un error?" )
				assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
				assert.equal( carga, "¡Funciona!", "¿La carga no es ¡Funciona!?" )
				hecho()
			} // callback()
		) // .get
	}) // it

	// ........................................................................... 
	// 2. 
	// ........................................................................... 
	it( "probar POST /f/prueba", function( hecho ) {

		// esta función prueba está en logica/funciones/prueba

		request.post(
			{ url : IP_PUERTO+"/f/prueba",
			  headers : { 'User-Agent' : 'jordi', 'Content-Type' : 'application/json' },
			  body : JSON.stringify( "hola" )
			},
			function( err, respuesta, carga ) {
				assert.equal( err, null, "¿ha habido un error?" )
				assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
				hecho()
			} // callback
		) // .post
	}) // it

	// ........................................................................... 
	// 3. 
	// ........................................................................... 
	it( "probar POST /f/borrarFilasDeTodasLasTablas", function( hecho ) {

		// esta función prueba está en logica/funciones/prueba

		request.post(
			{ url : IP_PUERTO+"/f/borrarFilasDeTodasLasTablas",
			  headers : { 'User-Agent' : 'jordi', 'Content-Type' : 'application/json' },
			  body : null
			},
			function( err, respuesta, carga ) {

				// console.log( " carga: " + carga )

				assert.equal( err, null, "¿ha habido un error?" )
				assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
				hecho()
			} // callback
		) // .post
	}) // it

	// ........................................................................... 
	// 4. 
	// ........................................................................... 
	it( "probar POST /f/insertarPersona", function( hecho ) {

		request.post(
			{ url : IP_PUERTO+"/f/insertarPersona",
			  headers : { 'User-Agent' : 'jordi', 'Content-Type' : 'application/json' },
			  body : JSON.stringify( {dni: "1234A", nombre: "Pepe", apellidos: "García Pérez" } )
			},
			function( err, respuesta, carga ) {

				assert.equal( err, null, "¿ha habido un error?: " + err )
				assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )
				hecho()
			} // callback
		) // .post
	}) // it

	// ........................................................................... 
	// 5. 
	// ........................................................................... 
	it( "probar POST /f/buscarPersonaConDNI", function( hecho ) {

		request.post(
			{ url : IP_PUERTO+"/f/buscarPersonaConDNI",
			  headers : { 'User-Agent' : 'jordi', 'Content-Type' : 'application/json' },
			  body : JSON.stringify( {dni: "1234A" } )
			},
			function( err, respuesta, carga ) {

				assert.equal( err, null, "¿ha habido un error?: " + err )
				assert.equal( respuesta.statusCode, 200, "¿El código no es 200 (OK)" )

				// console.log( " carga = " + carga )

				var resultados = JSON.parse( carga )

				assert.equal( resultados.length, 1, "¿No hay un resultado" )
				assert.equal( resultados[0].dni, "1234A", "¿No es el dni que he buscado?" )

				hecho()
			} // callback
		) // .post
	}) // it
	
}) // describe

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
