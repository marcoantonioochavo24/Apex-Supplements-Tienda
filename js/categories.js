// Lógica específica para la página categories.html.

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
 * Devuelve una pequeña descripción corta según el nombre de la categoría.
 * Esto es solo para hacer las tarjetas un poco más explicativas.
 */
function generarDescripcionParaCategoria(nombreCategoria) {
  var nombre = (nombreCategoria || '').toLowerCase();

  if (nombre.includes('prote')) {
    return 'Proteínas para recuperación y construcción muscular.';
  }
  if (nombre.includes('pre')) {
    return 'Pre-entrenos para llegar enchufado a cada serie.';
  }
  if (nombre.includes('amino')) {
    return 'Aminoácidos, creatina y más para rendimiento fino.';
  }
  return 'Snacks, vitaminas y accesorios para completar tu stack.';
}

/**
 * Pinta el listado de categorías en el contenedor principal.
 * También marca como seleccionada la categoría activa, si hay alguna.
 */
function renderizarListadoCategorias(idCategoriaActiva) {
  var contenedor = document.getElementById('categoriesList');
  if (!contenedor) {
    return;
  }

  var categorias = obtenerCategorias();

  if (categorias.length === 0) {
    contenedor.innerHTML = '<p>No hay categorías disponibles.</p>';
    return;
  }

  // Genera el HTML de cada tarjeta de categoría.
  contenedor.innerHTML = categorias
    .map(function (cat) {
      var activa = String(cat.id) === String(idCategoriaActiva);
      var descripcion = generarDescripcionParaCategoria(cat.nombre);

      return (
        '<article class="card category-card" data-id="' + cat.id + '">' +
        '<h3 class="category-name">' + cat.nombre + '</h3>' +
        '<p class="category-tagline">' + descripcion + '</p>' +
        '<div>' +
        '<span class="chip">' + (activa ? 'Seleccionada' : 'Ver productos') + '</span>' +
        '</div>' +
        '</article>'
      );
    })
    .join('');

  // Añade el manejador de clic a cada tarjeta para cambiar de categoría.
  contenedor.querySelectorAll('.category-card').forEach(function (tarjeta) {
    tarjeta.addEventListener('click', function () {
      var id = tarjeta.getAttribute('data-id');
      // Actualiza los productos mostrados.
      renderizarProductosDeCategoria(id);

      // Actualiza el estado visual de las tarjetas.
      marcarTarjetaCategoriaActiva(id);

      // Actualiza la URL sin recargar la página.
      var params = new URLSearchParams(window.location.search);
      params.set('id', id);
      var nuevaUrl = window.location.pathname + '?' + params.toString();
      window.history.replaceState({}, '', nuevaUrl);
    });
  });

  // Marca inicialmente la categoría activa si venía por URL.
  marcarTarjetaCategoriaActiva(idCategoriaActiva);
}

/**
 * Marca visualmente una tarjeta de categoría como activa.
 */
function marcarTarjetaCategoriaActiva(idCategoriaActiva) {
  var tarjetas = document.querySelectorAll('.category-card');
  tarjetas.forEach(function (tarjeta) {
    var id = tarjeta.getAttribute('data-id');
    var chip = tarjeta.querySelector('.chip');

    // Si coincide el id, se considera activa.
    var esActiva = String(id) === String(idCategoriaActiva);

    // Ajusta opacidad y texto para que se note cuál está seleccionada.
    tarjeta.style.opacity = esActiva ? '1' : '0.78';
    tarjeta.style.borderColor = esActiva
      ? 'rgba(34, 197, 94, 0.7)'
      : 'rgba(31, 41, 55, 0.9)';

    if (chip) {
      chip.textContent = esActiva ? 'Seleccionada' : 'Ver productos';
    }
  });
}

/**
 * Crea el HTML de una tarjeta de producto que se mostrará
 * dentro de la sección de productos por categoría.
 */
function crearHtmlTarjetaProductoCategoria(producto) {
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
 * Actualiza el título y subtítulo de la sección de productos
 * con el nombre de la categoría seleccionada.
 */
function actualizarTituloCategoriaSeleccionada(categoria) {
  var tituloEl = document.getElementById('currentCategoryTitle');
  var subtituloEl = document.getElementById('currentCategorySubtitle');

  if (!tituloEl || !subtituloEl) {
    return;
  }

  if (!categoria) {
    tituloEl.textContent = 'Productos de la categoría';
    subtituloEl.textContent = 'Selecciona una categoría para ver sus suplementos.';
    return;
  }

  tituloEl.textContent = 'Productos de ' + categoria.nombre;
  subtituloEl.textContent = 'Todos los suplementos de la categoría ' + categoria.nombre + '.';
}

/**
 * Pinta los productos que pertenecen a una categoría concreta.
 * Si no se pasa id, se deja un mensaje indicando que elija categoría.
 */
function renderizarProductosDeCategoria(idCategoria) {
  var contenedor = document.getElementById('categoryProducts');
  if (!contenedor) {
    return;
  }

  if (!idCategoria) {
    contenedor.innerHTML = '<p>Elige una categoría para ver los productos disponibles.</p>';
    actualizarTituloCategoriaSeleccionada(null);
    return;
  }

  // Obtiene productos e información de la categoría.
  var productos = obtenerProductosPorCategoria(idCategoria);
  var categorias = obtenerCategorias();
  var categoria = categorias.find(function (cat) {
    return String(cat.id) === String(idCategoria);
  });

  // Actualiza los textos de la cabecera.
  actualizarTituloCategoriaSeleccionada(categoria || null);

  if (productos.length === 0) {
    contenedor.innerHTML = '<p>No hay productos en esta categoría de momento.</p>';
    return;
  }

  // Genera el HTML de cada producto.
  contenedor.innerHTML = productos
    .map(function (p) {
      return crearHtmlTarjetaProductoCategoria(p);
    })
    .join('');

  // Añade el evento de añadir al carrito a cada botón.
  contenedor.querySelectorAll('.btn-add-cart').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var id = boton.getAttribute('data-id');
      anadirProductoAlCarrito(id, 1);
    });
  });
}

/**
 * Inicializa toda la página de categorías:
 *  - Protege la página comprobando el token.
 *  - Muestra el listado de categorías.
 *  - Carga los productos de la categoría indicada en la URL (si existe).
 */
document.addEventListener('DOMContentLoaded', function () {
  // Evita acceso sin autenticación.
  protegerPagina();

  // Obtiene la categoría inicial desde la URL, si la hay.
  var idCategoriaInicial = obtenerParametroUrl('id');

  // Pinta las categorías con esa selección inicial.
  renderizarListadoCategorias(idCategoriaInicial);

  // Pinta los productos de esa categoría, o deja el mensaje por defecto.
  renderizarProductosDeCategoria(idCategoriaInicial);
});
