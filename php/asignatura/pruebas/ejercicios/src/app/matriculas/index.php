<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Matrículas</title>
    <link rel="stylesheet" href="../../css/matriculas.css"
</head>
<body>
<header id="main-header"><!-- el header es el encabezado -->
    <a href="../..">logo</a>
    <nav>
        <ul>
            <li>menu 1</li>
            <li>menu 2</li>
            <li>menu 3</li>
        </ul>
    </nav>
    <button popovertarget="menu-usuario"> Usuario </button>

    <nav popover="manual" id="menu-usuario">
        <a href="#">Mi Perfil</a>
        <a href="#">Salir</a>
    </nav>
</header>

<aside id="side-bar"> <!-- es un contenido que va al lado del contenido principal, como barras laterales -->
    <ul>
        <li>opcion 1</li>
        <li>opcion 2</li>
        <li>opcion 3</li>
    </ul>
</aside>

<main>
    <header>
        <h1>Asignatura</h1>
        <p>opciones</p>
        <button>+</button>
    </header>
    <table>
        <thead>
        <tr> <!-- t header, basicamente titulos -->
            <th></th> <!-- una celda de encabezado -->
            <th>Nombre</th>
            <th>ID</th>
            <th>Email</th>
        </tr>
        </thead>
        <tbody> <!-- cuerpo de la tabla con filas de información -->
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        <tr>
            <td></td>
            <td>Nombre</td>
            <td>ID</td>
            <td>Email</td>
        </tr>
        </tbody>
    </table>
</main>
<dialog>
    <header>
        <input type="search" placeholder="Buscar">
        <table>
            <tbody> <!-- cuerpo de la tabla con filas de información -->
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            <tr>
                <td></td>
                <td>Nombre</td>
                <td>ID</td>
                <td>Email</td>
            </tr>
            </tbody>
        </table>
    </header>
    <button>Matricular</button>
    <button>Cerrar</button>


</dialog>



</body>
</html>




<!-- "Esto nos servirá para cuando utilicemos las base de datos
$servername = "localhost:3306";
$username = "faindval";
$password = "b6gt3BA5%dGxe~bo";
$dbname = "faindval_";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM `vista_matriculas`";
// Execute the SQL query
$result = mysqli_query($conn, $sql);

// Process the result set
if (mysqli_num_rows($result) > 0) {
    // Output data of each row
    while($row = mysqli_fetch_assoc($result)) {
        echo "Asignatura: " . $row["asignaturas"] . " | Alumno: " . $row["alumno"] . " | Email: " . $row["email"] . "<br>";
    }
} else {
    echo "No hay alumnos Matriculados";
}
-->