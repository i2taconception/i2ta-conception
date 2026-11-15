/* I2TA Conception : vue éclatée d'un train planétaire pilotée par le défilement (three.js r128).
   Cinématique exacte (engrènement verrouillé), denture en développante.
   Mouvement réduit ou WebGL absent : la section passe en mode statique (image + liste). */
(function () {
  'use strict';
  var root = document.querySelector('.xp');
  if (!root) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); }
    catch (e) { return false; }
  }
  if (reduce || typeof THREE === 'undefined' || !webglOK()) { root.classList.add('is-static'); return; }

  var stage = root.querySelector('.xp-canvas');
  var hero = root.querySelector('.xp-hero');
  var hint = root.querySelector('.xp-hint');
  var chapters = Array.prototype.slice.call(root.querySelectorAll('.xp-ch'));
  var rail = root.querySelector('.xp-rail');
  var railBars = rail ? Array.prototype.slice.call(rail.querySelectorAll('i')) : [];
  var endEl = root.querySelector('.xp-end');
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Géométrie des engrenages ---------- */
  var m = 6, Zs = 21, Zp = 15, Zr = 51, NPL = 3;
  var CARRIER_R = m * (Zs + Zp) / 2;
  var TG = 12, TR = 20;
  var RATIO_C = Zs / (Zs + Zr), RATIO_P = -0.70;
  var BACKLASH = 0.0105;

  function involuteExternal(Z, mod) {
    var a = 20 * Math.PI / 180, n = 18, rp = mod * Z / 2, rb = rp * Math.cos(a);
    var ra = rp + mod, rd = rp - 1.25 * mod, half = Math.PI / (2 * Z) - BACKLASH, invA = Math.tan(a) - a;
    var rlo = Math.max(rb, rd), flank = [], k, r, ar;
    for (k = 0; k < n; k++) { r = rlo + (ra - rlo) * k / (n - 1); ar = Math.acos(Math.min(Math.max(rb / r, -1), 1)); flank.push([r, half + invA - (Math.tan(ar) - ar)]); }
    var rootPhi = half + invA, pts = [];
    if (rd < rb) pts.push([rd * Math.cos(-rootPhi), rd * Math.sin(-rootPhi)]);
    flank.forEach(function (f) { pts.push([f[0] * Math.cos(-f[1]), f[0] * Math.sin(-f[1])]); });
    var tip = flank[flank.length - 1], nt = 4;
    for (k = 1; k < nt; k++) { var ang = -tip[1] + 2 * tip[1] * k / nt; pts.push([tip[0] * Math.cos(ang), tip[0] * Math.sin(ang)]); }
    for (k = flank.length - 1; k >= 0; k--) pts.push([flank[k][0] * Math.cos(flank[k][1]), flank[k][0] * Math.sin(flank[k][1])]);
    if (rd < rb) pts.push([rd * Math.cos(rootPhi), rd * Math.sin(rootPhi)]);
    return { pts: pts, rd: rd };
  }
  function gearOutline(Z, mod) {
    var t = involuteExternal(Z, mod), tooth = t.pts, rd = t.rd, step = 2 * Math.PI / Z, out = [];
    for (var i = 0; i < Z; i++) {
      var rot = i * step, c = Math.cos(rot), s = Math.sin(rot);
      var seg = tooth.map(function (p) { return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; });
      seg.forEach(function (p) { out.push(p); });
      var last = seg[seg.length - 1], angNow = Math.atan2(last[1], last[0]);
      var rn = (i + 1) * step, cn = Math.cos(rn), sn = Math.sin(rn);
      var fn = [tooth[0][0] * cn - tooth[0][1] * sn, tooth[0][0] * sn + tooth[0][1] * cn];
      var angT = Math.atan2(fn[1], fn[0]); while (angT < angNow) angT += 2 * Math.PI;
      for (var k = 1; k < 4; k++) { var aa = angNow + (angT - angNow) * k / 4; out.push([rd * Math.cos(aa), rd * Math.sin(aa)]); }
    }
    return out;
  }
  function ringInnerLoop(Z, mod) {
    var a = 20 * Math.PI / 180, n = 18, rp = mod * Z / 2, rb = rp * Math.cos(a);
    var ra = rp - mod, rd = rp + 1.25 * mod, half = Math.PI / (2 * Z), invA = Math.tan(a) - a, flank = [], k;
    for (k = 0; k < n; k++) { var r = ra + (rd - ra) * k / (n - 1), rr = Math.max(r, rb * 1.0001); var ar = Math.acos(Math.min(Math.max(rb / Math.max(rr, rb), -1), 1)); flank.push([r, half + invA - (Math.tan(ar) - ar)]); }
    var tooth = [];
    flank.forEach(function (f) { tooth.push([f[0] * Math.cos(-f[1]), f[0] * Math.sin(-f[1])]); });
    for (k = flank.length - 1; k >= 0; k--) tooth.push([flank[k][0] * Math.cos(flank[k][1]), flank[k][0] * Math.sin(flank[k][1])]);
    var step = 2 * Math.PI / Z, inner = [];
    for (var i = 0; i < Z; i++) { var c = Math.cos(i * step), s = Math.sin(i * step); tooth.forEach(function (p) { inner.push([p[0] * c - p[1] * s, p[0] * s + p[1] * c]); }); }
    return { inner: inner, rOuter: rd + 2.2 * mod, ra: ra };
  }

  /* ---------- Rendu ---------- */
  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearAlpha(0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 1, 6000);

  (function env() {
    var c = document.createElement('canvas'); c.width = 64; c.height = 256;
    var g = c.getContext('2d'), grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d8c8b8'); grad.addColorStop(0.42, '#6a5a4c'); grad.addColorStop(0.56, '#2a221c'); grad.addColorStop(1, '#070605');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 256);
    g.fillStyle = 'rgba(255,240,225,.95)'; g.fillRect(0, 16, 64, 22);
    g.fillStyle = 'rgba(255,190,140,.55)'; g.fillRect(0, 150, 64, 10);
    var tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
  })();
  var key = new THREE.DirectionalLight(0xfff1e2, 2.2); key.position.set(-220, 320, 240); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffa866, 1.3); rim.position.set(260, -40, -260); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xe8d6c4, 0x0c0a08, 0.5));
  scene.add(new THREE.AmbientLight(0x3a332c, 0.35));

  function M(color, metal, rough) { return new THREE.MeshStandardMaterial({ color: color, metalness: metal, roughness: rough, envMapIntensity: 1 }); }
  var mat = {
    copper:  M(0xc77a45, 1.0, 0.30),
    planets: M(0xbfc2c8, 1.0, 0.26),
    ring:    M(0x4c4946, 0.92, 0.40),
    carrier: M(0x34312e, 0.86, 0.42),
    housing: M(0x1f1d1b, 0.70, 0.52),
    cover:   M(0x9a9ca1, 0.96, 0.30)
  };
  mat.ring.side = THREE.DoubleSide;
  mat.bolt = mat.copper.clone(); mat.collar = mat.planets.clone();

  function extrudeShape(shape, depth, bevel, curve) {
    var geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, steps: 1, curveSegments: curve || 2 });
    geo.translate(0, 0, -depth / 2); geo.computeVertexNormals(); return geo;
  }
  function gearGeo(Z, depth) { return extrudeShape(new THREE.Shape(gearOutline(Z, m).map(function (p) { return new THREE.Vector2(p[0], p[1]); })), depth, 0.6); }
  function annulus(rOut, rIn, depth, seg) {
    var s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
    var h = new THREE.Path(); h.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(h);
    return extrudeShape(s, depth, 0, seg || 96);
  }
  function cyl(r, h, material, seg) { var g = new THREE.CylinderGeometry(r, r, h, seg || 48); g.rotateX(Math.PI / 2); return new THREE.Mesh(g, material); }

  var assembly = new THREE.Group(); assembly.rotation.x = -Math.PI / 2; scene.add(assembly);
  var ringData = ringInnerLoop(Zr, m), R_OUT = ringData.rOuter, R_ENV = R_OUT + 10;

  // Couronne
  var ringShape = new THREE.Shape(); ringShape.absarc(0, 0, R_OUT, 0, Math.PI * 2, false);
  ringShape.holes.push(new THREE.Path(ringData.inner.slice().reverse().map(function (p) { return new THREE.Vector2(p[0], p[1]); })));
  var gRing = new THREE.Group(); assembly.add(gRing);
  gRing.add(new THREE.Mesh(extrudeShape(ringShape, TR, 0, small ? 96 : 160), mat.ring));

  // Porte-satellites
  var gCarrier = new THREE.Group(); assembly.add(gCarrier);
  var plate = cyl(m * 7.0, 5, mat.carrier, 72); plate.position.z = -TR / 2 - 3.5; gCarrier.add(plate);
  var hub = cyl(m * 3.4, 16, mat.carrier); hub.position.z = -5; gCarrier.add(hub);
  var outShaft = cyl(m * 2.6, 34, mat.carrier, 40); outShaft.position.z = -TR / 2 - 3.5 - 17; gCarrier.add(outShaft);
  for (var i = 0; i < NPL; i++) {
    var beta = 2 * Math.PI * i / NPL, len = CARRIER_R - m * 2;
    var arm = new THREE.Mesh(new THREE.BoxGeometry(len, m * 3.4, 5), mat.carrier);
    arm.position.set(0.5 * CARRIER_R * Math.cos(beta), 0.5 * CARRIER_R * Math.sin(beta), -TR / 2 - 1.5); arm.rotation.z = beta; gCarrier.add(arm);
    var pin = cyl(m * 1.7, TR / 2 + TG / 2 + 10, mat.carrier, 36);
    pin.position.set(CARRIER_R * Math.cos(beta), CARRIER_R * Math.sin(beta), (TG / 2 + 6 + (-TR / 2 - 4)) / 2); gCarrier.add(pin);
  }

  // Satellites
  var gPlanets = new THREE.Group(); assembly.add(gPlanets);
  var pGeo = gearGeo(Zp, TG), planets = [];
  for (i = 0; i < NPL; i++) { var pm = new THREE.Mesh(pGeo, mat.planets); gPlanets.add(pm); planets.push(pm); }

  // Solaire + arbre d'entrée (cuivre)
  var gSun = new THREE.Group(); assembly.add(gSun);
  var sun = new THREE.Mesh(gearGeo(Zs, TG), mat.copper); gSun.add(sun);
  var inShaft = cyl(m * 2.0, 40, mat.copper, 40); inShaft.position.z = TG / 2 + 20; gSun.add(inShaft);
  var collar = cyl(m * 3.0, 6, mat.collar, 48); collar.position.z = TG / 2 + 9; gSun.add(collar);

  // Carter
  var gHousing = new THREE.Group(); assembly.add(gHousing);
  var base = new THREE.Mesh(annulus(R_ENV, 22, 10, small ? 96 : 160), mat.housing); base.position.z = -TR / 2 - 13; gHousing.add(base);
  var wall = new THREE.Mesh(annulus(R_ENV, R_OUT + 2, 16, small ? 96 : 160), mat.housing); wall.position.z = -TR / 2 - 5; gHousing.add(wall);
  var boss = new THREE.Mesh(annulus(36, 22, 18, 64), mat.housing); boss.position.z = -TR / 2 - 26; gHousing.add(boss);
  for (i = 0; i < 4; i++) {
    var fa = Math.PI / 4 + i * Math.PI / 2;
    var foot = new THREE.Mesh(new THREE.BoxGeometry(46, 22, 10), mat.housing);
    foot.position.set((R_ENV + 10) * Math.cos(fa), (R_ENV + 10) * Math.sin(fa), -TR / 2 - 13); foot.rotation.z = fa; gHousing.add(foot);
  }

  // Flasque + vis (cuivre)
  var gCover = new THREE.Group(); assembly.add(gCover);
  var flange = new THREE.Mesh(annulus(R_ENV, ringData.ra - 2, 7, small ? 96 : 160), mat.cover); flange.position.z = TR / 2 + 3.5; gCover.add(flange);
  var boltGeo = new THREE.CylinderGeometry(4.6, 4.6, 6, 6); boltGeo.rotateX(Math.PI / 2);
  for (i = 0; i < 12; i++) {
    var ba = i * Math.PI / 6 + Math.PI / 12, br = (R_ENV + ringData.ra) / 2;
    var bolt = new THREE.Mesh(boltGeo, mat.bolt); bolt.position.set(br * Math.cos(ba), br * Math.sin(ba), TR / 2 + 10); gCover.add(bolt);
  }

  /* Pièce mise en avant par chapitre : porte-satellites, satellites, couronne, carter, flasque */
  var parts = [
    { g: gCarrier, m: [mat.carrier], dz: -125, dr: 0 },
    { g: gPlanets, m: [mat.planets], dz: 82, dr: 34 },
    { g: gRing, m: [mat.ring], dz: 0, dr: 0 },
    { g: gHousing, m: [mat.housing], dz: -240, dr: 0 },
    { g: gCover, m: [mat.cover, mat.bolt], dz: 245, dr: 0 }
  ];
  var SUN_DZ = 160;
  var glow = new THREE.Color(0xe39a5f), tint = new THREE.Color(0xd98a4e);
  var others = [mat.copper, mat.collar];
  parts.forEach(function (p) { p.m.forEach(function (mm) { mm.emissive = glow.clone(); mm.emissiveIntensity = 0; }); });
  parts.concat({ m: others }).forEach(function (p) { p.m.forEach(function (mm) { mm.userData.base = mm.color.clone(); }); });
  function shade(mm, hi, dim) {
    mm.color.copy(mm.userData.base).lerp(tint, 0.6 * hi).multiplyScalar(dim);
    mm.envMapIntensity = dim; mm.emissiveIntensity = 0.16 * hi;
  }

  /* ---------- Chronologie du défilement ---------- */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var CH0 = 0.22, CH1 = 0.86, NCH = chapters.length || 5, SEG = (CH1 - CH0) / NCH;

  var layout = {};
  function computeLayout() {
    var w = stage.clientWidth, h = stage.clientHeight, mobile = w < 820 || w / h < 0.9;
    layout = mobile
      ? { hero: { cx: 0, cy: 0.31, aw: 0.84, ah: 0.34 }, ch: { cx: 0, cy: -0.13, aw: 0.92, ah: 0.5 }, end: { cx: 0, cy: 0.08, aw: 0.88, ah: 0.56 } }
      : { hero: { cx: 0.24, cy: 0.02, aw: 0.5, ah: 0.82 }, ch: { cx: -0.15, cy: 0, aw: 0.54, ah: 0.86 }, end: { cx: 0, cy: -0.1, aw: 0.6, ah: 0.62 } };
  }
  function size() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false); camera.aspect = w / h; computeLayout(); return true;
  }
  var sized = size();
  window.addEventListener('resize', function () { sized = size(); });

  var target = 0, pS = 0, mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  function readScroll() {
    var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
    target = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll(); pS = target;
  if (finePointer) window.addEventListener('mousemove', function (e) { mouse.x = (e.clientX / window.innerWidth - 0.5); mouse.y = (e.clientY / window.innerHeight - 0.5); }, { passive: true });

  var lastCh = -2, endOn = false, railOn = false;
  function updateText(p) {
    var a = 1 - smooth(0.035, 0.11, p);
    hero.style.opacity = a.toFixed(3);
    hero.style.visibility = a < 0.01 ? 'hidden' : 'visible';
    hero.style.translate = '0 ' + ((1 - a) * -36).toFixed(1) + 'px';
    if (hint) hint.style.opacity = (a * a).toFixed(3);
    var ch = (p >= CH0 && p < CH1) ? Math.min(NCH - 1, Math.floor((p - CH0) / SEG)) : -1;
    if (ch !== lastCh) {
      chapters.forEach(function (el, k) { el.classList.toggle('on', k === ch); el.setAttribute('aria-hidden', k === ch ? 'false' : 'true'); });
      lastCh = ch;
    }
    var rOn = p > CH0 - 0.02 && p < CH1 + 0.01;
    if (rail && rOn !== railOn) { rail.classList.toggle('on', rOn); railOn = rOn; }
    railBars.forEach(function (b, k) { b.style.transform = 'scaleX(' + clamp((p - CH0 - k * SEG) / SEG, 0, 1).toFixed(3) + ')'; });
    var eOn = p > 0.91;
    if (endEl && eOn !== endOn) { endEl.classList.toggle('on', eOn); endOn = eOn; }
  }

  function mix(A, B, t) { return { cx: lerp(A.cx, B.cx, t), cy: lerp(A.cy, B.cy, t), aw: lerp(A.aw, B.aw, t), ah: lerp(A.ah, B.ah, t) }; }

  var thetaS = 0, clock = performance.now(), running = false, visible = true, first = true, orbit = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - clock) / 1000); clock = now;
    if (!sized) sized = size();
    pS += (target - pS) * Math.min(1, dt * 7);
    var p = pS;
    updateText(p);

    var e = smooth(0.09, 0.23, p) * (1 - smooth(0.86, 0.96, p));
    var L = mix(mix(layout.hero, layout.ch, smooth(0.08, 0.22, p)), layout.end, smooth(0.86, 0.97, p));

    // Cinématique exacte
    thetaS += 0.38 * dt;
    var thetaC = thetaS * RATIO_C, thetaP = thetaS * RATIO_P;
    sun.rotation.z = thetaS; inShaft.rotation.z = thetaS; gCarrier.rotation.z = thetaC;
    for (var k = 0; k < NPL; k++) {
      var b = thetaC + 2 * Math.PI * k / NPL, rr = CARRIER_R + parts[1].dr * e;
      planets[k].position.set(rr * Math.cos(b), rr * Math.sin(b), 0); planets[k].rotation.z = thetaP;
    }
    // Éclatement le long de l'axe
    parts.forEach(function (pt) { pt.g.position.z = pt.dz * e; });
    gSun.position.z = SUN_DZ * e;

    // Mise en avant de la pièce du chapitre : teinte cuivre sur la pièce, les autres s'assombrissent
    var his = parts.map(function (pt, idx) {
      var s0 = CH0 + idx * SEG;
      return smooth(s0 - SEG * 0.15, s0 + SEG * 0.2, p) * (1 - smooth(s0 + SEG * 0.85, s0 + SEG * 1.15, p));
    });
    var F = smooth(CH0 - 0.03, CH0 + 0.03, p) * (1 - smooth(CH1 - 0.03, CH1 + 0.02, p));
    parts.forEach(function (pt, idx) { var hi = his[idx]; pt.m.forEach(function (mm) { shade(mm, hi, 1 - 0.72 * F * (1 - hi)); }); });
    others.forEach(function (mm) { shade(mm, 0, 1 - 0.72 * F); });

    // Caméra
    orbit += dt * 0.035;
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    var el = lerp(0.6, 0.27, e) - mouse.sy * 0.12;
    var az = 0.55 + p * 1.1 + orbit + mouse.sx * 0.3;
    var stackH = lerp(80, 560, e), R = R_ENV + 12;
    var tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var halfH = 0.5 * (stackH * Math.cos(el) + 2 * R * Math.sin(el)) * 1.1, halfW = R * 1.1;
    var dist = Math.max(halfH / (tanV * L.ah), halfW / (tanV * camera.aspect * L.aw));
    camera.position.set(dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(0, 0, 0);
    var w = stage.clientWidth, h = stage.clientHeight;
    camera.setViewOffset(w, h, -L.cx * w, -L.cy * h, w, h);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    if (first) { first = false; root.classList.add('is-live'); }
    requestAnimationFrame(frame);
  }
  function start() { if (running || !visible) return; running = true; clock = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting && !document.hidden; visible ? start() : stop(); }, { rootMargin: '120px 0px' }).observe(root);
  } else { start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else { visible = true; start(); } });
  start();
})();
