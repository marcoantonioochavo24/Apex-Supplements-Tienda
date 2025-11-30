<?php
// Endpoint de login. Valida credenciales y devuelve token + datos de la tienda.

require_once __DIR__ . '/config.php';

/**
 * Este endpoint solo acepta peticiones POST.
 * Si se usa otro método, se devuelve un error 405 (método no permitido).
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'Método no permitido. Usa POST.'
    ], 405);
}

// Inicializa el array de datos de entrada.
$datosEntrada = null;

// Intenta leer el cuerpo de la petición (para el caso de JSON).
$cuerpoCrudo = file_get_contents('php://input');

// Si hay contenido en el cuerpo, se intenta decodificar como JSON.
if (!empty($cuerpoCrudo)) {
    $datosEntrada = json_decode($cuerpoCrudo, true);
}

// Si no se ha podido decodificar JSON, se intenta usar $_POST (formulario clásico).
if (!is_array($datosEntrada)) {
    $datosEntrada = $_POST;
}

/**
 * Extrae usuario y password de los datos de entrada.
 * Se usan claves "usuario" y "password" tal y como vienen en usuarios.json.
 */
$usuario = isset($datosEntrada['usuario']) ? trim($datosEntrada['usuario']) : '';
$password = isset($datosEntrada['password']) ? trim($datosEntrada['password']) : '';

// Valida que se han enviado usuario y contraseña.
if ($usuario === '' || $password === '') {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'Debes enviar nombre de usuario y contraseña.'
    ], 400);
}

// Carga la lista de usuarios desde usuarios.json.
$usuarios = cargarJsonDesdeData('usuarios.json');

// Variable para guardar al usuario que haga match.
$usuarioEncontrado = null;

/**
 * Recorre el listado de usuarios y busca uno que coincida con usuario + password.
 * Aquí la contraseña se compara en texto plano porque así está guardada en el JSON.
 * En un entorno real se usarían hashes de contraseña.
 */
foreach ($usuarios as $usuarioActual) {
    if (
        isset($usuarioActual['usuario'], $usuarioActual['password']) &&
        $usuarioActual['usuario'] === $usuario &&
        $usuarioActual['password'] === $password
    ) {
        $usuarioEncontrado = $usuarioActual;
        break;
    }
}

// Si no se ha encontrado usuario válido, se devuelve error 401.
if ($usuarioEncontrado === null) {
    enviarRespuestaJson([
        'ok' => false,
        'mensaje' => 'Credenciales incorrectas.'
    ], 401);
}

// Si las credenciales son correctas, se carga la información de la tienda.
$tienda = cargarJsonDesdeData('tienda.json');

// Se prepara la respuesta con el token del servidor, los datos básicos del usuario y la tienda completa.
global $SERVER_TOKEN;

$respuesta = [
    'ok' => true,
    'token' => $SERVER_TOKEN,
    'usuario' => [
        'usuario' => $usuarioEncontrado['usuario'],
        'nombre' => isset($usuarioEncontrado['nombre']) ? $usuarioEncontrado['nombre'] : $usuarioEncontrado['usuario']
    ],
    'tienda' => $tienda
];

// Se envía la respuesta JSON al cliente.
enviarRespuestaJson($respuesta, 200);
