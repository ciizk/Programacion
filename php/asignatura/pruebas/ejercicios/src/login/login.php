<?php
require_once "../includes/bbdd/usuario.inc";

if(!isset($_POST["userName"]) || !isset($_POST["password"])){
    header("Location: index.php?error=1");
    die();
}

    $userName = $_POST['userName'];
    $password  = $_POST['password'];

if(validarUsuario($userName, $password)){
    header('location: ../app/dashboard/index.php');
} else {
    //echo $usuario . " - " . $password;
    header("location: index.php?error=2");
}