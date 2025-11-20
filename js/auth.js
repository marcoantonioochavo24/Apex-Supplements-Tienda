// js/auth.js
// Flujo real de login:
// 1) Capturamos submit del formulario
// 2) Validamos campos (cliente)
// 3) Enviamos credenciales a php/login.php
// 4) Si ok=true, guardamos token + tienda en localStorage y vamos a dashboard
// 5) Si ok=false, mostramos el mensaje

document.addEventListener("DOMContentLoaded", function () {
  const formularioLogin = document.getElementById("form-login");
  const mensajeError = document.getElementById("login-mensaje-error");

  if (!formularioLogin) {
    console.warn("[auth.js] No se ha encontrado el formulario de login.");
    return;
  }

  formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (mensajeError) mensajeError.textContent = "";

    const campoUsuario = document.getElementById("usuario");
    const campoPassword = document.getElementById("password");

    const usuario = campoUsuario ? campoUsuario.value.trim() : "";
    const password = campoPassword ? campoPassword.value.trim() : "";

    if (usuario === "" || password === "") {
      if (mensajeError) {
        mensajeError.textContent = "Por favor, introduce usuario y contraseña.";
      }
      return;
    }

    // Llamamos a la API de login
    hacerLogin(usuario, password);
  });

  /**
   * Hace la petición al servidor y gestiona respuesta.
   * La separo en función para que el submit quede limpio y legible.
   */
  function hacerLogin(usuario, password) {
    const boton = formularioLogin.querySelector("button[type='submit']");

    // Mostramos un estado de carga simple sin complicarnos:
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Entrando...";
    }

    fetch("php/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, password })
    })
      .then(function (respuesta) {
        // Si el servidor devuelve algo que no es 2xx, lo tratamos como error.
        if (!respuesta.ok) {
          throw new Error("Error de servidor: " + respuesta.status);
        }
        return respuesta.json();
      })
      .then(function (datos) {
        if (!datos.ok) {
          // Login incorrecto
          if (mensajeError) mensajeError.textContent = datos.mensaje || "Login incorrecto.";
          return;
        }

        // Login correcto: guardamos token y tienda en localStorage
        localStorage.setItem("token", datos.token);
        localStorage.setItem("tienda", JSON.stringify(datos.tienda));

        // Inicializamos estructuras si no existen (nos evita bugs luego)
        if (!localStorage.getItem("carrito")) {
          localStorage.setItem("carrito", JSON.stringify([]));
        }
        if (!localStorage.getItem("productos_vistos")) {
          localStorage.setItem("productos_vistos", JSON.stringify([]));
        }

        // Redirigimos al dashboard
        window.location.href = "dashboard.html";
      })
      .catch(function (error) {
        console.error("[auth.js] Fallo en login:", error);
        if (mensajeError) {
          mensajeError.textContent = "No se pudo conectar con el servidor.";
        }
      })
      .finally(function () {
        // Quitamos estado de carga
        if (boton) {
          boton.disabled = false;
          boton.textContent = "Entrar en APEX";
        }
      });
  }
});
