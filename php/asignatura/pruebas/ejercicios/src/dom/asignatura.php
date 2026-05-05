<?php

echo readfile("asignatura.json");
echo str_replace('282', '', $f);
header("Content type: application/json");
