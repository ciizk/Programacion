<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>login</title>
    <base href="../">
</head>
<body>

<?php include "../includes/components/menu.inc"; ?>

<form action="login/login.php" method="post">
    <input type="text" name="userName" placeholder="usuario@correo.com" required>
    <input type="password" name="password" placeholder="Password" required>
    <input type="submit" value="Login">
</form>
<?php
if(isset($_GET["error"])){
    ?>
<div>
    Credenciales incorrectas
</div>
<?php
}
?>






</body>
</html>