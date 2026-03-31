// 1. Imprime por consola tu nombre si una variable toma su valor
let nombre = "Francisco"
if(nombre){
    console.log("Mi nombre es " + nombre)
}
// 2. Imprime por consola un mensaje si el usuario y contraseña concide con unos establecidos
let usuario = "Fran"
let contraseña = 1234

if(usuario == "Fran" && contraseña == 1234){
    console.log("Bienvenido")
} else {
    console.log("Credenciales invalidas")
}
// 3. Verifica si un número es positivo, negativo o cero e imprime un mensaje
let number = 5

if(number > 0){
    console.log("Positivo")
} else if(number == 0){
    console.log("Cero")
} else { 
    console.log("Negativo") 
}

// 4. Verifica si una persona puede votar o no (mayor o igual a 18) e indica cuántos años le faltan
edad = 10

if(edad >= 18){
    console.log("Si puede votar")
} else { 
    let faltanAños = 18 - edad 
    console.log("No puede votar, le fatan " + faltanAños + " años.")
}
// 5. Usa el operador ternario para asignar el valor "adulto" o "menor" a una variable 
// dependiendo de la edad

let mayor = 18
queEs = mayor >= 18 ? "Mayor de Edad" : "Menor de edad"
console.log(queEs)

// 6. Muestra en que estación del año nos encontramos dependiendo del valor de una variable "mes"
let season = "October";

if(season == "January" ){
    console.log("It's "+ season + ", meaning it's Winter")
} else if( season == "February"){
    console.log("It's "+ season + ", meaning it's Spring")
} else if( season == "March"){
    console.log("It's "+ season + ", meaning it's Spring")
} else if( season == "April"){
    console.log("It's "+ season + ",  meaning it's Spring")
} else if( season == "May"){
    console.log("It's "+ season + ", meaning it's Summer")
} else if( season == "June"){
    console.log("It's "+ season + ", meaning it's Summer")
} else if( season == "July"){
    console.log("It's "+ season + ", meaning it's Summer")
} else if( season == "August"){
    console.log("It's "+ season + ", meaning it's Autumn")
} else if( season == "September"){
    console.log("It's "+ season + ", meaning it's Autumn")
} else if( season == "October"){
    console.log("It's "+ season + ", meaning it's Autumn")
} else if( season == "November"){
    console.log("It's "+ season + ", meaning it's Winter")
} else if( season == "December"){
    console.log("It's "+ season + ", meaning it's Winter")
} else { console.log("Invalid Month")
}
// 7. Muestra el número de días que tiene un mes dependiendo de la variable del ejercicio anterior
let monthDay = "February";

if(monthDay == "January" ){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "February"){
    console.log("It's "+ monthDay + `, meaning it has 28 days
and every four years it has 29`)
} else if( monthDay == "March"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "April"){
    console.log("It's "+ monthDay + ", meaning it has 30 days")
} else if( monthDay == "May"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "June"){
    console.log("It's "+ monthDay + ", meaning it has 30 days")
} else if( monthDay == "July"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "August"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "September"){
    console.log("It's "+ monthDay + ", meaning it has 30 days")
} else if( monthDay == "October"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else if( monthDay == "November"){
    console.log("It's "+ monthDay + ", meaning it has 30 days")
} else if( monthDay == "December"){
    console.log("It's "+ monthDay + ", meaning it has 31 days")
} else { console.log("Invalid Month")
}
// 8. Usa un switch para imprimir un mensaje de saludo diferente dependiendo del idioma
let idioma = 2
let mensaje
switch(idioma){
    case 0:
        mensaje = "Hola, como estas?"
        break
    case 1:
        mensaje = "Hello, how are you?"
        break
    case 2:
        mensaje = "Hallo, wie geht's?"
        break
    case 3:
        mensaje = "Bonjour, comment ça va?"
        break
    case 4:
        mensaje = "Ciao, come stai?"
        break
        default:
            mensaje = "Idioma no permitido"
} console.log(mensaje)

// 9. Usa un switch para hacer de nuevo el ejercicio 6
let month = 10
let whichMonth
switch(month){
    case 0:
        whichMonth = "Invierno"
        break
    case 1:
        whichMonth = "Invierno"
        break
    case 2:
        whichMonth = "Primavera"
        break
    case 3:
        whichMonth = "Primavera"
        break
    case 4:
        whichMonth = "Primavera"
        break
    case 5:
        whichMonth = "Verano"
        break
    case 6:
        whichMonth = "Verano"
        break
    case 7:
        whichMonth = "Verano"
        break
    case 8:
        whichMonth = "Otoño"
        break
    case 9:
        whichMonth = "Otoño"
        break
    case 10:
        whichMonth = "Otoño"
        break
    case 11:
        whichMonth = "Invierno"
        break
        default: 
        whichMonth = "un mes invalido"
} console.log("Estamos en " + whichMonth)
// 10. Usa un switch para hacer de nuevo el ejercicio 7


let day = 2
let whichDay
switch(day){
    case 0:
        whichDay = 31
        break
    case 1:
        whichDay = 28 + " y cada cuatro años " + 29
        break
    case 2:
        whichDay = 31
        break
    case 3:
        whichDay = 30
        break
    case 4:
        whichDay = 31
        break
    case 5:
        whichDay = 30
        break
    case 6:
        whichDay = 31
        break
    case 7:
        whichDay = 31
        break
    case 8:
        whichDay = 30
        break
    case 9:
        whichDay = 31
        break
    case 10:
        whichDay = 30
        break
    case 11:
        whichDay = 31
        break
        default: 
        whichDay = "un ERROR, mes inexistente, por lo que no tiene"
} console.log("El mes tiene " + whichDay + " días")
