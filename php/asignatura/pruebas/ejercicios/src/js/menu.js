
//alert("Hola mundo")                -> Para crear una alerta antes de entrar a la web
//console.log("Hola Mundo!!!")       -> para que en la consola este este mensaje
//console.log(this);                 -> Para crear un window en ventana

const btnhamburguesa = document.getElementById("hamburguesa");
const menuHamburguesa = document.querySelector("#cabecera nav");

btnhamburguesa.addEventListener("click", (e) => {
    menuHamburguesa.classList.toggle("open");
})

menuHamburguesa.querySelectorAll("a ").forEach((link) => {
    link.addEventListener("click", (e) => {
        menuHamburguesa.classList.remove("open");
    })

})