(function () {
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

  // Photo viewer: each thumbnail opens its views one at a time
  var box = document.getElementById("lightbox");
  var boxImg = box.querySelector("img");
  var boxVid = box.querySelector("video");
  var boxCap = box.querySelector(".lb-cap");
  var boxCount = box.querySelector(".lb-count");
  var prevBtn = box.querySelector(".lb-prev");
  var nextBtn = box.querySelector(".lb-next");
  var opener = null, views = [], at = 0;

  function viewsFor(el) {
    var list = [], main = el.querySelector("img"), vid = el.querySelector("video"), alt = el.querySelector(".alt");
    // The video is left out under "reduce motion", which falls back to its still photo
    if (vid && getComputedStyle(vid).display !== "none") {
      list.push({ video: vid.currentSrc || vid.src, alt: vid.getAttribute("aria-label"), cap: el.dataset.caption });
    } else {
      list.push({ src: el.dataset.full || main.src, alt: main.alt, cap: el.dataset.caption || main.alt });
    }
    if (alt) list.push({ src: alt.src, alt: alt.alt, cap: alt.dataset.caption || alt.alt });
    if (el.dataset.second) list.push({ src: el.dataset.second, alt: el.dataset.secondAlt, cap: el.dataset.secondCaption || el.dataset.secondAlt });
    if (el.dataset.secondVideo) list.push({ video: el.dataset.secondVideo, alt: el.dataset.secondAlt, cap: el.dataset.secondCaption });
    return list;
  }
  function show(i) {
    at = (i + views.length) % views.length;
    var v = views[at];
    boxVid.hidden = !v.video;
    boxImg.hidden = !!v.video;
    if (v.video) {
      boxVid.src = v.video;
      boxVid.setAttribute("aria-label", v.alt);
      var playing = boxVid.play();
      if (playing) playing.catch(function () {});
    } else {
      boxVid.pause();
      boxImg.src = v.src;
      boxImg.alt = v.alt;
    }
    boxCap.textContent = v.cap;
    boxCount.textContent = views.length > 1 ? (at + 1) + " / " + views.length : "";
  }
  function close() {
    if (!box.classList.contains("open")) return;
    box.classList.remove("open");
    boxVid.pause();
    if (opener) { opener.focus({ preventScroll: true }); opener = null; }
  }

  document.querySelectorAll(".thumb").forEach(function (el) {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View larger: " + el.querySelector("img").alt);
    var count = viewsFor(el).length;
    if (count > 1) {
      var dots = document.createElement("span");
      dots.className = "hint";
      dots.setAttribute("aria-hidden", "true");
      for (var d = 0; d < count; d++) dots.appendChild(document.createElement("i"));
      el.appendChild(dots);
      if (el.querySelector(".alt")) el.classList.add("has-alt");
    }
    function open() {
      views = viewsFor(el);
      prevBtn.hidden = nextBtn.hidden = views.length < 2;
      show(0);
      box.classList.add("open");
      opener = el;
      box.focus();
    }
    el.addEventListener("click", open);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  box.querySelector(".lb-close").addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(at - 1); });
  nextBtn.addEventListener("click", function () { show(at + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft" && views.length > 1) show(at - 1);
    if (e.key === "ArrowRight" && views.length > 1) show(at + 1);
    if (e.key === "Tab") {
      // Keep focus on the viewer's own buttons
      e.preventDefault();
      var btns = [].filter.call(box.querySelectorAll("button"), function (b) { return !b.hidden; });
      var i = btns.indexOf(document.activeElement);
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  });
  // Swipe between views on touch screens
  var touchX = null;
  box.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (touchX === null || views.length < 2) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
    touchX = null;
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
