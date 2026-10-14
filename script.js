(function () {
  var root = document.documentElement;

  // Top bar border + active nav link
  var bar = document.getElementById("topbar");
  var links = [].slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScroll() {
    bar.classList.toggle("scrolled", window.scrollY > 40);
    var y = window.scrollY + 120, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Lightbox
  var box = document.getElementById("lightbox");
  var boxImg = box.querySelector("img");
  var boxCap = box.querySelector("p");
  document.querySelectorAll(".thumb:not(.placeholder), .strip figure").forEach(function (el) {
    el.tabIndex = 0;
    function open() {
      var hovering = el.matches(":hover") && el.querySelector(".alt");
      var img = hovering ? el.querySelector(".alt") : el.querySelector("img");
      boxImg.src = img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = el.dataset.caption || img.alt;
      box.classList.add("open");
    }
    el.addEventListener("click", open);
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
  });
  function close() { box.classList.remove("open"); }
  box.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();

// Printing / PDF export: load every image up front (lazy images below the fold would print blank)
(function () {
  function eager() { document.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = "eager"; }); }
  if (/[?&]print\b/.test(location.search)) eager();
  window.addEventListener("beforeprint", eager);
})();
