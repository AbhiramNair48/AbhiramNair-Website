/* ==========================================================================
   Abhiram Nair - personal site
   Two small jobs: a light/dark toggle, and assembling the email address at
   runtime so it is not sitting in the HTML source for scrapers to harvest.
   The page is fully usable with JavaScript disabled.
   ========================================================================== */
(function () {
  "use strict";

  /* --- Theme ----------------------------------------------------------- */
  var root = document.documentElement;

  function readStored() {
    try {
      return window.localStorage.getItem("theme");
    } catch (err) {
      return null; // private mode, blocked site data, etc.
    }
  }

  function store(value) {
    try {
      window.localStorage.setItem("theme", value);
    } catch (err) {
      /* nothing to do; the toggle still works for this page view */
    }
  }

  function prefersDark() {
    return window.matchMedia &&
           window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || (prefersDark() ? "dark" : "light");
  }

  function apply(theme, button) {
    root.setAttribute("data-theme", theme);
    if (button) {
      var next = theme === "dark" ? "light" : "dark";
      button.textContent = theme === "dark" ? "☼" : "☾"; // sun / moon
      button.setAttribute("aria-label", "Switch to " + next + " theme");
      button.setAttribute("title", "Switch to " + next + " theme");
    }
  }

  var saved = readStored();
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-theme", saved);
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.hidden = false;
    apply(currentTheme(), toggle);
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      apply(next, toggle);
      store(next);
    });
  }

  /* --- Email ------------------------------------------------------------ */
  var slots = document.querySelectorAll("[data-email-user][data-email-domain]");
  Array.prototype.forEach.call(slots, function (slot) {
    var address = slot.getAttribute("data-email-user") + "@" +
                  slot.getAttribute("data-email-domain");
    var link = document.createElement("a");
    link.href = "mailto:" + address;
    link.textContent = slot.getAttribute("data-email-label") || address;
    while (slot.firstChild) { slot.removeChild(slot.firstChild); }
    slot.appendChild(link);

    var extra = slot.getAttribute("data-email-class");
    if (extra) {
      extra.split(/\s+/).forEach(function (cls) {
        if (cls) { slot.classList.add(cls); }
      });
    }
  });
})();
