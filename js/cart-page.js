// Lógica específica para la página cart.html.
// Aquí pintamos el carrito en la interfaz, permitimos cambiar cantidades,
// eliminar productos y validar el pedido contra el servidor.

/**
 * Pinta en la página todas las líneas del carrito.
 * Si el carrito está vacío, muestra un mensaje y desactiva el botón de checkout.
 */
function pintarCarritoEnPagina() {
  var contenedor = document.getElementById('cartItems');
  var mensajeVacio = document.getElementById('emptyCartMessage');
  var botonCheckout = document.getElementById('checkoutButton');

  if (!contenedor) {
    return;
  }

  var carrito = obtenerCarrito();

  // Si no hay productos, se muestra mensaje de carrito vacío.
  if (!Array.isArray(carrito) || carrito.length === 0) {
    contenedor.innerHTML = '';
    if (mensajeVacio) {
      mensajeVacio.style.display = 'block';
    }
    if (botonCheckout) {
      botonCheckout.disabled = true;
    }
    actualizarTotalesCarrito();
    return;
  }

  // Si hay productos, se oculta el mensaje de carrito vacío.
  if (mensajeVacio) {
    mensajeVacio.style.display = 'none';
  }
  if (botonCheckout) {
    botonCheckout.disabled = false;
  }

  // Genera el HTML de cada línea del carrito.
  contenedor.innerHTML = carrito
    .map(function (linea) {
      var subtotalLinea = linea.precio * linea.cantidad;

      return (
        '<div class="cart-item" data-id="' + linea.id + '">' +
        '<div class="product-image-wrapper" style="max-width: 80px;">' +
        '<img class="product-image" src="' + linea.imagen + '" alt="' + linea.nombre + '">' +
        '</div>' +
        '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + linea.nombre + '</div>' +
        '<div class="cart-item-meta">' +
        '<span>Precio unidad: ' + formatearPrecioEuros(linea.precio) + '</span>' +
        '</div>' +
        '<div class="cart-item-meta">' +
        '<span>Subtotal línea: <strong class="cart-line-subtotal">' +
        formatearPrecioEuros(subtotalLinea) +
        '</strong></span>' +
        '</div>' +
        '</div>' +
        '<div class="cart-item-actions">' +
        '<input type="number" min="1" value="' + linea.cantidad + '" class="cart-qty-input">' +
        '<button type="button" class="btn-ghost btn-remove-line">Eliminar</button>' +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  // Asocia manejadores a los inputs de cantidad.
  contenedor.querySelectorAll('.cart-item').forEach(function (item) {
    var id = item.getAttribute('data-id');
    var inputCantidad = item.querySelector('.cart-qty-input');
    var botonEliminar = item.querySelector('.btn-remove-line');

    // Cuando cambia la cantidad, se actualiza el carrito y el subtotal.
    if (inputCantidad) {
      inputCantidad.addEventListener('change', function () {
        var valor = parseInt(inputCantidad.value, 10);
        if (isNaN(valor) || valor < 1) {
          valor = 1;
          inputCantidad.value = '1';
        }

        actualizarCantidadEnCarrito(id, valor);
        actualizarSubtotalDeLinea(item, id);
        actualizarTotalesCarrito();
      });
    }

    // Al pulsar eliminar, se quita la línea del carrito y se repinta.
    if (botonEliminar) {
      botonEliminar.addEventListener('click', function () {
        eliminarProductoDelCarrito(id);
        mostrarToast('Producto eliminado del carrito.', 'info');
        pintarCarritoEnPagina();
      });
    }
  });

  // Una vez pintado todo, se actualizan los totales generales.
  actualizarTotalesCarrito();
}

/**
 * Actualiza el subtotal de una línea específica en el DOM
 * usando la información del carrito almacenado.
 */
function actualizarSubtotalDeLinea(elementoLinea, idProducto) {
  if (!elementoLinea) {
    return;
  }

  var carrito = obtenerCarrito();
  var linea = carrito.find(function (l) {
    return String(l.id) === String(idProducto);
  });

  if (!linea) {
    return;
  }

  var subtotal = linea.precio * linea.cantidad;
  var subtotalEl = elementoLinea.querySelector('.cart-line-subtotal');

  if (subtotalEl) {
    subtotalEl.textContent = formatearPrecioEuros(subtotal);
  }
}

/**
 * Calcula y muestra los totales del carrito en el resumen lateral.
 * Usa la función calcularTotalCarrito del módulo cart.js.
 */
function actualizarTotalesCarrito() {
  var subtotalEl = document.getElementById('cartSubtotal');
  var totalEl = document.getElementById('cartTotal');

  var total = calcularTotalCarrito();
  var texto = formatearPrecioEuros(total);

  if (subtotalEl) {
    subtotalEl.textContent = texto;
  }
  if (totalEl) {
    totalEl.textContent = texto;
  }
}

/**
 * Inicializa el botón de "Validar pedido" para enviar el carrito
 * al servidor y comprobar los precios en php/carrito.php.
 */
function inicializarBotonCheckout() {
  var boton = document.getElementById('checkoutButton');
  var mensajeError = document.getElementById('cartError');

  if (!boton) {
    return;
  }

  boton.addEventListener('click', function () {
    if (mensajeError) {
      mensajeError.textContent = '';
    }

    var carrito = obtenerCarrito();
    if (!Array.isArray(carrito) || carrito.length === 0) {
      if (mensajeError) {
        mensajeError.textContent = 'El carrito está vacío.';
      }
      mostrarToast('No hay productos en el carrito.', 'error');
      return;
    }

    // Desactiva el botón mientras se valida el pedido.
    boton.disabled = true;
    var textoOriginal = boton.textContent;
    boton.textContent = 'Validando...';

    enviarCarritoAlServidor()
      .then(function (respuesta) {
        if (!respuesta || !respuesta.ok) {
          var msg =
            (respuesta && respuesta.mensaje) ||
            'No se ha podido validar el pedido.';
          if (mensajeError) {
            mensajeError.textContent = msg;
          }
          mostrarToast(msg, 'error');
          return;
        }

        var totalServidor =
          respuesta.resumen && typeof respuesta.resumen.total === 'number'
            ? respuesta.resumen.total
            : calcularTotalCarrito();

        mostrarToast(
          'Pedido validado correctamente. Total: ' +
            formatearPrecioEuros(totalServidor),
          'success'
        );

        // Después de validar correctamente, se vacía el carrito.
        guardarCarrito([]);
        pintarCarritoEnPagina();
      })
      .catch(function () {
        if (mensajeError) {
          mensajeError.textContent =
            'Error de conexión al validar el pedido con el servidor.';
        }
        mostrarToast(
          'No se ha podido contactar con el servidor para validar el pedido.',
          'error'
        );
      })
      .finally(function () {
        boton.disabled = false;
        boton.textContent = textoOriginal;
      });
  });
}

/**
 * Inicializa toda la página de carrito:
 *  - Protege la página con token.
 *  - Pinta los productos del carrito.
 *  - Configura el botón de validar pedido.
 */
document.addEventListener('DOMContentLoaded', function () {
  // No permite acceder al carrito sin estar autenticado.
  protegerPagina();

  // Pinta inicialmente el carrito en la interfaz.
  pintarCarritoEnPagina();

  // Configura el botón de "Validar pedido".
  inicializarBotonCheckout();
});
