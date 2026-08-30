/**
 * Portfolio interactions
 * - Mobile navigation
 * - Scroll spy + reveal
 * - Mouse-reactive particle canvas
 * - Contact form frontend validation (no backend)
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initNav();
  initScrollSpy();
  initReveals();
  initContactForm();
  if (!prefersReducedMotion) {
    initParticles();
  }
})();

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initScrollSpy() {
  const links = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          link.toggleAttribute("aria-current", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    message: form.querySelector("#message"),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (input, message) => {
    const holder = form.querySelector(`[data-error-for="${input.id}"]`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (holder) holder.textContent = message || "";
  };

  const validate = () => {
    let valid = true;

    const name = fields.name.value.trim();
    if (name.length < 2) {
      setError(fields.name, "Please enter your name (at least 2 characters).");
      valid = false;
    } else {
      setError(fields.name, "");
    }

    const email = fields.email.value.trim();
    if (!emailPattern.test(email)) {
      setError(fields.email, "Please enter a valid email address.");
      valid = false;
    } else {
      setError(fields.email, "");
    }

    const message = fields.message.value.trim();
    if (message.length < 10) {
      setError(fields.message, "Please enter a message of at least 10 characters.");
      valid = false;
    } else {
      setError(fields.message, "");
    }

    return valid;
  };

  ["input", "blur"].forEach((eventName) => {
    form.addEventListener(eventName, (event) => {
      if (event.target.matches("input, textarea")) validate();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("is-success", "is-error");

    if (!validate()) {
      status.classList.add("is-error");
      status.textContent = "Please fix the highlighted fields and try again.";
      return;
    }

    status.classList.add("is-success");
    status.textContent = "Thank you. Your message is ready — connect this form to a backend when available.";
    form.reset();
    Object.values(fields).forEach((input) => setError(input, ""));
  });
}

function initParticles() {
  const canvas = document.querySelector("#bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const mouse = { x: 0.5, y: 0.4 };
  const colors = ["#E2B4BD", "#F7D6D0", "#4A4A4A"];
  let particles = [];
  let width = 0;
  let height = 0;
  let raf = 0;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((width * height) / 28000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const mx = mouse.x * width;
    const my = mouse.y * height;

    particles.forEach((p, i) => {
      const dx = mx - p.x;
      const dy = my - p.y;
      p.vx += dx * 0.000008;
      p.vy += dy * 0.000008;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.color === "#4A4A4A" ? 0.12 : 0.45;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.globalAlpha = (1 - dist / 110) * 0.12;
          ctx.strokeStyle = "#E2B4BD";
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };

  window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX / window.innerWidth;
    mouse.y = event.clientY / window.innerHeight;
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });
}
