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

function classifySection(section) {
  const title = (section.title || "").toLowerCase();

  if (title.includes("cúcuta") || title.includes("cucuta")) {
    return "cucuta";
  }

  if (title.includes("bogotá") || title.includes("bogota")) {
    if (title.includes("río") || title.includes("rio")) {
      return "strategies";
    }
    return "bogota";
  }

  if (
    title.includes("são paulo") ||
    title.includes("sao paulo") ||
    title.includes("río") ||
    title.includes("rio") ||
    title.includes("bus")
  ) {
    return "strategies";
  }

  return "strategies";
}

async function loadTravelOptions() {
  const lastUpdateEl = document.getElementById("last-update");
  const cucutaEl = document.getElementById("travel-results-cucuta");
  const bogotaEl = document.getElementById("travel-results-bogota");
  const strategiesEl = document.getElementById("travel-results-strategies");

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

    const cucutaSections = [];
    const bogotaSections = [];
    const strategySections = [];

    sections.forEach(section => {
      const kind = classifySection(section);
      if (kind === "cucuta") cucutaSections.push(section);
      else if (kind === "bogota") bogotaSections.push(section);
      else strategySections.push(section);
    });

    cucutaEl.innerHTML = cucutaSections.length
      ? cucutaSections.map(renderSection).join("")
      : `<p class="muted">Todavía no hay resultados publicados para Cúcuta.</p>`;

    bogotaEl.innerHTML = bogotaSections.length
      ? bogotaSections.map(renderSection).join("")
      : `<p class="muted">Todavía no hay resultados publicados para Bogotá.</p>`;

    strategiesEl.innerHTML = strategySections.length
      ? strategySections.map(renderSection).join("")
      : `<p class="muted">Todavía no hay estrategias publicadas.</p>`;

  } catch (error) {
    console.error(error);
    lastUpdateEl.innerHTML = `<strong>Última actualización:</strong> no disponible`;

    const errorHtml = `
      <div class="error-box">
        No fue posible cargar las opciones de viaje en este momento.
      </div>
    `;

    cucutaEl.innerHTML = errorHtml;
    bogotaEl.innerHTML = errorHtml;
    strategiesEl.innerHTML = errorHtml;
  }
}

loadTravelOptions();
