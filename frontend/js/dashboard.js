let appData = {
  products: [],
  categories: [],
  stats: null
};


function formatMoney(value) {
  return Number(value || 0).toLocaleString("fr-FR") + " FCFA";
}


function showToast(message, type = "success") {

  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}


function stockStatus(product) {

  if (Number(product.quantity) === 0) {
    return `<span class="status out">Rupture</span>`;
  }

  if (Number(product.quantity) <= Number(product.min_stock_alert)) {
    return `<span class="status low">Stock faible</span>`;
  }

  return `<span class="status ok">Disponible</span>`;
}


function renderDashboardProducts(products) {

  const tbody = document.getElementById("dashboard-products");

  const list = products.slice(0, 7);

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty">Aucun produit.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(product => `
    <tr>

      <td>
        <div class="product-name">${product.name}</div>
        <div class="product-sub">#${product.id}</div>
      </td>

      <td>${product.category_name || "Sans catégorie"}</td>

      <td>${formatMoney(product.selling_price)}</td>

      <td>
        <strong>${product.quantity}</strong>
      </td>

      <td>
        ${stockStatus(product)}
      </td>

    </tr>
  `).join("");
}


function renderLowStock(products) {

  const container = document.getElementById("low-stock-list");

  const low = products.filter(
    p => Number(p.quantity) <= Number(p.min_stock_alert)
  );

  document.getElementById("alert-badge").textContent = low.length;

  document.getElementById("notification-dot").style.display =
    low.length ? "block" : "none";

  if (!low.length) {
    container.innerHTML = `
      <div class="empty">
        <i class="fa-solid fa-circle-check"></i>
        <br>
        Aucun stock critique.
      </div>
    `;
    return;
  }

  container.innerHTML = low.slice(0, 5).map(product => `
    <div class="alert-item">

      <div>
        <strong>${product.name}</strong>
        <span>
          Seuil : ${product.min_stock_alert}
        </span>
      </div>

      <div class="alert-number">
        ${product.quantity}
      </div>

    </div>
  `).join("");
}


function renderRecentSales(sales) {

  const tbody = document.getElementById("recent-sales");

  if (!sales.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty">
            Aucune vente enregistrée.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sales.map(sale => `
    <tr>

      <td>
        <strong>#${sale.id}</strong>
      </td>

      <td>
        ${new Date(sale.created_at).toLocaleString("fr-FR")}
      </td>

      <td>
        <strong>${formatMoney(sale.total_amount)}</strong>
      </td>

      <td>
        <span class="status ok">
          ${formatMoney(sale.profit)}
        </span>
      </td>

    </tr>
  `).join("");
}


async function loadDashboard() {

  try {

    const [statsResponse, productsResponse, categoriesResponse] =
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchCategories()
      ]);

    appData.stats = statsResponse.data;
    appData.products = productsResponse.data;
    appData.categories = categoriesResponse.data;

    const stats = appData.stats;

    document.getElementById("stat-products").textContent =
      stats.total_products;

    document.getElementById("stat-low").textContent =
      stats.low_stock_count;

    document.getElementById("stat-revenue").textContent =
      formatMoney(stats.revenue);

    document.getElementById("stat-profit").textContent =
      formatMoney(stats.profit);

    renderDashboardProducts(appData.products);

    renderLowStock(appData.products);

    renderRecentSales(stats.recent_sales || []);

  } catch (error) {

    console.error(error);

    showToast(
      "Impossible de charger les données.",
      "error"
    );
  }
}


function setupNavigation() {

  document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

      const section = button.dataset.section;

      switchSection(section);

    });

  });


  document.querySelectorAll("[data-section-target]").forEach(button => {

    button.addEventListener("click", () => {

      switchSection(button.dataset.sectionTarget);

    });

  });

}


function switchSection(section) {

  document.querySelectorAll(".nav-item").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.section === section
    );

  });


  document.querySelectorAll(".section").forEach(element => {

    element.classList.toggle(
      "active",
      element.id === `section-${section}`
    );

  });


  if (section === "products") {
    window.renderProducts?.();
  }

  if (section === "stock") {
    window.renderMovements?.();
  }

  if (section === "sales") {
    window.renderSales?.();
  }

  if (section === "categories") {
    window.renderCategories?.();
  }

  if (section === "alerts") {
    window.renderAlerts?.();
  }
}


function setupModals() {

  document.querySelectorAll("[data-open-modal]").forEach(button => {

    button.addEventListener("click", () => {

      const modal = document.getElementById(
        button.dataset.openModal
      );

      modal.classList.add("show");

    });

  });


  document.querySelectorAll(".close-modal").forEach(button => {

    button.addEventListener("click", () => {

      button.closest(".modal-overlay").classList.remove("show");

    });

  });


  document.querySelectorAll(".modal-overlay").forEach(overlay => {

    overlay.addEventListener("click", event => {

      if (event.target === overlay) {
        overlay.classList.remove("show");
      }

    });

  });

}


async function handleProductSubmit(event) {

  event.preventDefault();

  try {

    await createProduct({

      name: document.getElementById("product-name").value,

      category_id:
        document.getElementById("product-category").value || null,

      cost_price:
        Number(document.getElementById("product-cost").value),

      selling_price:
        Number(document.getElementById("product-selling").value),

      quantity:
        Number(document.getElementById("product-quantity").value),

      min_stock_alert:
        Number(document.getElementById("product-alert").value)

    });


    document.getElementById("product-form").reset();

    document
      .getElementById("product-modal")
      .classList.remove("show");

    showToast("Produit créé avec succès.");

    await loadDashboard();

    window.renderProducts?.();

  } catch (error) {

    showToast(error.message, "error");

  }

}


async function handleCategorySubmit(event) {

  event.preventDefault();

  try {

    await createCategory({

      name: document.getElementById("category-name").value

    });

    document.getElementById("category-form").reset();

    document
      .getElementById("category-modal")
      .classList.remove("show");

    showToast("Catégorie créée avec succès.");

    await loadDashboard();

    window.renderCategories?.();

  } catch (error) {

    showToast(error.message, "error");

  }

}


function populateCategorySelects() {

  const options = appData.categories.map(category => `
    <option value="${category.id}">
      ${category.name}
    </option>
  `).join("");

  document.getElementById("product-category").innerHTML =
    `<option value="">Sans catégorie</option>${options}`;

  document.getElementById("category-filter").innerHTML =
    `<option value="">Toutes les catégories</option>${options}`;
}


document.addEventListener("DOMContentLoaded", async () => {

  setupNavigation();

  setupModals();

  document
    .getElementById("product-form")
    .addEventListener("submit", handleProductSubmit);

  document
    .getElementById("category-form")
    .addEventListener("submit", handleCategorySubmit);


  document
    .getElementById("refresh-btn")
    .addEventListener("click", async () => {

      await loadDashboard();

      populateCategorySelects();

      showToast("Données actualisées.");

    });


  await loadDashboard();

  populateCategorySelects();

});

window.renderCategories = function () {

  const container =
    document.getElementById("categories-grid");

  if (!appData.categories.length) {

    container.innerHTML = `
      <div class="panel empty">
        Aucune catégorie.
      </div>
    `;

    return;
  }


  container.innerHTML = appData.categories.map(category => `

    <div class="category-card">

      <div class="category-icon">
        <i class="fa-solid fa-layer-group"></i>
      </div>

      <h3>${category.name}</h3>

      <p>
        ${category.product_count || 0} produit(s)
      </p>

    </div>

  `).join("");

};


window.renderAlerts = function () {

  const container =
    document.getElementById("alerts-grid");

  const alerts =
    appData.products.filter(
      product =>
        Number(product.quantity) <=
        Number(product.min_stock_alert)
    );


  if (!alerts.length) {

    container.innerHTML = `
      <div class="panel empty">
        <i class="fa-solid fa-circle-check"></i>
        <br><br>
        Aucun produit ne nécessite votre attention.
      </div>
    `;

    return;

  }


  container.innerHTML = alerts.map(product => `

    <div class="alert-card">

      <div style="display:flex;gap:13px;align-items:center;">

        <div class="alert-card-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <div>

          <strong>
            ${product.name}
          </strong>

          <div class="product-sub">
            ${product.category_name || "Sans catégorie"}
          </div>

        </div>

      </div>

      <div>

        <strong>
          ${product.quantity}
        </strong>

        <div class="product-sub">
          seuil ${product.min_stock_alert}
        </div>

      </div>

    </div>

  `).join("");

};