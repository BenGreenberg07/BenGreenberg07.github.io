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
  var boxImg2 = box.querySelectorAll("img")[1];
  var canHover = matchMedia("(hover: hover)").matches;
  var boxVid = box.querySelector("video");
  var boxCap = box.querySelector("p");
  var opener = null;
  document.querySelectorAll(".thumb:not(.placeholder), .strip figure").forEach(function (el) {
    var label = el.querySelector("img");
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View larger: " + label.alt);
    function open() {
      var alt = el.querySelector(".alt");
      var img = canHover && alt && !el.dataset.second && el.matches(":hover") ? alt : el.querySelector("img");
      // The video is left out under "reduce motion", which falls back to its still photo
      var vid = el.querySelector("video");
      var showVid = vid && getComputedStyle(vid).display !== "none";
      boxVid.hidden = !showVid;
      boxImg.hidden = !!showVid;
      if (showVid) { boxVid.src = vid.currentSrc; boxVid.play(); }
      else { boxImg.src = (img !== alt && el.dataset.full) || img.src; boxImg.alt = img.alt; }
      // Touch screens can't hover, so the second view goes underneath the first
      var second = el.dataset.second
        ? { src: el.dataset.second, alt: el.dataset.secondAlt }
        : (!canHover && alt);
      boxImg2.hidden = !second;
      if (second) { boxImg2.src = second.src; boxImg2.alt = second.alt; }
      box.classList.toggle("two", !!second);
      var caption = el.dataset.caption || img.alt;
      boxCap.textContent = canHover ? caption : caption.replace("Hover shows", "Also shown:");
      box.classList.add("open");
      opener = el;
      box.focus();
    }
    el.addEventListener("click", open);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
  function close() {
    if (!box.classList.contains("open")) return;
    box.classList.remove("open");
    boxVid.pause();
    if (opener) { opener.focus({ preventScroll: true }); opener = null; }
  }
  box.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
    // The viewer has nothing to tab to, so keep focus from moving behind it
    if (e.key === "Tab" && box.classList.contains("open")) e.preventDefault();
  });
})();

// Printing / PDF export: load every image up front (lazy images below the fold would print blank)
(function () {
  function eager() { document.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = "eager"; }); }
  if (/[?&]print\b/.test(location.search)) eager();
  window.addEventListener("beforeprint", eager);
})();

// Printing: show project links as short readable addresses (a bare "code" means nothing on paper)
(function () {
  var saved = [];
  function shorten() {
    saved = [];
    document.querySelectorAll(".entry-links a").forEach(function (a) {
      saved.push([a, a.textContent]);
      a.textContent = a.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    });
  }
  function restore() { saved.forEach(function (p) { p[0].textContent = p[1]; }); }
  if (/[?&]print\b/.test(location.search)) document.addEventListener("DOMContentLoaded", shorten);
  window.addEventListener("beforeprint", shorten);
  window.addEventListener("afterprint", restore);
})();
