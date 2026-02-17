// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });

      // fecha menu mobile ao clicar
      closeMobileMenu();
    });
  });

  // Navbar scroll effect (mais suave)
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.style.padding = "1rem 0";
      navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.10)";
    } else {
      navbar.style.padding = "1.5rem 0";
      navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
    }
  });

  // Mobile Menu Toggle (por classe, sem inline styles agressivos)
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  function openMobileMenu() {
    if (!navLinks) return;
    navLinks.style.display = "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "100%";
    navLinks.style.left = "0";
    navLinks.style.width = "100%";
    navLinks.style.backgroundColor = "white";
    navLinks.style.padding = "2rem";
    navLinks.style.boxShadow = "0 5px 10px rgba(0,0,0,0.1)";
    if (hamburger) hamburger.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    if (!navLinks) return;
    if (window.innerWidth <= 768) {
      navLinks.style.display = "none";
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (!navLinks) return;
      const isOpen = navLinks.style.display === "flex";
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }

  window.addEventListener("resize", () => {
    // em desktop volta ao layout normal
    if (!navLinks) return;
    if (window.innerWidth > 768) {
      navLinks.removeAttribute("style");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    } else {
      navLinks.style.display = "none";
    }
  });

  // RSVP demo
  const form = document.getElementById("rsvp-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("name")?.value || "").trim();
      alert(`Obrigado, ${name || "convidado(a)"}! Sua presença foi confirmada. Mal podemos esperar para celebrar com você!`);
      form.reset();
    });
  }

  // Ícones
  if (window.lucide) window.lucide.createIcons();

  // Garante autoplay em alguns navegadores (mudo)
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    const tryPlay = heroVideo.play();
    if (tryPlay && typeof tryPlay.catch === "function") tryPlay.catch(() => {});
  }
});
