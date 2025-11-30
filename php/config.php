<?php
// Configuración común para todos los endpoints de la API de Apex Supplements.

// Activar errores durante el desarrollo. En producción se puede desactivar.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Token simple que usará el servidor para validar la autenticación.
// El cliente deberá enviar este mismo token en las peticiones protegidas.
$SERVER_TOKEN = 'APEX_SUPPLEMENTS_TOKEN_2025';

// Constante con la ruta a la carpeta donde están los ficheros JSON.
define('DATA_DIR', __DIR__ . '/../data/');

/**
 * Carga un archivo JSON desde la carpeta /data y lo devuelve como array asociativo.
 * Si hay cualquier problema (no existe, no se puede leer o no es JSON válido),
 * se envía una respuesta de error en formato JSON y se detiene la ejecución.
 */
function cargarJsonDesdeData($nombreFichero)
{
    // Construye la ruta absoluta al fichero dentro de /data.
    $ruta = DATA_DIR . $nombreFichero;

    // Comprueba que el fichero existe.
    if (!file_exists($ruta)) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'No se encuentra el fichero de datos ' . $nombreFichero
        ], 500);
    }

    // Intenta leer el contenido del fichero.
    $contenido = file_get_contents($ruta);

    if ($contenido === false) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'No se puede leer el fichero de datos ' . $nombreFichero
        ], 500);
    }

    // Intenta decodificar el contenido como JSON.
    $datos = json_decode($contenido, true);

    if ($datos === null) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'El fichero de datos ' . $nombreFichero . ' contiene JSON no válido'
        ], 500);
    }

    // Devuelve el array asociativo con los datos del JSON.
    return $datos;
}

/**
 * Envía una respuesta JSON al cliente con el código de estado indicado.
 * Siempre termina la ejecución del script después de enviar la respuesta.
 */
function enviarRespuestaJson($datos, $codigoHttp = 200)
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($codigoHttp);
    echo json_encode($datos);
    exit;
}

/**
 * Valida que el token que ha enviado el cliente coincida con el token del servidor.
 * Si el token no es válido, se envía una respuesta 401 (no autorizado) y se detiene la ejecución.
 */
function validarTokenCliente($tokenCliente)
{
    // Usa la variable global que contiene el token del servidor.
    global $SERVER_TOKEN;

    // Comprueba que el token existe y coincide exactamente.
    if (!is_string($tokenCliente) || $tokenCliente !== $SERVER_TOKEN) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'Token de autenticación no válido'
        ], 401);
    }
}
