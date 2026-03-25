
async function loadTravelOptions() {
  const res = await fetch("../data/travel-options.json", { cache: "no-store" });
  const data = await res.json();

  const lastUpdate = document.getElementById("last-update");
  const container = document.getElementById("travel-results");

  lastUpdate.innerHTML = `
    <p><strong>Última actualización:</strong> ${data.updated_at}</p>
  `;

  container.innerHTML = data.sections.map(section => `
    <section class="card">
      <h2>${section.title}</h2>
      <p>${section.description || ""}</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Precio total</th>
              <th>Fechas</th>
              <th>Duración</th>
              <th>Paradas</th>
              <th>Aerolíneas</th>
            </tr>
          </thead>
          <tbody>
            ${section.options.map(opt => `
              <tr>
                <td>${opt.total_price_cop}</td>
                <td>${opt.outbound_date} → ${opt.return_date}</td>
                <td>${opt.total_duration}</td>
                <td>${opt.stops}</td>
                <td>${opt.airlines}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      ${section.options.map(opt => `
        <details>
          <summary>${opt.label}</summary>
          <ul>
            ${opt.segments.map(seg => `
              <li>
                <strong>${seg.carrier}</strong>
                ${seg.origin} ${seg.departure_local} → ${seg.destination} ${seg.arrival_local}
              </li>
            `).join("")}
          </ul>
        </details>
      `).join("")}
    </section>
  `).join("");
}

loadTravelOptions().catch(err => {
  document.getElementById("travel-results").innerHTML =
    `<p>No fue posible cargar los datos de viaje.</p>`;
  console.error(err);
});
