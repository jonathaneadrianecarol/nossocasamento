function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSegments(segments) {
  if (!segments || !segments.length) {
    return `<p class="muted">Sin detalle de tramos.</p>`;
  }

  return `
    <div class="segments">
      ${segments.map(seg => `
        <div class="segment">
          <div class="segment-top">
            <strong>${escapeHtml(seg.carrier || "—")}</strong>
            ${seg.flight_number ? `<span class="flight-number">${escapeHtml(seg.flight_number)}</span>` : ""}
          </div>
          <div class="segment-route">
            ${escapeHtml(seg.origin || "—")} → ${escapeHtml(seg.destination || "—")}
          </div>
          <div class="segment-time">
            ${escapeHtml(seg.departure_local || "—")} → ${escapeHtml(seg.arrival_local || "—")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderOption(option) {
  return `
    <article class="option-card">
      <div class="option-header">
        <div>
          <h3>${escapeHtml(option.label || "Opción")}</h3>
          <p class="airlines">${escapeHtml(option.airlines || "—")}</p>
        </div>
        <div class="price">${escapeHtml(option.total_price_cop || "—")}</div>
      </div>

      <div class="summary-grid">
        <div>
          <span class="label">Fechas</span>
          <div>${escapeHtml(option.outbound_date || "—")} → ${escapeHtml(option.return_date || "—")}</div>
        </div>
        <div>
          <span class="label">Duración total</span>
          <div>${escapeHtml(option.total_duration || "—")}</div>
        </div>
        <div>
          <span class="label">Paradas</span>
          <div>${escapeHtml(option.stops || "—")}</div>
        </div>
      </div>

      <details class="details">
        <summary>Ver detalle de tramos</summary>
        ${renderSegments(option.segments)}
      </details>
    </article>
  `;
}

function renderSection(section) {
  const options = Array.isArray(section.options) ? section.options : [];

  return `
    <section class="result-block">
      <div class="block-head">
        <h2>${escapeHtml(section.title || "Resultado")}</h2>
        ${section.description ? `<p>${escapeHtml(section.description)}</p>` : ""}
      </div>

      ${
        options.length
          ? `<div class="options-list">${options.map(renderOption).join("")}</div>`
          : `<p class="muted">No hay resultados cargados todavía para este bloque.</p>`
      }
    </section>
  `;
}

async function loadTravelOptions() {
  const lastUpdateEl = document.getElementById("last-update");
  const resultsEl = document.getElementById("travel-results");

  try {
    const response = await fetch("../data/travel-options.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const updatedAt = data.updated_at || "sin información";
    const sections = Array.isArray(data.sections) ? data.sections : [];

    lastUpdateEl.innerHTML = `<strong>Última actualización:</strong> ${escapeHtml(updatedAt)}`;

    if (!sections.length) {
      resultsEl.innerHTML = `<p class="muted">Todavía no hay resultados publicados.</p>`;
      return;
    }

    resultsEl.innerHTML = sections.map(renderSection).join("");
  } catch (error) {
    console.error(error);
    lastUpdateEl.innerHTML = `<strong>Última actualización:</strong> no disponible`;
    resultsEl.innerHTML = `
      <div class="error-box">
        No fue posible cargar las opciones de viaje en este momento.
      </div>
    `;
  }
}

loadTravelOptions();
