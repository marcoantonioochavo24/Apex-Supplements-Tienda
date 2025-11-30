// Lógica específica para la página product.html.

var productoActual = null;

/**
 * Obtiene el valor de un parámetro de la URL por su nombre.
 * Si no existe, devuelve null.
 */
function obtenerParametroUrl(nombre) {
  var params = new URLSearchParams(window.location.search);
  var valor = params.get(nombre);
  return valor === null ? null : valor;
}

/**
 * Crea el HTML de un pequeño chip (etiqueta redondeada) con un texto.
 */
function crearChip(texto) {
  return '<span class="chip">' + texto + '</span>';
}

/**
 * Rellena en la ficha los datos básicos del producto:
 * título, subtítulo, imagen, meta, descripción y precio.
 */
function pintarDatosProducto(producto) {
  var tituloEl = document.getElementById('productTitle');
  var subtituloEl = document.getElementById('productSubtitle');
  var imagenEl = document.getElementById('productImage');
  var metaEl = document.getElementById('productMeta');
  var descripcionEl = document.getElementById('productDescription');
  var precioEl = document.getElementById('productPrice');

  if (tituloEl) {
    tituloEl.textContent = producto.nombre;
  }

  if (subtituloEl) {
    var partes = [];
    if (producto.formato) {
      partes.push(producto.formato);
    }
    if (producto.sabor) {
      partes.push(producto.sabor);
    }
    subtituloEl.textContent = partes.join(' · ');
  }

  if (imagenEl) {
    imagenEl.src = producto.imagen;
    imagenEl.alt = producto.nombre;
  }

  if (metaEl) {
    var textoMeta = '';
    if (producto.formato) {
      textoMeta += 'Formato: ' + producto.formato;
    }
    if (producto.sabor) {
      if (textoMeta !== '') {
        textoMeta += ' · ';
      }
      textoMeta += 'Sabor: ' + producto.sabor;
    }
    metaEl.textContent = textoMeta;
  }

  if (descripcionEl) {
    descripcionEl.textContent =
      producto.descripcion_corta ||
      'Suplemento de la gama Apex diseñado para mejorar tu rendimiento.';
  }

  if (precioEl) {
    precioEl.textContent = formatearPrecioEuros(producto.precio);
  }
}

/**
 * Rellena el bloque de chips con información de categoría y tipo.
 */
function pintarChipsProducto(producto) {
  var contenedor = document.getElementById('productBadges');
  if (!contenedor) {
    return;
  }

  var html = '';

  var categorias = obtenerCategorias();
  var categoria = categorias.find(function (cat) {
    return String(cat.id) === String(producto.id_categoria);
  });

  if (categoria) {
    html += crearChip('Categoría: ' + categoria.nombre);
  }

  if (producto.tipo) {
    html += ' ' + crearChip('Tipo: ' + producto.tipo);
  }

  if (producto.destacado) {
    html += ' ' + crearChip('Destacado Apex');
  }

  contenedor.innerHTML = html;
}

/**
 * Crea el enlace "Ver más de [categoría]" debajo de la ficha del producto.
 */
function pintarEnlaceVolverACategoria(producto) {
  var contenedor = document.getElementById('backToCategoryWrapper');
  if (!contenedor) {
    return;
  }

  var categorias = obtenerCategorias();
  var categoria = categorias.find(function (cat) {
    return String(cat.id) === String(producto.id_categoria);
  });

  if (!categoria) {
    contenedor.innerHTML = '';
    return;
  }

  var html =
    '<a href="categories.html?id=' +
    categoria.id +
    '" class="product-link">Ver más de ' +
    categoria.nombre +
    '</a>';

  contenedor.innerHTML = html;
}

/**
 * Pinta un grid de productos relacionados de la misma categoría
 * excluyendo el producto actual.
 */
function pintarProductosRelacionados(producto) {
  var contenedor = document.getElementById('relatedProducts');
  if (!contenedor) {
    return;
  }

  var todos = obtenerProductosPorCategoria(producto.id_categoria);

  var relacionados = todos.filter(function (p) {
    return String(p.id) !== String(producto.id);
  });

  if (relacionados.length === 0) {
    contenedor.innerHTML =
      '<p>No hay más productos en esta categoría ahora mismo.</p>';
    return;
  }

  relacionados = relacionados.slice(0, 3);

  contenedor.innerHTML = relacionados
    .map(function (p) {
      return (
        '<article class="card product-card">' +
        '<div class="product-image-wrapper">' +
        '<img class="product-image" src="' +
        p.imagen +
        '" alt="' +
        p.nombre +
        '">' +
        '</div>' +
        '<h3 class="product-title">' +
        p.nombre +
        '</h3>' +
        '<div class="product-meta">' +
        '<span>' +
        (p.formato || '') +
        '</span>' +
        '<span>' +
        (p.sabor || '') +
        '</span>' +
        '</div>' +
        '<div class="product-meta">' +
        '<span class="product-price">' +
        formatearPrecioEuros(p.precio) +
        '</span>' +
        '</div>' +
        '<div class="product-actions">' +
        '<button class="btn-primary btn-add-cart" data-id="' +
        p.id +
        '">Añadir al carrito</button>' +
        '<a href="product.html?id=' +
        p.id +
        '" class="product-link">Ver ficha</a>' +
        '</div>' +
        '</article>'
      );
    })
    .join('');

  contenedor.querySelectorAll('.btn-add-cart').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var id = boton.getAttribute('data-id');
      anadirProductoAlCarrito(id, 1);
    });
  });
}

/**
 * Configura el botón de añadir al carrito de la ficha concreta,
 * usando la cantidad seleccionada por el usuario.
 */
function inicializarBotonAnadirAlCarrito() {
  var boton = document.getElementById('addToCartButton');
  var inputCantidad = document.getElementById('quantity');

  if (!boton || !inputCantidad) {
    return;
  }

  boton.addEventListener('click', function () {
    if (!productoActual) {
      mostrarToast('No se ha encontrado el producto.', 'error');
      return;
    }

    var cantidad = parseInt(inputCantidad.value, 10);
    if (isNaN(cantidad) || cantidad < 1) {
      cantidad = 1;
      inputCantidad.value = '1';
    }

    anadirProductoAlCarrito(productoActual.id, cantidad);
  });
}

/**
 * Muestra un mensaje de error en la página cuando no se puede cargar el producto.
 */
function mostrarErrorDeProducto(mensaje) {
  var main = document.querySelector('.page-main');
  if (!main) {
    alert(mensaje);
    return;
  }

  main.innerHTML =
    '<section>' +
    '<div class="section-header">' +
    '<div>' +
    '<h1 class="section-title">Producto no disponible</h1>' +
    '<p class="section-subtitle">' +
    mensaje +
    '</p>' +
    '</div>' +
    '</div>' +
    '<p><a href="dashboard.html" class="product-link">Volver al inicio</a></p>' +
    '</section>';
}

/**
 * Inicializa toda la lógica de la ficha de producto:
 *  - Protege la página.
 *  - Obtiene el id por URL.
 *  - Busca el producto en la tienda.
 *  - Rellena la ficha.
 *  - Marca el producto como visto.
 *  - Pinta productos relacionados.
 */
document.addEventListener('DOMContentLoaded', function () {
  protegerPagina();

  var id = obtenerParametroUrl('id');
  if (!id) {
    mostrarErrorDeProducto('No se ha indicado ningún producto.');
    return;
  }

  var producto = buscarProductoPorId(id);
  if (!producto) {
    mostrarErrorDeProducto('El producto indicado no existe en la tienda.');
    return;
  }

  productoActual = producto;

  pintarDatosProducto(producto);
  pintarChipsProducto(producto);
  pintarEnlaceVolverACategoria(producto);
  inicializarBotonAnadirAlCarrito();
  pintarProductosRelacionados(producto);

  marcarProductoComoVisto(producto.id);
});
