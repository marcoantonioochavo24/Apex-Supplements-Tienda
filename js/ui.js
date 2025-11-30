// Funciones reutilizables de interfaz (toasts y mejoras pequeñas).

/**
 * Muestra un mensaje emergente tipo toast.
 * El tipo puede ser "success", "error" o "info".
 */
function mostrarToast(mensaje, tipo) {
  var container = document.querySelector('.toast-container');

  // Crea el contenedor de toasts si no existe todavía.
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Crea el elemento del toast.
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + (tipo || 'info');
  toast.innerHTML =
    '<span>' + mensaje + '</span>' +
    '<button type="button" aria-label="Cerrar">✕</button>';

  container.appendChild(toast);

  // Pequeño retraso para que se apliquen las transiciones CSS.
  requestAnimationFrame(function () {
    toast.classList.add('toast--visible');
  });

  // Permite cerrar el toast manualmente.
  var closeButton = toast.querySelector('button');
  closeButton.addEventListener('click', function () {
    cerrarToast(toast);
  });

  // Cierra el toast automáticamente después de unos segundos.
  setTimeout(function () {
    cerrarToast(toast);
  }, 3300);
}

/**
 * Oculta y elimina un toast concreto del DOM.
 */
function cerrarToast(toast) {
  if (!toast) {
    return;
  }

  toast.classList.remove('toast--visible');

  // Espera a que termine la transición antes de quitarlo del DOM.
  setTimeout(function () {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 250);
}

/**
 * Formatea un número como precio en euros con dos decimales.
 */
function formatearPrecioEuros(valor) {
  var numero = Number(valor) || 0;
  return numero.toFixed(2) + ' €';
}
