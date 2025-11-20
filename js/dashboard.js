// js/dashboard.js
// Primer objetivo del dashboard: comprobar sesión y preparar logout.

document.addEventListener("DOMContentLoaded", function () {
  // 1) Si no hay token, fuera.
  comprobarSesion();

  // 2) Logout limpio
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", cerrarSesion);
  }

  // De momento no pintamos productos aún.
});
