/* ============================================================
   ui.js — tema, idioma, navegação, relógio, revelação, toast
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  };

  var doc = document.documentElement;
  var themeBtn = $("#themeBtn");
  var menuBtn = $("#menuBtn");
  var menu = $("#mobileMenu");
  var toastEl = $("#toast");
  var toastTimer = null;
  var currentLang = store.get("wsm.lang") === "en" ? "en" : "pt";

  /* ---------- entrar sempre no início ----------
     o navegador restaura a posição de rolagem anterior em refresh
     (aqui isso mandava o visitante direto para o contato);
     deep links com #hash continuam funcionando. */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && !location.hash) window.scrollTo(0, 0);
  });

  /* ---------- tema ---------- */
  function currentTheme() {
    return doc.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    if (theme === "dark") doc.setAttribute("data-theme", "dark");
    else doc.removeAttribute("data-theme");
    store.set("wsm.theme", theme);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------- idioma ---------- */
  function applyLang(lang, persist) {
    var dict = window.COPY && window.COPY[lang];
    if (!dict) return;
    currentLang = lang;
    doc.lang = dict.lang;

    $$("[data-i18n]").forEach(function (el) {
      var text = dict[el.getAttribute("data-i18n")];
      if (typeof text === "string") el.textContent = text;
    });

    $$("[data-i18n-ph]").forEach(function (el) {
      var text = dict[el.getAttribute("data-i18n-ph")];
      if (typeof text === "string") el.setAttribute("placeholder", text);
    });

    $$("[data-i18n-aria]").forEach(function (el) {
      var text = dict[el.getAttribute("data-i18n-aria")];
      if (typeof text === "string") el.setAttribute("aria-label", text);
    });

    $$("[data-i18n-alt]").forEach(function (el) {
      var text = dict[el.getAttribute("data-i18n-alt")];
      if (typeof text === "string") el.setAttribute("alt", text);
    });

    $$("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    if (menuBtn && menu && menu.getAttribute("data-open") === "true") {
      var label = menuBtn.querySelector("span") || menuBtn;
      label.textContent = dict["nav.close"];
    }

    var page = document.body.getAttribute("data-page") || "home";
    var title = dict[page + ".meta.title"];
    var desc = dict[page + ".meta.desc"];
    if (title) document.title = title;
    var meta = $('meta[name="description"]');
    if (meta && desc) meta.setAttribute("content", desc);

    if (persist !== false) store.set("wsm.lang", lang);
  }

  $$("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"), true);
    });
  });

  /* ---------- menu mobile ---------- */
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.setAttribute("data-open", String(open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    if (open) menu.removeAttribute("inert");
    else menu.setAttribute("inert", "");
    document.body.classList.toggle("is-locked", open);

    var label = menuBtn.querySelector("span") || menuBtn;
    var dict = window.COPY[currentLang];
    label.textContent = dict[open ? "nav.close" : "nav.menu"];
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menu.getAttribute("data-open") !== "true");
    });

    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.getAttribute("data-open") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });

    var wide = window.matchMedia("(min-width: 861px)");
    var onChange = function (event) { if (event.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener("change", onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  /* ---------- topbar ao rolar ---------- */
  var topbar = $(".topbar");
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle("is-scrolled", window.pageYOffset > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- relógio ---------- */
  var clock = $("#clock");
  if (clock) {
    var formatter = null;
    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hourCycle: "h23"
      });
    } catch (e) { formatter = null; }

    var tick = function () {
      clock.textContent = formatter ? formatter.format(new Date()) : "--:--:--";
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- revelação ao entrar na tela (com escalonado) ---------- */
  var reveal = $$(".rv");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveal.length) {
    if ("IntersectionObserver" in window && !reduced) {
      var batchOrder = 0;
      var io = new IntersectionObserver(function (entries) {
        var entering = entries.filter(function (entry) { return entry.isIntersecting; });
        entering.forEach(function (entry, order) {
          var el = entry.target;
          el.style.transitionDelay = (order * 70) + "ms";
          el.addEventListener("transitionend", function clear() {
            el.style.transitionDelay = "";
            el.removeEventListener("transitionend", clear);
          });
          el.classList.add("in");
          io.unobserve(el);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- seção ativa no menu ---------- */
  var spiedLinks = $$(".topnav a[href^='#']");
  var spiedSections = spiedLinks
    .map(function (link) { return $(link.getAttribute("href")); })
    .filter(Boolean);
  if (spiedSections.length && "IntersectionObserver" in window && !reduced) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        spiedLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spiedSections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- toast ---------- */
  function toast(message, duration) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.setAttribute("data-show", "true");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.setAttribute("data-show", "false");
    }, duration || 5200);
  }

  /* ---------- acordeões (etapas e desafios) ---------- */
  $$(".acc").forEach(function (group) {
    var items = $$(".acc__item", group);
    var single = group.getAttribute("data-single") === "true";

    var setItem = function (item, open) {
      var btn = $(".acc__btn", item);
      var panel = $(".acc__panel", item);
      item.classList.toggle("is-open", open);
      if (btn) btn.setAttribute("aria-expanded", String(open));
      if (panel) {
        if (open) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      }
    };

    items.forEach(function (item) {
      var btn = $(".acc__btn", item);
      var panel = $(".acc__panel", item);
      if (!btn || !panel) return;

      var open = btn.getAttribute("aria-expanded") === "true";
      setItem(item, open);

      btn.addEventListener("click", function () {
        var next = !item.classList.contains("is-open");
        if (next && single) {
          items.forEach(function (other) {
            if (other !== item) setItem(other, false);
          });
        }
        setItem(item, next);
      });
    });
  });

  /* ---------- carrossel de capturas (compartilhado) ----------
     setas do sistema, teclado e toque; panorâmico wrap-around */
  $$("[data-crs]").forEach(function (crs) {
    var view = $(".crs__viewport", crs);
    var track = $(".crs__track", crs);
    var slides = track ? $$(".crs__slide", track) : [];
    var count = $(".crs__count", crs);
    var buttons = $$(".crs__btn[data-dir]", crs);
    var index = 0;

    if (!slides.length || !track || !view) return;

    var pad = function (n) { return n < 9 ? "0" + (n + 1) : String(n + 1); };

    var update = function () {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        if (active) {
          slide.removeAttribute("aria-hidden");
          slide.removeAttribute("inert");
        } else {
          slide.setAttribute("aria-hidden", "true");
          slide.setAttribute("inert", "");
        }
      });
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (count) count.textContent = pad(index) + " / " + pad(slides.length - 1);
      /* +1 = borda superior do viewport (box-sizing:border-box) */
      view.style.height = (slides[index].offsetHeight + 1) + "px";
    };

    var go = function (dir) {
      index = (index + dir + slides.length) % slides.length;
      update();
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(Number(btn.getAttribute("data-dir")) || 0);
      });
    });

    view.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    });

    var startX = null;
    view.addEventListener("pointerdown", function (event) { startX = event.clientX; });
    view.addEventListener("pointerup", function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });

    window.addEventListener("resize", update);
    slides.forEach(function (slide) {
      $$("img", slide).forEach(function (img) {
        if (!img.complete) img.addEventListener("load", update);
      });
    });

    update();
  });

  /* ---------- API mínima para as páginas ---------- */
  window.WSM = {
    t: function (key) {
      var dict = window.COPY && window.COPY[currentLang];
      return (dict && dict[key]) || "";
    },
    lang: function () { return currentLang; },
    toast: toast
  };

  /* ---------- início ---------- */
  applyLang(currentLang, false);
  setMenu(false);
  setTheme(currentTheme());
})();
