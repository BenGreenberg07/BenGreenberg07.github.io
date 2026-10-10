(function () {
  var root = document.documentElement;

  // Theme: label shows the theme you'd switch to
  var themeBtn = document.getElementById("themeBtn");
  function isDark() {
    return root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function label() { themeBtn.textContent = isDark() ? "light" : "dark"; }
  themeBtn.addEventListener("click", function () {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    label();
  });
  label();

  // Highlight the nav link for the section in view
  var links = [].slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY + 100, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Older news
  var table = document.getElementById("newsTable");
  var btn = document.getElementById("newsBtn");
  btn.addEventListener("click", function () {
    btn.textContent = table.classList.toggle("open") ? "Fewer" : "Older";
  });

  // Click a picture to enlarge it
  var box = document.getElementById("lightbox");
  var boxImg = box.querySelector("img");
  var boxCap = box.querySelector("p");
  document.querySelectorAll(".pic:not(.empty)").forEach(function (el) {
    el.tabIndex = 0;
    function open() {
      var swap = el.querySelector(".swap");
      var img = swap && el.matches(":hover") ? swap : el.querySelector("img");
      boxImg.src = img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = el.dataset.caption || img.alt;
      box.classList.add("open");
    }
    el.addEventListener("click", open);
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
  });
  box.addEventListener("click", function () { box.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") box.classList.remove("open"); });
})();
