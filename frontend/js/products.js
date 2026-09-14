function renderProducts() {

  const tbody = document.getElementById("products-table");

  let products = [...appData.products];

  const search =
    document.getElementById("product-search")?.value
      .toLowerCase()
      .trim();

  const category =
    document.getElementById("category-filter")?.value;


  if (search) {

    products = products.filter(product =>
      product.name.toLowerCase().includes(search)
    );

  }


  if (category) {

    products = products.filter(
      product => String(product.category_id) === category
    );

  }


  if (!products.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty">
            Aucun produit trouvé.
          </div>
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML = products.map(product => `

    <tr>

      <td>
        <div class="product-name">
          ${product.name}
        </div>

        <div class="product-sub">
          Réf. #${product.id}
        </div>
      </td>

      <td>
        ${product.category_name || "Sans catégorie"}
      </td>

      <td>
        ${formatMoney(product.cost_price)}
      </td>

      <td>
        <strong>
          ${formatMoney(product.selling_price)}
        </strong>
      </td>

      <td>
        <strong>
          ${product.quantity}
        </strong>
      </td>

      <td>
        ${stockStatus(product)}
      </td>

    </tr>

  `).join("");
}


document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("product-search")
    ?.addEventListener("input", renderProducts);

  document
    .getElementById("category-filter")
    ?.addEventListener("change", renderProducts);

});