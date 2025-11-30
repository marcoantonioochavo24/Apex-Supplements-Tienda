// Lógica específica para la página dashboard.html.

/**
 * Crea el HTML de una tarjeta de producto en formato string.
 */
function crearHtmlTarjetaProducto(producto) {
  var destacadoChip = producto.destacado
    ? '<span class="chip">Destacado</span>'
    : '<span class="chip">Apex Quality</span>';

  return (
    '<article class="card product-card">' +
    '<div class="product-image-wrapper">' +
    '<img class="product-image" src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
    '</div>' +
    '<h3 class="product-title">' + producto.nombre + '</h3>' +
    '<div class="product-meta">' +
    '<span>' + (producto.formato || '') + '</span>' +
    '<span>' + (producto.sabor || '') + '</span>' +
    '</div>' +
    '<div class="product-meta">' +
    destacadoChip +
    '<span class="product-price">' + formatearPrecioEuros(producto.precio) + '</span>' +
    '</div>' +
    '<div class="product-actions">' +
    '<button class="btn-primary btn-add-cart" data-id="' + producto.id + '">Añadir al carrito</button>' +
    '<a href="product.html?id=' + producto.id + '" class="product-link">Ver detalles</a>' +
    '</div>' +
    '</article>'
  );
}

/**
 * Pinta en el dashboard los productos destacados de la tienda.
 */
function cargarProductosDestacadosEnDashboard() {
  var contenedor = document.getElementById('featuredProducts');
  if (!contenedor) {
    return;
  }

  var destacados = obtenerProductosDestacados();

  if (destacados.length === 0) {
    contenedor.innerHTML = '<p>No hay productos destacados ahora mismo.</p>';
    return;
  }

  contenedor.innerHTML = destacados
    .map(function (p) {
      return crearHtmlTarjetaProducto(p);
    })
    .join('');

  // Asocia la acción de añadir al carrito a los botones recién creados.
  contenedor.querySelectorAll('.btn-add-cart').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var id = boton.getAttribute('data-id');
      anadirProductoAlCarrito(id, 1);
    });
  });
}

/**
 * Pinta un pequeño grid con las categorías de la tienda.
 */
function cargarCategoriasEnDashboard() {
  var contenedor = document.getElementById('homeCategories');
  if (!contenedor) {
    return;
  }

  var categorias = obtenerCategorias();

  if (categorias.length === 0) {
    contenedor.innerHTML = '<p>No hay categorías disponibles.</p>';
    return;
  }

  contenedor.innerHTML = categorias
    .map(function (cat) {
      return (
        '<article class="card category-card">' +
        '<h3 class="category-name">' + cat.nombre + '</h3>' +
        '<p class="category-tagline">Explora los ' + cat.nombre.toLowerCase() + ' de Apex.</p>' +
        '<div>' +
        '<a href="categories.html?id=' + cat.id + '" class="product-link">Ver productos</a>' +
        '</div>' +
        '</article>'
      );
    })
    .join('');
}

/**
 * Pinta la sección de productos vistos recientemente.
 */
function cargarProductosVistosEnDashboard() {
  var contenedor = document.getElementById('recentProducts');
  if (!contenedor) {
    return;
  }

  var vistos = obtenerProductosVistos();

  if (vistos.length === 0) {
    contenedor.innerHTML = '<p>Aquí aparecerán los productos que vayas visitando.</p>';
    return;
  }

  contenedor.innerHTML = vistos
    .map(function (p) {
      return (
        '<article class="card product-card">' +
        '<div class="product-image-wrapper">' +
        '<img class="product-image" src="' + p.imagen + '" alt="' + p.nombre + '">' +
        '</div>' +
        '<h3 class="product-title">' + p.nombre + '</h3>' +
        '<div class="product-meta">' +
        '<span>' + (p.formato || '') + '</span>' +
        '<span>' + (p.sabor || '') + '</span>' +
        '</div>' +
        '<div class="product-meta">' +
        '<span class="product-price">' + formatearPrecioEuros(p.precio) + '</span>' +
        '</div>' +
        '<div class="product-actions">' +
        '<button class="btn-primary btn-add-cart" data-id="' + p.id + '">Añadir</button>' +
        '<a href="product.html?id=' + p.id + '" class="product-link">Ver de nuevo</a>' +
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
 * Inicializa todo el contenido dinámico del dashboard.
 */
document.addEventListener('DOMContentLoaded', function () {
  // Primero se protege la página para evitar acceder sin token.
  protegerPagina();

  // Después se cargan los datos del dashboard.
  cargarProductosDestacadosEnDashboard();
  cargarCategoriasEnDashboard();
  cargarProductosVistosEnDashboard();
});
