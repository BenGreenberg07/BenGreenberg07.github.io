// Temporary font picker. Loaded only when the address ends in ?fonts. Delete this file and its loader in index.html when a font is chosen.
(function () {
  var sets = [
    { name: "Inter + JetBrains Mono (current)", sans: '"Inter"', mono: '"JetBrains Mono"', q: "family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600" },
    { name: "IBM Plex Sans + Plex Mono", sans: '"IBM Plex Sans"', mono: '"IBM Plex Mono"', q: "family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600" },
    { name: "DM Sans + DM Mono", sans: '"DM Sans"', mono: '"DM Mono"', q: "family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500" },
    { name: "Geist + Geist Mono", sans: '"Geist"', mono: '"Geist Mono"', q: "family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500;600" },
    { name: "Source Serif 4 + Source Code Pro", sans: '"Source Serif 4"', mono: '"Source Code Pro"', q: "family=Source+Serif+4:wght@400;500;600;700&family=Source+Code+Pro:wght@500;600" }
  ];
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?" + sets.map(function (s) { return s.q; }).join("&") + "&display=swap";
  document.head.appendChild(link);

  var fallbackSans = ', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  var fallbackSerif = ', Georgia, "Times New Roman", serif';
  var fallbackMono = ', ui-monospace, SFMono-Regular, Menlo, monospace';

  var css = document.createElement("style");
  css.textContent =
    "#fontpick{position:fixed;left:12px;bottom:12px;z-index:200;display:flex;flex-direction:column;gap:4px;max-width:calc(100vw - 24px);" +
    "background:rgba(255,255,255,.96);border:1px solid #d8d8dc;border-radius:10px;padding:8px;box-shadow:0 6px 24px rgba(0,0,0,.18);font:12px/1.2 system-ui,sans-serif;color:#222}" +
    "#fontpick b{font:600 11px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#777;padding:2px 4px 4px}" +
    "#fontpick button{all:unset;cursor:pointer;padding:7px 10px;border-radius:6px;font-size:13px;border:1px solid transparent}" +
    "#fontpick button:hover{background:#f0f0f3}#fontpick button[aria-pressed=true]{background:#222;color:#fff}" +
    "#fontpick button:focus-visible{outline:2px solid #2f6fed;outline-offset:1px}";
  document.head.appendChild(css);

  var box = document.createElement("div");
  box.id = "fontpick";
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", "Try a font");
  box.innerHTML = "<b>Try a font</b>";
  var buttons = [];

  function apply(i) {
    var s = sets[i], root = document.documentElement.style;
    var serif = /Serif/.test(s.sans);
    root.setProperty("--sans", s.sans + (serif ? fallbackSerif : fallbackSans));
    root.setProperty("--mono", s.mono + fallbackMono);
    buttons.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    try { sessionStorage.setItem("fontpick", i); } catch (e) {}
  }
  sets.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = (i + 1) + "  " + s.name;
    b.style.fontFamily = s.sans + (/Serif/.test(s.sans) ? fallbackSerif : fallbackSans);
    b.addEventListener("click", function () { apply(i); });
    box.appendChild(b); buttons.push(b);
  });
  document.body.appendChild(box);
  var saved = 0;
  try { saved = parseInt(sessionStorage.getItem("fontpick"), 10) || 0; } catch (e) {}
  apply(saved);
})();
