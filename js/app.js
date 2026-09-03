/**
 * Omnipost — storefront core (shared across pages)
 * Exposes: OP (product data), OP.api, OP.ui helpers, OP.fmt
 */
(function () {
  const qs = new URLSearchParams(location.search);

  const state = {
    products: [],
    currency: "تومان",
    site: location.origin,
    id: qs.get("id") ? +qs.get("id") : null,
    paid: qs.get("paid") === "success"
  };

  const OP = {
    qs,
    state,

    async fetchProducts() {
      const r = await fetch("/api/products");
      const d = await r.json();
      state.products = d.products || [];
      state.currency = d.currency || state.currency;
      state.site = d.site || state.site;
      return state.products;
    },

    fmt(n) {
      try { return Number(n).toLocaleString("fa-IR"); }
      catch { return String(n); }
    },

    price(p) {
      const cur = state.currency;
      const now = `${OP.fmt(p.price)} ${cur}`;
      if (p.old_price) {
        return `<span class="now">${now}</span> <span class="old">${OP.fmt(p.old_price)} ${cur}</span>`;
      }
      return `<span class="now">${now}</span>`;
    },

    stockBadge(p) {
      if (p.stock > 0) return `<span class="badge-stock stock-in">موجود</span>`;
      return `<span class="badge-stock stock-out">ناموجود</span>`;
    },

    productURL(p) {
      // relative → works on Worker root (/) and on GitHub Pages subpath (/omnipost/)
      return `product/${p.id}.html`;
    },

    thumbHTML(p, cls) {
      const img = (p.images && p.images[0]) ? `<img src="${p.images[0]}" alt="${p.title}" loading="lazy">`
        : `<div class="ph">🛍</div>`;
      return `<div class="${cls || ""}">${img}</div>`;
    },

    cardHTML(p) {
      return `<a class="pcard reveal" href="${OP.productURL(p)}">
        <div class="thumb">${OP.thumbHTML(p)}</div>
        <div class="body">
          ${p.category ? `<div class="cat">${p.category}</div>` : ""}
          <h3>${p.title}</h3>
          <div class="price">${OP.price(p)}</div>
          <div class="row" style="margin-top:.3rem">${OP.stockBadge(p)}</div>
        </div>
      </a>`;
    },

    toast(msg, type) {
      let t = document.querySelector(".toast");
      if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
      t.innerHTML = `<div style="${type === "err" ? "border-color:var(--bad)" : type === "ok" ? "border-color:var(--ok)" : ""}">${msg}</div>`;
      clearTimeout(OP._toastT);
      OP._toastT = setTimeout(() => (t.innerHTML = ""), 4200);
    },

    async reveal() {
      const els = document.querySelectorAll(".reveal:not(.in)");
      if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
      const io = new IntersectionObserver((ents) => {
        ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      els.forEach(e => io.observe(e));
    },

    themeToggle(btn) {
      const root = document.documentElement;
      const cur = root.dataset.theme || "dark";
      const next = cur === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("op-theme", next);
      if (btn) btn.textContent = next === "dark" ? "☀️" : "🌙";
    }
  };

  // init theme + button
  const savedTheme = localStorage.getItem("op-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.textContent = (document.documentElement.dataset.theme === "light") ? "🌙" : "☀️";
      b.addEventListener("click", () => OP.themeToggle(b));
    });
  });

  window.OP = OP;
})();
