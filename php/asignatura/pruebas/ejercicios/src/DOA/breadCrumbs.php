<div>
<?php echo $_SERVER['REQUEST_URI']; ?>
</div>

<div>
    <?php
    $directorios = explode("/", $_SERVER['REQUEST_URI']);
    $url = "";
    foreach ($directorios as $directorio) {
        if($directorio === "") continue;
        $url .= "/" .$directorio ;
        if($directorio === "ejercicios") continue;
        ?>
    <div>
        <a href="/<?php echo $directorio; ?>
        <?php echo $directorio; ?>
        </a>
    </div>
<?php
}
    ?>
</div>

