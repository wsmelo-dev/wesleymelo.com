/* ============================================================
   case.js — capturas ampliáveis em <dialog>
   ============================================================ */
(function () {
  "use strict";

  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var image = dialog.querySelector("img");
  var caption = dialog.querySelector("[data-lightbox-cap]");
  var closeBtn = dialog.querySelector(".lightbox__close");
  var lastTrigger = null;

  var triggers = Array.prototype.slice.call(document.querySelectorAll(".shot__btn[data-full]"));

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var source = trigger.querySelector("img");
      var figure = trigger.closest(".shot");
      var text = figure ? figure.querySelector("figcaption span") : null;

      lastTrigger = trigger;
      image.src = trigger.getAttribute("data-full");
      image.alt = source ? source.getAttribute("alt") : "";
      if (caption) caption.textContent = text ? text.textContent : "";
      dialog.showModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () { dialog.close(); });
  }

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  });
})();

/* ============================================================
   carrossel das capturas — setas do sistema, teclado e toque
   ============================================================ */
(function () {
  "use strict";

  var crs = document.getElementById("fluxo-crs");
  if (!crs || !("addEventListener" in window)) return;

  var view = crs.querySelector(".crs__viewport");
  var track = crs.querySelector(".crs__track");
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var count = crs.querySelector(".crs__count");
  var buttons = Array.prototype.slice.call(crs.querySelectorAll(".crs__btn[data-dir]"));
  var index = 0;

  if (!slides.length || !track || !view) return;

  function pad(n) {
    return n < 9 ? "0" + (n + 1) : String(n + 1);
  }

  function update() {
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
  }

  function go(dir) {
    index = (index + dir + slides.length) % slides.length;
    update();
  }

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
    Array.prototype.forEach.call(slide.querySelectorAll("img"), function (img) {
      if (!img.complete) img.addEventListener("load", update);
    });
  });

  update();
})();
