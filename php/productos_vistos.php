<?php
// Endpoint de productos vistos recientemente.
// En esta práctica, la lista real se guarda en localStorage en el cliente.
// Este endpoint solo valida el token y devuelve un pequeño resumen.

require_once __DIR__ . '/config.php';

/**
 * Este endpoint solo acepta peticiones POST.
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'Método no permitido. Usa POST.'
    ], 405);
}

// Lee el cuerpo de la petición como JSON.
$cuerpoCrudo = file_get_contents('php://input');
$datosEntrada = json_decode($cuerpoCrudo, true);

// Valida que se haya enviado JSON, aunque sea sencillo.
if (!is_array($datosEntrada)) {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'El cuerpo de la petición debe ser JSON válido.'
    ], 400);
}

// Extrae el token del cliente y lo valida.
$tokenCliente = isset($datosEntrada['token']) ? $datosEntrada['token'] : null;
validarTokenCliente($tokenCliente);

// Extrae la lista de productos vistos, si existe.
$productosVistos = [];

if (isset($datosEntrada['productos_vistos']) && is_array($datosEntrada['productos_vistos'])) {
    $productosVistos = $datosEntrada['productos_vistos'];
}

/**
 * En un entorno real, aquí se podría guardar la lista en una base de datos
 * o usarla para personalizar recomendaciones.
 * En esta práctica solo devolvemos un mensaje de confirmación.
 */
$respuesta = [
    'ok' => true,
    'mensaje' => 'Productos vistos recibidos y token validado.',
    'cantidad' => count($productosVistos)
];

// Envía la respuesta al cliente.
enviarRespuestaJson($respuesta, 200);
