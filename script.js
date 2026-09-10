/* =========================================================
   BURGERS & CO. — LÓGICA (JavaScript Vanilla)
   1. Datos del menú
   2. Render de tarjetas + filtro por categoría
   3. Carrito (agregar / quitar / cambiar cantidad)
   4. Formulario -> mensaje estructurado -> enlace de WhatsApp
   ========================================================= */

// --- CONFIGURA AQUÍ el número de WhatsApp del restaurante ---
// Formato internacional sin "+", símbolos ni espacios. Ej. Colombia: 57XXXXXXXXXX
const WHATSAPP_NUMBER = "573001015269";

/* ---------------------------------------------------------
   1. DATOS DEL MENÚ
   Cada producto tiene id, nombre, descripción, precio,
   categoría e imagen (Unsplash).
   --------------------------------------------------------- */
const MENU_ITEMS = [
  {
    id: "classic-cheese",
    name: "Classic Cheese",
    desc: "Carne de res, queso cheddar, lechuga, tomate y salsa de la casa.",
    price: 18000,
    category: "hamburguesas",
    img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bacon-smash",
    name: "Bacon Smash",
    desc: "Doble carne aplastada, tocineta crocante y queso americano fundido.",
    price: 22000,
    category: "hamburguesas",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bbq-crispy",
    name: "BBQ Crispy Chicken",
    desc: "Pollo crocante, salsa BBQ ahumada, cebolla morada y pepinillos.",
    price: 19500,
    category: "hamburguesas",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "papas-cheddar",
    name: "Papas Cheddar & Bacon",
    desc: "Papas fritas crocantes bañadas en queso cheddar y tocineta.",
    price: 12000,
    category: "acompanamientos",
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "aros-cebolla",
    name: "Aros de Cebolla",
    desc: "Aros de cebolla empanizados, fritos hasta quedar bien dorados.",
    price: 11000,
    category: "acompanamientos",
    img: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "gaseosa",
    name: "Gaseosa 400ml",
    desc: "Bien fría, a elegir entre cola, manzana o naranja.",
    price: 5000,
    category: "bebidas",
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "limonada",
    name: "Limonada de Coco",
    desc: "Limonada natural batida con coco, refrescante y cremosa.",
    price: 8000,
    category: "bebidas",
    img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80",
  },
];

// Color de acento por categoría, usado en el borde inferior de la tarjeta
const CATEGORY_ACCENT = {
  hamburguesas: "#d64545",
  acompanamientos: "#f2a93b",
  bebidas: "#f6ede0",
};

// Estado del carrito: { itemId: cantidad }
const cart = {};

/* ---------------------------------------------------------
   2. RENDER DEL MENÚ Y FILTROS
   --------------------------------------------------------- */
const menuGrid = document.getElementById("menuGrid");
const filterBar = document.getElementById("filterBar");

function formatCOP(value) {
  return "$" + value.toLocaleString("es-CO");
}

// Dibuja las tarjetas de producto para una categoría dada ("todas" = sin filtro)
function renderMenu(category = "todas") {
  const items =
    category === "todas"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === category);

  menuGrid.innerHTML = items
    .map(
      (item) => `
      <article class="product-card" style="--card-accent:${CATEGORY_ACCENT[item.category]}">
        <img class="product-img" src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="product-body">
          <h3 class="product-name">${item.name}</h3>
          <p class="product-desc">${item.desc}</p>
          <div class="product-footer">
            <span class="product-price">${formatCOP(item.price)}</span>
            <button class="add-btn" data-id="${item.id}">Agregar al pedido</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

// Click en los botones de filtro: actualiza estado visual y vuelve a renderizar
filterBar.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) return;

  filterBar
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");

  renderMenu(btn.dataset.category);
});

// Delegación de eventos: un solo listener para todos los botones "Agregar",
// incluso los que se vuelven a crear cada vez que se filtra el menú.
menuGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-btn");
  if (!btn) return;
  addToCart(btn.dataset.id);
});

/* ---------------------------------------------------------
   3. CARRITO
   --------------------------------------------------------- */
const orderList = document.getElementById("orderList");
const orderEmpty = document.getElementById("orderEmpty");
const orderTotalEl = document.getElementById("orderTotal");
const cartCountEl = document.getElementById("cartCount");
const whatsappBtn = document.getElementById("whatsappBtn");
const orderHint = document.getElementById("orderHint");

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

// Recalcula y vuelve a dibujar la lista del pedido, el total y el contador
function renderCart() {
  const entries = Object.entries(cart); // [ [id, cantidad], ... ]

  if (entries.length === 0) {
    orderList.innerHTML = "";
    orderList.appendChild(orderEmpty);
  } else {
    orderList.innerHTML = entries
      .map(([id, qty]) => {
        const item = MENU_ITEMS.find((p) => p.id === id);
        const subtotal = item.price * qty;
        return `
          <li class="order-item" data-id="${id}">
            <span class="order-item-name">${item.name}</span>
            <div class="order-item-controls">
              <button class="qty-btn" data-action="dec" data-id="${id}">−</button>
              <span>${qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
            </div>
            <span class="order-item-price">${formatCOP(subtotal)}</span>
          </li>
        `;
      })
      .join("");
  }

  const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = entries.reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find((p) => p.id === id);
    return sum + item.price * qty;
  }, 0);

  cartCountEl.textContent = totalItems;
  orderTotalEl.textContent = formatCOP(totalPrice);

  // El botón de WhatsApp solo se habilita si hay al menos un producto
  const hasItems = totalItems > 0;
  whatsappBtn.disabled = !hasItems;
  orderHint.style.display = hasItems ? "none" : "block";
}

// Delegación de eventos para los botones +/− dentro del resumen del pedido
orderList.addEventListener("click", (event) => {
  const btn = event.target.closest(".qty-btn");
  if (!btn) return;
  const delta = btn.dataset.action === "inc" ? 1 : -1;
  changeQty(btn.dataset.id, delta);
});

/* ---------------------------------------------------------
   4. ENVÍO DEL PEDIDO POR WHATSAPP
   Construye un mensaje de texto estructurado con los productos,
   el total y los datos del cliente, y abre wa.me con ese texto.
   --------------------------------------------------------- */
const orderForm = document.getElementById("orderForm");

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const entries = Object.entries(cart);
  if (entries.length === 0) return; // Seguridad extra: no hay nada que enviar

  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const note = document.getElementById("customerNote").value.trim();

  // Construye el detalle de productos, línea por línea
  const itemsText = entries
    .map(([id, qty]) => {
      const item = MENU_ITEMS.find((p) => p.id === id);
      return `• ${qty}x ${item.name} — ${formatCOP(item.price * qty)}`;
    })
    .join("\n");

  const total = entries.reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find((p) => p.id === id);
    return sum + item.price * qty;
  }, 0);

  const message = [
    "¡Hola Burgers & Co.! Quiero hacer este pedido:",
    "",
    itemsText,
    "",
    `Total: ${formatCOP(total)}`,
    "",
    `Nombre: ${name}`,
    `Dirección: ${address}`,
    note ? `Nota: ${note}` : null,
  ]
    .filter(Boolean) // quita la línea de nota si está vacía
    .join("\n");

  // encodeURIComponent asegura que saltos de línea y tildes viajen bien en la URL
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

/* ---------------------------------------------------------
   NAVEGACIÓN: scroll suave + menú hamburguesa en móvil
   --------------------------------------------------------- */
const mainNav = document.getElementById("mainNav");
const navToggle = document.getElementById("navToggle");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Cierra el menú móvil al elegir un enlace (el scroll suave lo da el CSS: scroll-behavior)
mainNav.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// El botón flotante del carrito lleva directo a la sección de pedido
document.getElementById("cartBtn").addEventListener("click", () => {
  document.getElementById("pedido").scrollIntoView({ behavior: "smooth" });
});

/* ---------------------------------------------------------
   INICIALIZACIÓN
   --------------------------------------------------------- */
renderMenu();
renderCart();