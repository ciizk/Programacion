// Apartado 4: servidor Express en el puerto 8080.
const express = require("express");
const servidor = express();

servidor.get("/hola", function (req, res) {
  res.send("Hola a todos");
});

servidor.get("/adios", function (req, res) {
  res.send("Hasta pronto");
});

servidor.listen(8080, function () {
  console.log("Escuchando en el puerto 8080");
  console.log("Conéctate a localhost:8080/hola");
});
