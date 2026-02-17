document.addEventListener("DOMContentLoaded", () => {
  // ====== CONFIG ======
  const WEDDING_DATETIME = "2026-10-10T16:30:00";
  const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o%20Ah%2C%20Mar%21%20Rua%20Praia%20de%20Arpoador%20157%20Vilas%20do%20Atl%C3%A2ntico%20Lauro%20de%20Freitas%20BA";
  const INSTAGRAM_URL = "https://www.instagram.com/espaco_ahmar/?hl=en";
  const STORAGE_KEY = "wedding_rsvp_demo_pt";

  const $ = (sel) => document.querySelector(sel);

  // ====== Toast ======
  const toast = (msg) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => { el.style.display = "none"; }, 3200);
  };

  // ====== Smooth scroll ======
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });

      // se menu mobile estiver aberto, fecha
      const navLinks = $("#navLinks");
      const hamburger = $(".hamburger");
      if (navLinks && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        if (hamburger) hamburger.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ====== Navbar shrink on scroll ======
  const navbar = $(".navbar");
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  };
  window.addEventListener("scroll", onScroll);
  onScroll();

  // ====== Mobile menu toggle (class) ======
  const hamburger = $(".hamburger");
  const navLinks = $("#navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ====== Map / Insta links ======
  const btnMaps = $("#btnMaps");
  const btnMaps2 = $("#btnMaps2");
  const btnInsta = $("#btnInsta");

  if (btnMaps) btnMaps.href = GOOGLE_MAPS_URL;
  if (btnMaps2) btnMaps2.href = GOOGLE_MAPS_URL;
  if (btnInsta) btnInsta.href = INSTAGRAM_URL;

  // ====== Countdown ======
  const countdownEl = $("#countdown");
  const target = new Date(WEDDING_DATETIME);

  const pad = (n) => String(n).padStart(2, "0");

  function updateCountdown() {
    if (!countdownEl) return;

    if (isNaN(target.getTime())) {
      countdownEl.textContent = "Data inválida. Ajuste WEDDING_DATETIME no script.";
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

    const dayLabel = (days === 1) ? "dia" : "dias";
    countdownEl.textContent = `${days} ${dayLabel} · ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ====== RSVP (demo localStorage) ======
  const form = $("#rsvpForm");
  const btnClear = $("#btnClearRsvp");

  const loadForm = () => {
    if (!form) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;

      $("#rsvpName").value = saved.name || "";
      $("#rsvpEmail").value = saved.email || "";
      $("#rsvpPresence").value = saved.presence || "";
      $("#rsvpGuests").value = saved.guests || "1";
      $("#rsvpNotes").value = saved.notes || "";
    } catch {}
  };

  const clearForm = () => {
    if (!form) return;
    form.reset();
    localStorage.removeItem(STORAGE_KEY);
    toast("RSVP limpo neste navegador.");
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        name: $("#rsvpName").value.trim(),
        email: $("#rsvpEmail").value.trim(),
        presence: $("#rsvpPresence").value,
        guests: $("#rsvpGuests").value,
        notes: $("#rsvpNotes").value.trim(),
        savedAt: new Date().toISOString(),
      };

      if (!data.name || !data.email || !data.presence) {
        toast("Preencha nome, e-mail e presença.");
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast("RSVP salvo (demonstração). Obrigado.");
    });
  }

  if (btnClear) btnClear.addEventListener("click", clearForm);
  loadForm();

  // ====== Galeria: arrastar (pointer) + teclado ======
  (function () {
    const strip = document.querySelector(".gallery-strip");
    if (!strip) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    strip.addEventListener("pointerdown", (e) => {
      if (typeof e.button === "number" && e.button !== 0) return;
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

    strip.addEventListener("keydown", (e) => {
      const slide = strip.querySelector(".slide");
      const gap = 12;
      const step = slide ? (slide.getBoundingClientRect().width + gap) : 320;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        strip.scrollBy({ left: step, behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        strip.scrollBy({ left: -step, behavior: "smooth" });
      } else if (e.key === "Home") {
        e.preventDefault();
        strip.scrollTo({ left: 0, behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        strip.scrollTo({ left: strip.scrollWidth, behavior: "smooth" });
      }
    });
  })();
});
