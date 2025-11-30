// Funciones relacionadas con el carrito de compras.
// Aquí se gestiona todo lo que tiene que ver con localStorage
// y con el envío del carrito al servidor para validar precios.

var CLAVE_CARRITO = 'apex_cart';

/**
 * Devuelve el carrito almacenado en localStorage.
 * Si no hay nada guardado, devuelve un array vacío.
 */
function obtenerCarrito() {
  var json = localStorage.getItem(CLAVE_CARRITO);
  if (!json) {
    return [];
  }

  try {
    var datos = JSON.parse(json);
    if (!Array.isArray(datos)) {
      return [];
    }
    return datos;
  } catch (e) {
    return [];
  }
}

/**
 * Guarda el carrito en localStorage.
 * El parámetro debe ser un array de líneas de carrito.
 */
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito || []));
  actualizarIndicadorCarritoHeader();
}

/**
 * Actualiza el pequeño indicador de unidades de carrito
 * que puede haber en el header. Si el elemento no existe,
 * la función simplemente termina y no produce errores.
 */
function actualizarIndicadorCarritoHeader() {
  var span = document.getElementById('cartCount');
  if (!span) {
    return;
  }

  var carrito = obtenerCarrito();
  var unidades = carrito.reduce(function (total, linea) {
    return total + (linea.cantidad || 0);
  }, 0);

  if (unidades <= 0) {
    span.style.display = 'none';
  } else {
    span.style.display = 'inline-flex';
    span.textContent = unidades;
  }
}

/**
 * Añade un producto al carrito.
 * Si ya existía, suma la cantidad indicada.
 * El producto se busca en la tienda almacenada en localStorage.
 */
function anadirProductoAlCarrito(idProducto, cantidad) {
  var cantidadNumerica = parseInt(cantidad, 10);
  if (isNaN(cantidadNumerica) || cantidadNumerica < 1) {
    cantidadNumerica = 1;
  }

  // Recupera información del producto desde la tienda.
  var producto = buscarProductoPorId(idProducto);
  if (!producto) {
    mostrarToast('No se ha encontrado el producto en la tienda.', 'error');
    return;
  }

  var carrito = obtenerCarrito();

  // Busca si ya existe una línea con ese producto.
  var lineaExistente = carrito.find(function (linea) {
    return String(linea.id) === String(idProducto);
  });

  if (lineaExistente) {
    lineaExistente.cantidad += cantidadNumerica;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidadNumerica,
      imagen: producto.imagen
    });
  }

  guardarCarrito(carrito);
  mostrarToast('Añadido al carrito: ' + producto.nombre, 'success');
}

/**
 * Elimina por completo un producto del carrito según su id.
 */
function eliminarProductoDelCarrito(idProducto) {
  var carrito = obtenerCarrito();

  var carritoFiltrado = carrito.filter(function (linea) {
    return String(linea.id) !== String(idProducto);
  });

  guardarCarrito(carritoFiltrado);
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * Si la cantidad es menor que 1, se fija automáticamente en 1.
 */
function actualizarCantidadEnCarrito(idProducto, nuevaCantidad) {
  var cantidadNumerica = parseInt(nuevaCantidad, 10);
  if (isNaN(cantidadNumerica) || cantidadNumerica < 1) {
    cantidadNumerica = 1;
  }

  var carrito = obtenerCarrito();

  carrito.forEach(function (linea) {
    if (String(linea.id) === String(idProducto)) {
      linea.cantidad = cantidadNumerica;
    }
  });

  guardarCarrito(carrito);
}

/**
 * Calcula el total actual del carrito sumando precio * cantidad
 * de cada línea. Devuelve un número decimal.
 */
function calcularTotalCarrito() {
  var carrito = obtenerCarrito();

  var total = carrito.reduce(function (suma, linea) {
    var precio = typeof linea.precio === 'number' ? linea.precio : 0;
    var cantidad = typeof linea.cantidad === 'number' ? linea.cantidad : 0;
    return suma + precio * cantidad;
  }, 0);

  return total;
}

/**
 * Envía el carrito actual al servidor para que valide los precios.
 * Devuelve una promesa que se resuelve con la respuesta JSON del servidor.
 */
function enviarCarritoAlServidor() {
  var token = obtenerToken();
  var carrito = obtenerCarrito();

  var payload = {
    token: token,
    carrito: carrito.map(function (linea) {
      return {
        id: linea.id,
        cantidad: linea.cantidad,
        precio: linea.precio
      };
    })
  };

  return fetch('php/carrito.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).then(function (respuesta) {
    return respuesta.json();
  });
}

/**
 * Al cargar cualquier página, podemos llamar a esta función
 * para que el indicador del header se sincronice con el carrito
 * que haya en localStorage.
 */
document.addEventListener('DOMContentLoaded', function () {
  actualizarIndicadorCarritoHeader();
});
