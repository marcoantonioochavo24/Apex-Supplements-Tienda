<?php
// Endpoint de validación de carrito. Comprueba precios y calcula el total.

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

// Lee el cuerpo de la petición (se espera JSON).
$cuerpoCrudo = file_get_contents('php://input');
$datosEntrada = json_decode($cuerpoCrudo, true);

// Valida que el JSON recibido es correcto.
if (!is_array($datosEntrada)) {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'El cuerpo de la petición debe ser JSON válido.'
    ], 400);
}

// Extrae el token del cliente.
$tokenCliente = isset($datosEntrada['token']) ? $datosEntrada['token'] : null;

// Valida el token usando la función común.
validarTokenCliente($tokenCliente);

// Extrae el carrito enviado por el cliente.
$carritoCliente = isset($datosEntrada['carrito']) ? $datosEntrada['carrito'] : null;

/**
 * Valida que el carrito existe y es un array de líneas.
 * Cada línea debería contener al menos: id, precio y cantidad.
 */
if (!is_array($carritoCliente) || count($carritoCliente) === 0) {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'El carrito está vacío o tiene un formato incorrecto.'
    ], 400);
}

// Carga la información de la tienda para obtener los precios originales.
$tienda = cargarJsonDesdeData('tienda.json');
$productosTienda = isset($tienda['productos']) ? $tienda['productos'] : [];

// Crea un índice de productos por id para búsquedas rápidas.
$indiceProductos = [];

/**
 * Recorre la lista de productos de la tienda y los guarda en un array
 * asociativo usando el id del producto como clave.
 */
foreach ($productosTienda as $producto) {
    if (isset($producto['id'])) {
        $indiceProductos[$producto['id']] = $producto;
    }
}

// Variables para acumular el total del pedido y las líneas validadas.
$totalPedido = 0.0;
$lineasValidadas = [];

/**
 * Recorre cada línea del carrito enviado por el cliente.
 * Para cada producto:
 *  - Comprueba que exista en la tienda.
 *  - Comprueba que la cantidad sea válida.
 *  - Comprueba que el precio no haya sido manipulado.
 *  - Calcula el subtotal usando el precio oficial del servidor.
 */
foreach ($carritoCliente as $linea) {
    // Valida que la línea tenga un id de producto.
    if (!isset($linea['id'])) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'Una línea del carrito no tiene id de producto.'
        ], 400);
    }

    $idProducto = $linea['id'];

    // Comprueba que el producto exista en la tienda.
    if (!isset($indiceProductos[$idProducto])) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'El producto con id ' . $idProducto . ' no existe en la tienda.'
        ], 400);
    }

    $productoServidor = $indiceProductos[$idProducto];

    // Obtiene la cantidad pedida. Si no es numérica o menor que 1, es error.
    $cantidad = isset($linea['cantidad']) ? (int)$linea['cantidad'] : 0;

    if ($cantidad < 1) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'Cantidad no válida para el producto con id ' . $idProducto
        ], 400);
    }

    // Precio enviado por el cliente.
    $precioCliente = isset($linea['precio']) ? (float)$linea['precio'] : null;

    // Precio oficial del servidor.
    $precioServidor = isset($productoServidor['precio']) ? (float)$productoServidor['precio'] : null;

    // Valida que haya precio en los dos lados.
    if ($precioCliente === null || $precioServidor === null) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'Falta el precio en una de las líneas del carrito.'
        ], 400);
    }

    /**
     * Comprueba que el precio enviado por el cliente coincide con el del servidor.
     * Se permite una pequeña diferencia por redondeos (0.01).
     */
    if (abs($precioCliente - $precioServidor) > 0.01) {
        enviarRespuestaJson([
            'ok' => false,
            'mensaje' => 'Se ha detectado una diferencia de precio en el producto con id ' . $idProducto
        ], 400);
    }

    // Calcula el subtotal usando el precio oficial del servidor.
    $subtotal = $precioServidor * $cantidad;

    // Suma el subtotal al total del pedido.
    $totalPedido += $subtotal;

    // Guarda la línea validada para devolver un resumen al cliente.
    $lineasValidadas[] = [
        'id' => $idProducto,
        'nombre' => isset($productoServidor['nombre']) ? $productoServidor['nombre'] : '',
        'precio_unitario' => $precioServidor,
        'cantidad' => $cantidad,
        'subtotal' => $subtotal
    ];
}

// Prepara la respuesta con el resumen del pedido.
$respuesta = [
    'ok' => true,
    'mensaje' => 'Carrito validado correctamente.',
    'resumen' => [
        'lineas' => $lineasValidadas,
        'total' => $totalPedido
    ]
];

// Envía la respuesta al cliente.
enviarRespuestaJson($respuesta, 200);
