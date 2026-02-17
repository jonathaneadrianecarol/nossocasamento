// script.js
(() => {
  // ===== Config =====
  const WEDDING_DATETIME = "2026-10-10T16:30:00";
  const GOOGLE_MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o%20Ah%2C%20Mar%21%20Rua%20Praia%20de%20Arpoador%20157%20Vilas%20do%20Atl%C3%A2ntico%20Lauro%20de%20Freitas%20BA";
  const STORAGE_KEY = "wedding_rsvp_demo_pt";

  // ===== Helpers =====
  const $ = (sel) => document.querySelector(sel);

  const toast = (msg) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => (el.style.display = "none"), 3200);
  };

  // ===== Smooth scroll =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // fecha menu mobile ao clicar
      document.body.classList.remove("nav-open");
      const toggle = $(".nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  // ===== Mobile menu =====
  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ===== Maps button =====
  const btnMaps = $("#btnMaps");
  if (btnMaps) btnMaps.href = GOOGLE_MAPS_URL;

  // ===== Countdown =====
  const countdownEl = $("#countdown");
  const target = new Date(WEDDING_DATETIME);

  const pad = (n) => String(n).padStart(2, "0");

  function updateCountdown() {
    if (!countdownEl) return;

    if (isNaN(target.getTime())) {
      countdownEl.textContent = "Data inválida. Ajuste WEDDING_DATETIME.";
      return;
    }

    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      countdownEl.textContent = "É hoje. Nos vemos já já.";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownEl.textContent = `${days} dias · ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===== RSVP (demo localStorage) =====
  const form = $("#rsvpForm");
  const btnLimpar = $("#btnLimpar");

  function loadForm() {
    if (!form) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      $("#nome").value = saved.nome || "";
      $("#email").value = saved.email || "";
      $("#presenca").value = saved.presenca || "";
      $("#qtd").value = saved.qtd || "1";
      $("#restricoes").value = saved.restricoes || "";
    } catch {
      /* ignore */
    }
  }

  function clearForm() {
    if (!form) return;
    form.reset();
    localStorage.removeItem(STORAGE_KEY);
    toast("RSVP limpo neste navegador.");
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        nome: $("#nome").value.trim(),
        email: $("#email").value.trim(),
        presenca: $("#presenca").value,
        qtd: $("#qtd").value,
        restricoes: $("#restricoes").value.trim(),
        savedAt: new Date().toISOString(),
      };

      if (!data.nome || !data.email || !data.presenca) {
        toast("Preencha nome, e-mail e presença.");
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast("RSVP salvo (demonstração). Obrigado.");
    });
  }

  if (btnLimpar) btnLimpar.addEventListener("click", clearForm);
  loadForm();

  // ===== Galeria: arrastar horizontalmente (pointer) =====
  (function () {
    const strip = document.querySelector(".gallery-strip");
    if (!strip) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    strip.addEventListener("pointerdown", (e) => {
      isDown = true;
      strip.classList.add("dragging");
      strip.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startScroll = strip.scrollLeft;
    });

    strip.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      strip.scrollLeft = startScroll - dx;
    });

    const end = () => {
      isDown = false;
      strip.classList.remove("dragging");
    };

    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);
    strip.addEventListener("pointerleave", end);
  })();
})();
