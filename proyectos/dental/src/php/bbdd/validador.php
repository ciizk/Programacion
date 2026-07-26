<?php
// =====================================================================
// validador.php  ·  Funciones reutilizables de validación de entrada.
// Política: HTML hace el primer filtro (type/required/pattern); aquí
// hacemos la VERDAD (server-side). Todas devuelven (bool|null|string)
// o lanzan InvalidArgumentException con mensaje legible.
// =====================================================================

if (!function_exists('validarEmail')) {
    /* Valida sintaxis email. Devuelve null si OK, o string con error. */
    function validarEmail(string $valor, bool $obligatorio = true): ?string
    {
        $valor = trim($valor);
        if ($valor === '') {
            return $obligatorio ? 'El correo electrónico es obligatorio.' : null;
        }
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            return 'El correo electrónico no tiene un formato válido.';
        }
        if (strlen($valor) > 150) return 'El correo es demasiado largo (máx. 150).';
        return null;
    }
}

if (!function_exists('validarTelefono')) {
    /*
    SOLO dígitos. No quita silenciosamente espacios/letras: si el usuario
    mete "abc600..." o "600 123 456" se rechaza. El input HTML debe
    usar inputmode="numeric" + pattern="[0-9]{7,15}" como ayuda UX,
    pero la verdad es esta función.
     */
    function validarTelefono(string $valor, bool $obligatorio = false): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return $obligatorio ? 'El teléfono es obligatorio.' : null;
        if (!preg_match('/^[0-9]{7,15}$/', $valor)) {
            return 'El teléfono debe contener solo dígitos (7 a 15).';
        }
        return null;
    }
}

if (!function_exists('validarDniNie')) {
    /*
    Acepta DNI/NIE/Pasaporte. No fuerza letra de control, solo: no vacío, sin espacios huérfanos, longitud razonable y al menos un dígito o letra alfanumérica real.
     */
    function validarDniNie(string $valor): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return 'El DNI/NIE/Pasaporte es obligatorio.';
        if (strlen($valor) < 5 || strlen($valor) > 30) {
            return 'El DNI/NIE/Pasaporte debe tener entre 5 y 30 caracteres.';
        }
        if (!preg_match('/[A-Za-z0-9]/', $valor)) {
            return 'El DNI/NIE/Pasaporte debe contener letras o números.';
        }
        // Rechaza si TODO es signos/espacios.
        if (preg_match('/^[\s\W_]+$/u', $valor)) {
            return 'El DNI/NIE/Pasaporte no es válido.';
        }
        return null;
    }
}

if (!function_exists('validarNombre')) {
    /*
    Nombre o apellidos: letras (incluye acentos y ñ), espacios, guion y
    apóstrofo. Rechaza valores compuestos solo por dígitos.
     */
    function validarNombre(string $valor, string $etiqueta = 'El nombre'): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return $etiqueta . ' es obligatorio.';
        if (strlen($valor) > 100) return $etiqueta . ' es demasiado largo (máx. 100).';
        if (preg_match('/^\d+$/', $valor)) return $etiqueta . ' no puede ser solo números.';
        if (!preg_match('/^[\p{L}\s\'\-]+$/u', $valor)) {
            return $etiqueta . ' contiene caracteres no permitidos.';
        }
        return null;
    }
}

if (!function_exists('validarTitulo')) {
    /*
    Título / texto requerido genérico.
    Permite letras, números, espacios, signos comunes de puntuación
    (.,:;-—_/()¿?¡!&). Sigue requiriendo trim no vacío. El escape
     frente a XSS lo hace la vista con htmlspecialchars().
     */
    function validarTitulo(string $valor, string $etiqueta = 'El título', int $min = 2, int $max = 150): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return $etiqueta . ' es obligatorio.';
        $len = mb_strlen($valor);
        if ($len < $min) return $etiqueta . ' debe tener al menos ' . $min . ' caracteres.';
        if ($len > $max) return $etiqueta . ' es demasiado largo (máx. ' . $max . ').';
        // Rechaza solo si está compuesto exclusivamente por espacios/control.
        if (!preg_match('/[\p{L}\p{N}]/u', $valor)) {
            return $etiqueta . ' debe contener al menos una letra o número.';
        }
        return null;
    }
}

if (!function_exists('validarTextoRequerido')) {
    /*
    Texto largo requerido (descripciones, contenido de anuncios, etc.).
    Misma idea que validarTitulo pero con un rango mayor por defecto.
     */
    function validarTextoRequerido(string $valor, string $etiqueta = 'El texto', int $min = 2, int $max = 10000): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return $etiqueta . ' es obligatorio.';
        $len = mb_strlen($valor);
        if ($len < $min) return $etiqueta . ' debe tener al menos ' . $min . ' caracteres.';
        if ($len > $max) return $etiqueta . ' es demasiado largo (máx. ' . $max . ').';
        if (!preg_match('/[\p{L}\p{N}]/u', $valor)) {
            return $etiqueta . ' debe contener letras o números.';
        }
        return null;
    }
}

if (!function_exists('validarCodigoAsignatura')) {
    /*
    Código de asignatura: letras mayúsculas, dígitos y guiones.
    Ejemplos válidos: GTI-WEB-101, GTI-UXUI-201, BD-202.
     */
    function validarCodigoAsignatura(string $valor): ?string
    {
        $valor = trim($valor);
        if ($valor === '') return 'El código de asignatura es obligatorio.';
        if (!preg_match('/^[A-Z0-9][A-Z0-9\-]{1,49}$/', $valor)) {
            return 'El código solo admite mayúsculas, dígitos y guiones (2-50 caracteres).';
        }
        return null;
    }
}

if (!function_exists('validarNota')) {
    /* Nota en escala 0..10 con hasta 2 decimales. */
    function validarNota($valor): ?string
    {
        if (!is_numeric($valor)) return 'La nota debe ser un número.';
        $n = (float) $valor;
        if ($n < 0 || $n > 10) return 'La nota debe estar entre 0 y 10.';
        return null;
    }
}

if (!function_exists('validarFechasOrden')) {
    /*
    Comprueba que $inicio <= $fin (ambos en formato parseable por strtotime).
    Acepta cadenas vacías si $obligatorio=false.
     */
    function validarFechasOrden(string $inicio, string $fin, bool $obligatorio = true): ?string
    {
        if ($inicio === '' || $fin === '') {
            return $obligatorio ? 'Las fechas de inicio y fin son obligatorias.' : null;
        }
        $ti = strtotime($inicio);
        $tf = strtotime($fin);
        if ($ti === false || $tf === false) return 'Fecha con formato inválido.';
        if ($tf < $ti) return 'La fecha de fin no puede ser anterior al inicio.';
        return null;
    }
}

if (!function_exists('validarPassword')) {
    /* Política mínima: 8+ chars. Mantiene la regla actual del proyecto. */
    function validarPassword(string $valor, int $min = 8): ?string
    {
        if ($valor === '') return 'La contraseña es obligatoria.';
        if (strlen($valor) < $min) return 'La contraseña debe tener al menos ' . $min . ' caracteres.';
        if (strlen($valor) > 200) return 'La contraseña es demasiado larga.';
        return null;
    }
}

if (!function_exists('validarCvv')) {
    /* CVV / CVC: 3 o 4 dígitos. SOLO se valida en memoria durante el POST. */
    function validarCvv(string $valor): ?string
    {
        $valor = trim($valor);
        if (!preg_match('/^[0-9]{3,4}$/', $valor)) {
            return 'El CVV debe tener 3 o 4 dígitos.';
        }
        return null;
    }
}

if (!function_exists('validarNumeroTarjeta')) {
    /* Número de tarjeta: 13–19 dígitos. Permite separadores. NO se guarda; solo se toman los últimos 4 dígitos. */
    function validarNumeroTarjeta(string $valor): ?string
    {
        $soloDig = preg_replace('/[\s-]+/', '', trim($valor));
        if (!preg_match('/^[0-9]{13,19}$/', (string) $soloDig)) {
            return 'El número de tarjeta debe tener entre 13 y 19 dígitos.';
        }
        return null;
    }
}

if (!function_exists('validarFechaCaducidadTarjeta')) {
    /* Fecha MM/YY o MM/YYYY no caducada. Solo para validar en runtime; */
    function validarFechaCaducidadTarjeta(string $valor): ?string
    {
        $valor = trim($valor);
        if (!preg_match('/^(\d{1,2})\s*\/\s*(\d{2,4})$/', $valor, $m)) {
            return 'Fecha de caducidad inválida (formato MM/YY).';
        }
        $mes = (int) $m[1];
        $ano = (int) $m[2];
        if ($ano < 100) $ano += 2000;
        if ($mes < 1 || $mes > 12) return 'Mes inválido.';
        // Compara contra mes/año actual.
        $hoyMes = (int) date('m');
        $hoyAno = (int) date('Y');
        if ($ano < $hoyAno || ($ano === $hoyAno && $mes < $hoyMes)) {
            return 'La tarjeta está caducada.';
        }
        if ($ano > 2100) return 'Año demasiado lejano.';
        return null;
    }
}
