<html lang="es">
<body>
<header>
    <h1>DOM</h1>
</header>
<main>
    <p id="parrafo">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aspernatur,
        cumque esse et eveniet fuga id incidunt maiores minima, nemo nisi nobis nulla placeat porro
        quibusdam quod similique velit veritatis?
    </p>
    <button>click me!</button>
</main>
    <footer>
        &copy: 2026
    </footer>

    <script>
        const parrafo = document.getElementById("parrafo");
        const boton = document.querySelector( 'button' );
        //let texto = "<b>Hola mundo</b>";
        //boton.onclick = () => parrafo.innerHTML=texto;
        //console.log(boton)

        addEventListener("click", async () => {
            const f = await fetch('asignatura.json');
            const asignaturas = await f.json();
            parrafo.innerHTML='';
            const ul= document.createElement('ul');
            parrafo.appendChild(ul);


            console.log(asignaturas)
            asignaturas.forEach((asignatura) => {
                const li = document.createElement('li');
                li.textContent=asignatura.nombre;
                ul.appendChild(li);
            })
        });

    </script>

</body>
</html>