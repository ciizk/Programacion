<?php
    $usuario = [
        "l.simdre@epsg.upv.es" =>	"9218611",
        "m.kirkam@epsg.upv.es" =>	"1320191",
        "d.rawabc@epsg.upv.es" =>	"9971924",
        "k.poumai@upv.es" =>	    "4525956",
        "l.prista@upv.es" =>	    "6055365",
        "e.mermiz@upv.es" =>	    "6738133",
        "o.breshe@upv.es" =>	    "1316390",
        "b.maltho@upv.es"=> 	    "1970980",
        "dapasa@har.upv.es" =>	        "1234",
        "jogilo@upvnet.upv.es" =>	    "4567"
    ];
    function validarUsuario($userName,$password ){
        // FIXME: Conexión con la BBDD
        // SELECT + FROM usuarios WHERE nombre = $nombreUsuario AND password = $password
        // if resultado = 1 return true
        // return false
        global $usuario;
        if(!array_key_exists($userName,$usuario)) return false;
        if($usuario[$userName] == $password) {
            return true;
        }
        return false;


    }
