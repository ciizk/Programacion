/*--------------------------------------------------------------------------------------------
Fichero: filtrar.js
Autor: Francisco Indriago
Fecha: 17/02/2026
Descripción: función filtrar() usando booleanos (V/F)
--------------------------------------------------------------------------------------------*/

function filtrar(array, condición){ 
    let res = []        
    
    
    for(let i= 0; i < array.length; i++){
        if(condición(array[i]) == true){
            res.push(array[i]);
        }
    }
    return res;
}

//------------------------------------------------------------------------------------------
//  CONDICIÓN
//------------------------------------------------------------------------------------------

function tieneLetraF(palabra){
    return palabra.includes('f');
}

//------------------------------------------------------------------------------------------
//  Prueba automática
//------------------------------------------------------------------------------------------

let listaPalabras = [ 'gato', 'francisco ', 'casa', 'fuego ', 'perro', 'Alfafar ', 'jirafa '];

let resObtenido = filtrar(listaPalabras, tieneLetraF);

let resEsperado = [ 'francisco ', 'fuego ', 'Alfafar ', 'jirafa ' ];

if(resObtenido.toString() != resEsperado.toString()){
    console.log('Algo va mal')
} else { console.log('Las palabras con "f" son: ' + resObtenido)}