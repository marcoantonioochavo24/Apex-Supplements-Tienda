// Funciones para trabajar con los datos de la tienda y productos vistos.

/**
 * Devuelve el objeto completo de la tienda almacenado en localStorage.
 */
function obtenerTienda() {
  var json = localStorage.getItem('apex_store');
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
 * Devuelve el listado de productos de la tienda o un array vacío si no hay datos.
 */
function obtenerProductos() {
  var tienda = obtenerTienda();
  if (!tienda || !Array.isArray(tienda.productos)) {
    return [];
  }
  return tienda.productos;
}

/**
 * Devuelve el listado de categorías de la tienda o un array vacío.
 */
function obtenerCategorias() {
  var tienda = obtenerTienda();
  if (!tienda || !Array.isArray(tienda.categorias)) {
    return [];
  }
  return tienda.categorias;
}

/**
 * Busca un producto por su id numérico dentro del listado de productos.
 */
function buscarProductoPorId(idProducto) {
  var productos = obtenerProductos();
  return productos.find(function (p) {
    return String(p.id) === String(idProducto);
  }) || null;
}

/**
 * Devuelve los productos que pertenecen a una categoría concreta.
 */
function obtenerProductosPorCategoria(idCategoria) {
  var productos = obtenerProductos();
  return productos.filter(function (p) {
    return String(p.id_categoria) === String(idCategoria);
  });
}

/**
 * Devuelve el listado de productos marcados como destacados.
 */
function obtenerProductosDestacados() {
  var productos = obtenerProductos();
  return productos.filter(function (p) {
    return Boolean(p.destacado);
  });
}

/**
 * Devuelve el listado de IDs de productos vistos recientemente.
 */
function obtenerIdsProductosVistos() {
  var json = localStorage.getItem('apex_recent_products');
  if (!json) {
    return [];
  }
  try {
    var datos = JSON.parse(json);
    if (Array.isArray(datos)) {
      return datos;
    }
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Guarda el listado de IDs de productos vistos recientemente en localStorage.
 */
function guardarIdsProductosVistos(ids) {
  localStorage.setItem('apex_recent_products', JSON.stringify(ids));
}

/**
 * Añade un producto al listado de vistos recientemente.
 * Se guarda solo el id, se evita que haya duplicados y se limita a un tamaño razonable.
 */
function marcarProductoComoVisto(idProducto) {
  var ids = obtenerIdsProductosVistos();

  // Elimina el id si ya existía para volver a colocarlo al principio.
  ids = ids.filter(function (id) {
    return String(id) !== String(idProducto);
  });

  // Inserta al principio de la lista.
  ids.unshift(idProducto);

  // Limita la lista a por ejemplo 8 productos.
  if (ids.length > 8) {
    ids = ids.slice(0, 8);
  }

  guardarIdsProductosVistos(ids);

  // Opcionalmente se puede avisar al servidor de que se han visto productos.
  sincronizarProductosVistosConServidor(ids);
}

/**
 * Devuelve los objetos producto que corresponden a los ids vistos.
 */
function obtenerProductosVistos() {
  var ids = obtenerIdsProductosVistos();
  var productos = obtenerProductos();
  return ids
    .map(function (id) {
      return productos.find(function (p) {
        return String(p.id) === String(id);
      });
    })
    .filter(function (p) {
      return Boolean(p);
    });
}

/**
 * Envía al servidor, de forma sencilla, la lista de IDs de productos vistos.
 * Esto se hace solo para validar el token tal y como pide la práctica.
 */
function sincronizarProductosVistosConServidor(ids) {
  var token = obtenerToken();
  if (!token) {
    return;
  }

  fetch('php/productos_vistos.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token,
      productos_vistos: ids
    })
  }).catch(function () {
    // Si falla, no pasa nada crítico para la navegación.
  });
}
