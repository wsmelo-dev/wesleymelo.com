/* ============================================================
   home.js — formulário de contato (mailto, com validação)
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var name = document.getElementById("c-name");
  var message = document.getElementById("c-message");
  var nameErr = document.getElementById("c-name-err");
  var messageErr = document.getElementById("c-message-err");
  if (!name || !message || !nameErr || !messageErr) return;

  function setError(input, target, text) {
    target.textContent = text || "";
    if (text) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  name.addEventListener("input", function () { setError(name, nameErr, ""); });
  message.addEventListener("input", function () { setError(message, messageErr, ""); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var valueName = name.value.trim();
    var valueMessage = message.value.trim();
    var ok = true;

    if (!valueName) {
      setError(name, nameErr, window.WSM.t("home.contact.errName"));
      ok = false;
    } else {
      setError(name, nameErr, "");
    }

    if (!valueMessage) {
      setError(message, messageErr, window.WSM.t("home.contact.errMsg"));
      ok = false;
    } else {
      setError(message, messageErr, "");
    }

    if (!ok) {
      if (!valueName) name.focus();
      else message.focus();
      return;
    }

    var subject = window.WSM.t("home.contact.mailSubject").replace("{name}", valueName);
    var body = window.WSM.t("home.contact.mailBody")
      .replace("{name}", valueName)
      .replace("{message}", valueMessage);

    var href = "mailto:wesleysantosmelo2022@gmail.com"
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);

    window.location.href = href;
    window.WSM.toast(window.WSM.t("home.contact.toast"));
  });
})();

/* ---------- copiar e-mail ---------- */
(function () {
  var btn = document.getElementById("copyMail");
  if (!btn) return;

  var email = "wesleysantosmelo2022@gmail.com";

  function copied() { window.WSM.toast(window.WSM.t("home.contact.copied")); }
  function failed() { window.WSM.toast(window.WSM.t("home.contact.copyFail")); }

  function fallback() {
    var area = document.createElement("textarea");
    area.value = email;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(area);
    if (ok) copied(); else failed();
  }

  btn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(copied, fallback);
    } else {
      fallback();
    }
  });
})();
