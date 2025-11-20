// js/util_localstorage.js
// Funciones pequeñas para no repetir código en todas las páginas.
// La idea es que todo lo relacionado con LocalStorage esté centralizado aquí.

// Devuelve el token guardado o null si no existe
function obtenerToken() {
  return localStorage.getItem("token");
}

// Comprueba si hay sesión válida en cliente.
// Si no hay token, redirige al login.
function comprobarSesion() {
  const token = obtenerToken();

  if (!token) {
    // Si alguien intenta entrar sin login, lo sacamos fuera.
    window.location.href = "login.html";
  }
}

// Devuelve la tienda completa desde LocalStorage como objeto JS
function obtenerTienda() {
  const tiendaString = localStorage.getItem("tienda");
  return tiendaString ? JSON.parse(tiendaString) : null;
}

// Borra TODO lo del LocalStorage (logout limpio)
function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("tienda");
  localStorage.removeItem("carrito");
  localStorage.removeItem("productos_vistos");

  window.location.href = "login.html";
}
