const alumnos = [
    {nombre: "Ana", nota: 7},
    {nombre: "Luis", nota: 4},
    {nombre: "Eva", nota: 9},
]

//1. Obtener Aprobados
function aprobados(alumnos){
    let res = []
    for(let i = 0; i < alumnos.length; i++){
        if(alumnos[i].nota >= 5){
            res.push(alumnos[i])
        } 
    } return res
}

console.log(aprobados(alumnos))
//2. Calcular nota media (con Reduce)
function notaMedia(alumnos){


}
//3. Obtener el mejor alumno

//4. Generar ranking ordenado















// Dada una contraseña con números y letras del tipo "r45PL49X910sf5673"
// 1. invierte el roden de los valores utilizando reduce() y split()
// 2. Separa los números
// 3. A partir de la lista de números busca el punto de corte que vendrá determinado por aquel valor cuya suma de valores a la derecha e izquierda de él sea mínima 