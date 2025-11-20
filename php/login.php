<?php
// php/login.php
// Endpoint de login de la tienda.
// Objetivo:
// 1) Recibir usuario y password por POST
// 2) Validarlos contra data/usuarios.json
// 3) Si son correctos, devolver un token fijo + tienda completa (data/tienda.json)
// 4) Si no son correctos, devolver error en JSON

// Indicamos que la respuesta es JSON, siempre.
header("Content-Type: application/json; charset=UTF-8");

// Solo aceptamos método POST para evitar accesos raros por GET.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode([
    "ok" => false,
    "mensaje" => "Método no permitido. Usa POST."
  ]);
  exit;
}

// Leemos el body por si viene en JSON (fetch suele mandarlo así)
$body = file_get_contents("php://input");
$datosEntrada = json_decode($body, true);

// Si no viene JSON, probamos con POST normal (por compatibilidad)
$usuario = "";
$password = "";

if (is_array($datosEntrada)) {
  $usuario = isset($datosEntrada["usuario"]) ? trim($datosEntrada["usuario"]) : "";
  $password = isset($datosEntrada["password"]) ? trim($datosEntrada["password"]) : "";
} else {
  $usuario = isset($_POST["usuario"]) ? trim($_POST["usuario"]) : "";
  $password = isset($_POST["password"]) ? trim($_POST["password"]) : "";
}

// Validación mínima de seguridad: no seguimos si faltan datos.
if ($usuario === "" || $password === "") {
  echo json_encode([
    "ok" => false,
    "mensaje" => "Faltan datos de usuario o contraseña."
  ]);
  exit;
}

// Rutas a ficheros JSON
$rutaUsuarios = __DIR__ . "/../data/usuarios.json";
$rutaTienda   = __DIR__ . "/../data/tienda.json";

// Comprobamos que existen los ficheros
if (!file_exists($rutaUsuarios) || !file_exists($rutaTienda)) {
  echo json_encode([
    "ok" => false,
    "mensaje" => "Error interno: no se encuentran los datos de la tienda."
  ]);
  exit;
}

// Cargamos usuarios.json
$contenidoUsuarios = file_get_contents($rutaUsuarios);
$datosUsuarios = json_decode($contenidoUsuarios, true);

// Si el JSON está mal formado, abortamos
if (!isset($datosUsuarios["usuarios"]) || !is_array($datosUsuarios["usuarios"])) {
  echo json_encode([
    "ok" => false,
    "mensaje" => "Error interno: usuarios.json no tiene formato válido."
  ]);
  exit;
}

// Recorremos usuarios y buscamos coincidencia exacta
$credencialesCorrectas = false;

foreach ($datosUsuarios["usuarios"] as $u) {
  // Nos aseguramos de que existen las claves esperadas
  if (!isset($u["usuario"]) || !isset($u["password"])) {
    continue;
  }

  if ($u["usuario"] === $usuario && $u["password"] === $password) {
    $credencialesCorrectas = true;
    break;
  }
}

if (!$credencialesCorrectas) {
  echo json_encode([
    "ok" => false,
    "mensaje" => "Usuario o contraseña incorrectos."
  ]);
  exit;
}

// Si llega aquí, el login es correcto.
// Cargamos tienda.json para devolverlo completo.
$contenidoTienda = file_get_contents($rutaTienda);
$datosTienda = json_decode($contenidoTienda, true);

// Token fijo para toda la práctica (como pide el enunciado)
$tokenFijo = "TOKEN_APEX_2025";

// Respuesta final
echo json_encode([
  "ok" => true,
  "token" => $tokenFijo,
  "tienda" => $datosTienda
]);
