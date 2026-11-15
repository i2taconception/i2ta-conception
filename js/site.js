/* I2TA Conception : interactions de la page (menu, pellicule, filtres, visionneuse, vue 3D, formulaire) */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    loading: 'Loading the 3D model…', fail: 'The 3D model could not load. Please try again.',
    sending: 'Sending…', err: 'Sending failed. Please email me directly.', net: 'Network error. Please email me directly.',
    of: ' / '
  } : {
    loading: 'Chargement du modèle 3D…', fail: 'Le modèle 3D n’a pas pu se charger. Réessayez.',
    sending: 'Envoi…', err: 'Erreur lors de l’envoi. Écrivez-moi directement par e-mail.', net: 'Erreur réseau. Écrivez-moi directement par e-mail.',
    of: ' / '
  };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* En-tête */
  var hdr = $('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menu mobile */
  var burger = $('.burger'), mnav = $('.mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Apparition au défilement */
  var rv = $$('.rv');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* Pellicule de réalisations */
  var film = $('.film');
  if (film) {
    var cards = $$('.card', film), prev = $('.film-prev'), next = $('.film-next'), bar = $('.film-bar i'), count = $('.film-count');
    var shown = function () { return cards.filter(function (c) { return !c.hidden; }); };
    var update = function () {
      var max = film.scrollWidth - film.clientWidth, f = max > 0 ? film.scrollLeft / max : 1;
      var vis = shown(), w = vis.length ? vis[0].getBoundingClientRect().width : 1;
      var gap = parseFloat(getComputedStyle(film).columnGap) || 24;
      var idx = Math.min(vis.length, Math.round(film.scrollLeft / (w + gap)) + 1);
      if (bar) bar.style.transform = 'scaleX(' + Math.max(0.06, Math.min(1, (film.clientWidth / film.scrollWidth) + f * (1 - film.clientWidth / film.scrollWidth))).toFixed(3) + ')';
      if (count) count.textContent = String(idx).padStart(2, '0') + T.of + String(vis.length).padStart(2, '0');
      if (prev) prev.disabled = film.scrollLeft < 8;
      if (next) next.disabled = film.scrollLeft > max - 8;
    };
    var stepBy = function (dir) {
      var vis = shown(); if (!vis.length) return;
      var w = vis[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(film).columnGap) || 24);
      film.scrollBy({ left: dir * w * (window.innerWidth > 900 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' });
    };
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    film.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    film.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); } });
    // Glisser à la souris
    var down = false, moved = false, sx = 0, sl = 0;
    film.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = film.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; film.classList.add('dragging'); }
      if (moved) film.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { film.classList.remove('dragging'); }, 0); });
    film.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    // Filtres
    var chips = $$('.chip[data-filter]');
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        var f = ch.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
        cards.forEach(function (c) { c.hidden = !(f === 'all' || c.getAttribute('data-cat') === f); });
        film.scrollTo({ left: 0 }); update();
      });
    });
    update();
  }

  /* Visionneuse d'images */
  var lb = $('.lb');
  if (lb) {
    var lbImg = $('img', lb), lbCap = $('.lb-cap', lb), lbClose = $('.lb-close', lb), opener = null;
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (opener) opener.focus(); };
    $$('.card-media, .case-media[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = $('img', b); if (!img) return;
        opener = b; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt;
        lb.classList.add('open'); document.body.style.overflow = 'hidden'; lbClose.focus();
      });
    });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* Vue 3D GLB (chargée au clic : model-viewer + modèle ≈ 5 Mo) */
  var v3 = $('.v3d-stage');
  if (v3) {
    var btn = $('.v3d-start'), status = $('.v3d-status'), mats = $$('.mat'), started = false;
    var base = v3.getAttribute('data-base') || '';
    btn.addEventListener('click', function () {
      if (started) return; started = true; btn.hidden = true; status.textContent = T.loading;
      import(new URL(base + '3d/model-viewer.min.js', document.baseURI).href).then(function () {
        var mv = document.createElement('model-viewer');
        mv.setAttribute('src', base + '3d/decapsuleur-finitions.glb');
        mv.setAttribute('alt', v3.getAttribute('data-alt') || '');
        mv.setAttribute('camera-controls', ''); mv.setAttribute('interaction-prompt', 'none'); mv.setAttribute('touch-action', 'pan-y');
        mv.setAttribute('orientation', '180deg 0deg 0deg'); mv.setAttribute('camera-orbit', '205deg 72deg auto'); mv.setAttribute('field-of-view', '16deg');
        mv.setAttribute('min-field-of-view', '8deg'); mv.setAttribute('max-field-of-view', '35deg');
        mv.setAttribute('environment-image', 'neutral'); mv.setAttribute('exposure', '1.1'); mv.setAttribute('tone-mapping', 'aces');
        mv.setAttribute('shadow-intensity', '1'); mv.setAttribute('shadow-softness', '1');
        if (!reduce) { mv.setAttribute('auto-rotate', ''); mv.setAttribute('auto-rotate-delay', '1500'); }
        mv.setAttribute('variant-name', 'Cuivre');
        mv.addEventListener('load', function () {
          status.textContent = ''; var im = $('img', v3); if (im) im.remove();
          var av = mv.availableVariants || [];
          mats.forEach(function (o) { o.disabled = av.indexOf(o.getAttribute('data-variant')) < 0; });
        });
        mv.addEventListener('error', function () { if (mv.loaded) return; status.textContent = T.fail; mv.remove(); btn.hidden = false; started = false; });
        v3.appendChild(mv);
        mats.forEach(function (o) {
          o.addEventListener('click', function () {
            mv.variantName = o.getAttribute('data-variant');
            mats.forEach(function (x) { x.setAttribute('aria-pressed', x === o ? 'true' : 'false'); });
          });
        });
      }).catch(function () { status.textContent = T.fail; btn.hidden = false; started = false; });
    });
  }

  /* Formulaire (Formspree) */
  var form = $('#contactForm');
  if (form) {
    var ok = $('.ok', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = $('button[type="submit"]', form), label = b.innerHTML;
      b.innerHTML = T.sending; b.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (r.ok) { form.reset(); ok.classList.add('show'); } else { alert(T.err); } })
        .catch(function () { alert(T.net); })
        .then(function () { b.innerHTML = label; b.disabled = false; });
    });
  }
})();
