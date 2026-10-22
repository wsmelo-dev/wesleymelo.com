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
