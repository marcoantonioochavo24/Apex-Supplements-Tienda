// Gestión de autenticación: token, usuario y protección de páginas.

/**
 * Devuelve el token de autenticación almacenado en localStorage.
 */
function obtenerToken() {
  return localStorage.getItem('apex_token');
}

/**
 * Devuelve el objeto usuario almacenado en localStorage (o null si no existe).
 */
function obtenerUsuarioActual() {
  var json = localStorage.getItem('apex_user');
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/**
 * Guarda en localStorage el token, el usuario y toda la información de la tienda.
 */
function guardarSesion(token, usuario, tienda) {
  localStorage.setItem('apex_token', token);
  localStorage.setItem('apex_user', JSON.stringify(usuario));
  localStorage.setItem('apex_store', JSON.stringify(tienda));
}

/**
 * Elimina todos los datos de sesión y tienda del localStorage.
 * Esto se usa al cerrar sesión.
 */
function limpiarSesion() {
  localStorage.removeItem('apex_token');
  localStorage.removeItem('apex_user');
  localStorage.removeItem('apex_store');
  localStorage.removeItem('apex_cart');
  localStorage.removeItem('apex_recent_products');
}

/**
 * Comprueba si el usuario está autenticado mirando si existe un token.
 */
function estaAutenticado() {
  var token = obtenerToken();
  return typeof token === 'string' && token !== '';
}

/**
 * Si el usuario no está autenticado, redirige a la página de login.
 * Esta función debe llamarse al principio de cada página protegida.
 */
function protegerPagina() {
  if (!estaAutenticado()) {
    window.location.href = 'login.html';
  }
}

/**
 * Rellena el nombre del usuario en el header si existe el elemento correspondiente.
 */
function actualizarNombreUsuarioEnHeader() {
  var span = document.getElementById('userName');
  if (!span) {
    return;
  }
  var usuario = obtenerUsuarioActual();
  if (usuario && usuario.nombre) {
    span.textContent = 'Hola, ' + usuario.nombre;
  }
}

/**
 * Inicializa el botón de cierre de sesión si está presente en la página.
 */
function inicializarBotonLogout() {
  var boton = document.getElementById('logoutButton');
  if (!boton) {
    return;
  }

  boton.addEventListener('click', function () {
    limpiarSesion();
    window.location.href = 'login.html';
  });
}

/**
 * Inicializa el formulario de login si está presente en la página.
 * Se encarga de validar campos, llamar al servidor y guardar la sesión.
 */
function inicializarFormularioLogin() {
  var formulario = document.getElementById('loginForm');
  if (!formulario) {
    return;
  }

  var inputUsuario = document.getElementById('usuario');
  var inputPassword = document.getElementById('password');
  var mensajeError = document.getElementById('loginError');
  var boton = formulario.querySelector('button[type="submit"]');

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (mensajeError) {
      mensajeError.textContent = '';
    }

    var usuario = inputUsuario.value.trim();
    var password = inputPassword.value.trim();

    // Validación sencilla en cliente.
    if (usuario === '' || password === '') {
      if (mensajeError) {
        mensajeError.textContent = 'Rellena usuario y contraseña.';
      }
      mostrarToast('Debes introducir usuario y contraseña.', 'error');
      return;
    }

    var datos = {
      usuario: usuario,
      password: password
    };

    if (boton) {
      boton.disabled = true;
    }

    // Llama al endpoint PHP de login.
    fetch('php/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
      .then(function (respuesta) {
        return respuesta.json();
      })
      .then(function (datosRespuesta) {
        if (!datosRespuesta.ok) {
          if (mensajeError) {
            mensajeError.textContent =
              datosRespuesta.mensaje || 'Error de autenticación.';
          }
          mostrarToast(datosRespuesta.mensaje || 'Login incorrecto.', 'error');
          return;
        }

        // Guarda token, usuario y tienda en localStorage.
        guardarSesion(
          datosRespuesta.token,
          datosRespuesta.usuario,
          datosRespuesta.tienda
        );

        mostrarToast('Bienvenido a Apex Supplements.', 'success');

        // Redirige al dashboard.
        window.location.href = 'dashboard.html';
      })
      .catch(function () {
        if (mensajeError) {
          mensajeError.textContent =
            'No se ha podido conectar con el servidor.';
        }
        mostrarToast('Error de conexión con el servidor.', 'error');
      })
      .finally(function () {
        if (boton) {
          boton.disabled = false;
        }
      });
  });
}

/**
 * Se ejecuta cuando el documento está listo.
 * Configura formulario de login, botón de logout y nombre del usuario.
 * Además, si ya hay sesión activa y estás en login.html, te manda al dashboard.
 */
document.addEventListener('DOMContentLoaded', function () {
  actualizarNombreUsuarioEnHeader();
  inicializarBotonLogout();
  inicializarFormularioLogin();

  var formularioLogin = document.getElementById('loginForm');
  if (formularioLogin && estaAutenticado() && localStorage.getItem('apex_store')) {
    window.location.href = 'dashboard.html';
  }
});
