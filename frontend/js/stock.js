function renderMovements() {

  fetchMovements()
    .then(response => {

      const tbody =
        document.getElementById("movements-table");

      if (!response.data.length) {

        tbody.innerHTML = `
          <tr>
            <td colspan="5">
              <div class="empty">
                Aucun mouvement enregistré.
              </div>
            </td>
          </tr>
        `;

        return;
      }


      tbody.innerHTML = response.data.map(movement => `

        <tr>

          <td>
            <strong>
              ${movement.product_name}
            </strong>
          </td>

          <td>

            ${
              movement.type === "IN"

                ? `<span class="status ok">
                    <i class="fa-solid fa-arrow-down"></i>
                    Entrée
                   </span>`

                : `<span class="status low">
                    <i class="fa-solid fa-arrow-up"></i>
                    Sortie
                   </span>`
            }

          </td>

          <td>
            <strong>${movement.quantity}</strong>
          </td>

          <td>
            ${movement.reason || "-"}
          </td>

          <td>
            ${new Date(
              movement.created_at
            ).toLocaleString("fr-FR")}
          </td>

        </tr>

      `).join("");

    })

    .catch(error => {

      showToast(error.message, "error");

    });


  populateStockProducts();
}


function populateStockProducts() {

  const select =
    document.getElementById("stock-product");

  if (!select) return;

  select.innerHTML = appData.products.map(product => `

    <option value="${product.id}">
      ${product.name} — Stock: ${product.quantity}
    </option>

  `).join("");
}


async function handleStockSubmit(event) {

  event.preventDefault();

  try {

    await createStockMovement({

      product_id:
        Number(
          document.getElementById("stock-product").value
        ),

      type:
        document.getElementById("stock-type").value,

      quantity:
        Number(
          document.getElementById("stock-quantity").value
        ),

      reason:
        document.getElementById("stock-reason").value

    });


    document
      .getElementById("stock-form")
      .reset();

    document
      .getElementById("stock-modal")
      .classList.remove("show");

    showToast("Mouvement enregistré.");

    await loadDashboard();

    renderMovements();

  } catch (error) {

    showToast(error.message, "error");

  }

}


window.renderMovements = renderMovements;


document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("stock-form")
    ?.addEventListener(
      "submit",
      handleStockSubmit
    );

});