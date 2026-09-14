function createSaleRow() {

  const container =
    document.getElementById("sale-items");

  const row = document.createElement("div");

  row.className = "sale-row";


  const options = appData.products.map(product => `

    <option
      value="${product.id}"
      data-price="${product.selling_price}"
    >
      ${product.name} — ${formatMoney(product.selling_price)}
    </option>

  `).join("");


  row.innerHTML = `

    <select class="sale-product">

      ${options}

    </select>


    <input
      type="number"
      class="sale-quantity"
      value="1"
      min="1"
    >


    <button
      type="button"
      class="remove-sale"
    >

      <i class="fa-solid fa-trash"></i>

    </button>

  `;


  row
    .querySelector(".remove-sale")
    .addEventListener("click", () => {

      row.remove();

      updateSaleTotal();

    });


  row
    .querySelector(".sale-product")
    .addEventListener("change", updateSaleTotal);


  row
    .querySelector(".sale-quantity")
    .addEventListener("input", updateSaleTotal);


  container.appendChild(row);

  updateSaleTotal();
}


function updateSaleTotal() {

  let total = 0;

  document
    .querySelectorAll(".sale-row")
    .forEach(row => {

      const select =
        row.querySelector(".sale-product");

      const quantity =
        Number(
          row.querySelector(".sale-quantity").value
        );

      const price =
        Number(
          select.selectedOptions[0]?.dataset.price || 0
        );

      total += price * quantity;

    });


  document.getElementById("sale-total").textContent =
    formatMoney(total);
}


async function handleSaleSubmit(event) {

  event.preventDefault();


  const items = [];


  document
    .querySelectorAll(".sale-row")
    .forEach(row => {

      items.push({

        product_id:
          Number(
            row.querySelector(".sale-product").value
          ),

        quantity:
          Number(
            row.querySelector(".sale-quantity").value
          )

      });

    });


  if (!items.length) {

    showToast(
      "Ajoutez au moins un produit.",
      "error"
    );

    return;
  }


  try {

    await createSale({ items });


    document.getElementById("sale-items").innerHTML = "";

    document
      .getElementById("sale-modal")
      .classList.remove("show");

    showToast("Vente enregistrée avec succès.");

    await loadDashboard();

    renderSales();

  } catch (error) {

    showToast(error.message, "error");

  }

}


function renderSales() {

  fetchSales()
    .then(response => {

      const tbody =
        document.getElementById("sales-table");

      if (!response.data.length) {

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


      tbody.innerHTML =
        response.data.map(sale => `

          <tr>

            <td>
              <strong>#${sale.id}</strong>
            </td>

            <td>
              ${new Date(
                sale.created_at
              ).toLocaleString("fr-FR")}
            </td>

            <td>
              <strong>
                ${formatMoney(sale.total_amount)}
              </strong>
            </td>

            <td>
              <span class="status ok">
                ${formatMoney(sale.profit)}
              </span>
            </td>

          </tr>

        `).join("");

    })
    .catch(error => {

      showToast(error.message, "error");

    });

}


window.renderSales = renderSales;


document.addEventListener("DOMContentLoaded", () => {

  document
    .querySelector(".add-sale-product")
    ?.addEventListener(
      "click",
      createSaleRow
    );


  document
    .getElementById("sale-form")
    ?.addEventListener(
      "submit",
      handleSaleSubmit
    );


  document
    .getElementById("sale-modal")
    ?.addEventListener("click", event => {

      if (
        event.target.id === "sale-modal" &&
        document.querySelectorAll(".sale-row").length === 0
      ) {
        createSaleRow();
      }

    });

});