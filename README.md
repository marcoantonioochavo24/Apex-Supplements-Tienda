# APEX SUPPLEMENTS – Tienda online (Práctica HTML + JS + PHP)

Proyecto de tienda online de suplementos deportivos desarrollado como práctica de HTML5, CSS3, JavaScript (con LocalStorage) y PHP (API REST con JSON).

El cliente web gestiona toda la experiencia de compra desde el navegador y solo se conecta al servidor para:
- Autenticarse (login con token).
- Validar el carrito y los precios en el servidor.
- Registrar productos vistos recientemente.

---

## 1. Objetivo del proyecto

El objetivo es implementar una aplicación web completa que simule una tienda online de suplementos:

- **Autenticación** mediante usuario/contraseña y token.
- **Carga de datos de tienda** (categorías y productos) desde JSON.
- **Gestión de carrito** en el cliente con LocalStorage.
- **Productos vistos recientemente** almacenados también en LocalStorage.
- **Validación de precios** en el servidor para evitar manipulaciones desde el cliente.
- **Diseño moderno** con estética “neón” acorde a la temática de suplementos.

---

## 2. Tecnologías utilizadas

### Frontend

- **HTML5**
- **CSS3**
- **JavaScript (vanilla)**  
  - Uso de `LocalStorage` para:
    - Token de autenticación.
    - Información de la tienda (productos y categorías).
    - Carrito de compras.
    - Productos vistos recientemente.
  - Uso de `fetch` para consumir la API en PHP.

### Backend

- **PHP** (API REST sencilla)
- **JSON** como formato de almacenamiento:
  - `data/usuarios.json`
  - `data/tienda.json`

### Almacenamiento en el cliente

- `localStorage` con las claves:
  - `apex_token` – Token de autenticación.
  - `apex_user` – Datos básicos del usuario autenticado.
  - `apex_store` – Datos de la tienda (categorías y productos).
  - `apex_cart` – Carrito de compras.
  - `apex_recent_products` – IDs de productos vistos recientemente.

---

## 3. Estructura del proyecto

```text
APEX-SUPPLEMENTS-TIENDA/
├─ css/
│  └─ styles.css               # Estilos globales (login + panel + carrito + fichas)
├─ data/
│  ├─ tienda.json              # Estructura de la tienda (categorías + productos)
│  └─ usuarios.json            # Usuarios válidos para el login
├─ img/
│  ├─ logo-apex.png            # Logo principal de la tienda
│  ├─ gorila-apex.png          # (opcional) imagen hero
│  └─ productos/               # Imágenes de productos
├─ js/
│  ├─ auth.js                  # Lógica de autenticación, token y cierre de sesión
│  ├─ store.js                 # Acceso a datos de la tienda en localStorage
│  ├─ dashboard.js             # Lógica de la página dashboard.html
│  ├─ categories.js            # Lógica de la página categories.html
│  ├─ product-page.js          # Lógica de la página product.html
│  ├─ cart.js                  # Gestión genérica del carrito (añadir, eliminar, total…)
│  ├─ cart-page.js             # Pintado del carrito y envío al servidor
│  └─ ui.js                    # Componentes de interfaz (toasts, helpers)
├─ php/
│  ├─ config.php               # Config común del servidor + token fijo
│  ├─ login.php                # Endpoint de login (devuelve token + tienda)
│  ├─ carrito.php              # Endpoint para validar precios del carrito
│  └─ productos_vistos.php     # Endpoint para registrar productos vistos
├─ cart.html                   # Carrito de compras
├─ categories.html             # Listado de categorías y sus productos
├─ dashboard.html              # Panel inicial con destacados y recomendados
├─ product.html                # Ficha detallada de producto
├─ login.html                  # Pantalla de acceso con formulario de login
├─ index.html                  # Redirección rápida al login
└─ README.md                   # Este documento
