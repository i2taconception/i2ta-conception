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
  var TG = 30, TR = 34;            // largeurs de denture : satellites et solaire 30, couronne 34
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

  /* ---------- Matériaux : un jeu par chapitre (mise en avant de la pièce) ---------- */
  var chapterMats = [[], [], [], [], []];
  function MM(ch, color, metal, rough, env) {
    var mm = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).convertSRGBToLinear(), metalness: metal, roughness: rough, envMapIntensity: env || 1, side: THREE.DoubleSide });
    mm.userData.env = env || 1; chapterMats[ch].push(mm); return mm;
  }
  // 0 : flasque (alu usiné), vis CHC, joint d'entrée, bouchon de remplissage
  var mCoverMach = MM(0, 0xd3d5d8, 0.92, 0.24), mCoverCast = MM(0, 0xb4b2ae, 0.85, 0.42),
      mScrew = MM(0, 0x1b1b1d, 0.85, 0.34), mSealIn = MM(0, 0x141414, 0.0, 0.55),
      mPlugIn = MM(0, 0xc6c8cc, 1.0, 0.28), mCuIn = MM(0, 0xc77a45, 1.0, 0.3);
  // 1 : arbre solaire, roulement d'entrée, satellites (aiguilles, rondelles bronze, circlips)
  var mGear = MM(1, 0xbfc2c8, 1.0, 0.26), mBrgIn = MM(1, 0xdfe1e5, 1.0, 0.14), mBallIn = MM(1, 0xf2f2f2, 1.0, 0.06),
      mCageIn = MM(1, 0xb88a3e, 1.0, 0.32), mKeyIn = MM(1, 0xd0d2d6, 1.0, 0.22), mNeedle = MM(1, 0xe2e4e8, 1.0, 0.12),
      mBronze = MM(1, 0xb87333, 1.0, 0.32), mClip = MM(1, 0x1d1d1f, 0.7, 0.42);
  // 2 : couronne (nitrurée), goupilles de centrage
  var mRing = MM(2, 0x57534e, 0.9, 0.4, 0.55), mDowel = MM(2, 0xd6d8dc, 1.0, 0.16);
  // 3 : porte-satellites, axes, clavette de sortie
  var mCarrier = MM(3, 0x8e8b87, 0.92, 0.34, 0.8), mPin = MM(3, 0xdcdee2, 1.0, 0.14), mKeyOut = MM(3, 0xd0d2d6, 1.0, 0.22);
  // 4 : carter (fonte, faces usinées), roulements et joint de sortie, bouchon de vidange
  var mHouseMach = MM(4, 0x9a958f, 0.9, 0.3), mHouseCast = MM(4, 0x34312e, 0.25, 0.75, 0.4),
      mBrgOut = MM(4, 0xdfe1e5, 1.0, 0.14), mBallOut = MM(4, 0xf2f2f2, 1.0, 0.06), mCageOut = MM(4, 0xb88a3e, 1.0, 0.32),
      mSealOut = MM(4, 0x141414, 0.0, 0.55), mPlugOut = MM(4, 0xc6c8cc, 1.0, 0.28), mCuOut = MM(4, 0xc77a45, 1.0, 0.3);

  /* ---------- Outils de géométrie ---------- */
  var SEG = small ? 56 : 96, SEG_S = small ? 24 : 40;
  // Extrusion d'épaisseur totale exacte « depth », chanfrein compris, centrée sur z = 0
  function extrudeShape(shape, depth, bevel, curve) {
    var d = depth - 2 * (bevel || 0);
    var geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, steps: 1, curveSegments: curve || 2 });
    geo.translate(0, 0, -d / 2); geo.computeVertexNormals(); return geo;
  }
  function circlePath(x, y, r) { var h = new THREE.Path(); h.absarc(x, y, r, 0, Math.PI * 2, true); return h; }
  function disc(rOut, holes) {
    var s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
    (holes || []).forEach(function (h) { s.holes.push(circlePath(h[0], h[1], h[2])); });
    return s;
  }
  function gearGeo(Z, depth, bore) {
    var s = new THREE.Shape(gearOutline(Z, m).map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
    if (bore) s.holes.push(circlePath(0, 0, bore));
    return extrudeShape(s, depth, 0.6, 24);
  }
  // Révolution d'un profil [r, z] autour de l'axe z, arêtes vives (une normale par segment du profil)
  function revolve(pts, seg) {
    var pos = [], nor = [], idx = [], v = 0;
    for (var k = 0; k < pts.length - 1; k++) {
      var A = pts[k], B = pts[k + 1], dr = B[0] - A[0], dz = B[1] - A[1], L = Math.sqrt(dr * dr + dz * dz);
      if (L < 1e-6) continue;
      var nr = dz / L, nz = -dr / L, base = v;
      for (var j = 0; j <= seg; j++) {
        var t = j / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
        pos.push(A[0] * c, A[0] * s, A[1], B[0] * c, B[0] * s, B[1]);
        nor.push(nr * c, nr * s, nz, nr * c, nr * s, nz);
        v += 2;
      }
      for (j = 0; j < seg; j++) { var a = base + 2 * j, b = a + 1, cc = a + 2, d = a + 3; idx.push(a, cc, b, b, cc, d); }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx); return g;
  }
  function loop(pts) { return pts.concat([pts[0]]); }
  function mesh(geo, mt, x, y, z) { var o = new THREE.Mesh(geo, mt); o.position.set(x || 0, y || 0, z || 0); return o; }
  // Plusieurs exemplaires d'une même pièce (une seule requête de rendu)
  function instanced(geo, mt, list) {
    var im = new THREE.InstancedMesh(geo, mt, list.length), o = new THREE.Object3D();
    list.forEach(function (p, i) { o.position.set(p[0], p[1], p[2] || 0); o.rotation.set(0, 0, p[3] || 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.instanceMatrix.needsUpdate = true; return im;
  }
  // Filet ISO (profil triangulaire), crêtes et fonds alternés tous les P/2, de z0 à z1
  function threadPts(rA, rB, pitch, z0, z1) { var out = [], k = 0; for (var z = z0; z < z1 - 1e-6; z += pitch / 2, k++) out.push([k % 2 ? rA : rB, z]); out.push([k % 2 ? rA : rB, z1]); return out; }
  // Roulement à billes à gorge profonde (bagues, billes, cage laiton), centré en z = 0
  function ballBearing(d, D, B, bd, n, mR, mB, mC) {
    var g = new THREE.Group(), rp = (d + D) / 4, rg = bd * 0.515, ri2 = rp - bd * 0.32, ro1 = rp + bd * 0.32, ch = 1, h = B / 2;
    var th = Math.acos((ri2 - rp) / rg), arcI = [], arcO = [], k;
    for (k = 0; k <= 10; k++) { var a1 = th + (2 * Math.PI - 2 * th) * k / 10; arcI.push([rp + rg * Math.cos(a1), rg * Math.sin(a1)]); }
    var to = Math.acos((ro1 - rp) / rg);
    for (k = 0; k <= 10; k++) { var a2 = to - 2 * to * k / 10; arcO.push([rp + rg * Math.cos(a2), rg * Math.sin(a2)]); }
    g.add(mesh(revolve(loop([[d / 2, -h + ch], [d / 2, h - ch], [d / 2 + ch, h], [ri2 - 0.6, h], [ri2, h - 0.6]].concat(arcI, [[ri2, -h + 0.6], [ri2 - 0.6, -h], [d / 2 + ch, -h]])), SEG), mR));
    g.add(mesh(revolve(loop([[D / 2, -h + ch], [D / 2, h - ch], [D / 2 - ch, h], [ro1 + 0.6, h], [ro1, h - 0.6]].concat(arcO, [[ro1, -h + 0.6], [ro1 + 0.6, -h], [D / 2 - ch, -h]])), SEG), mR));
    var balls = []; for (k = 0; k < n; k++) { var ba = 2 * Math.PI * k / n; balls.push([rp * Math.cos(ba), rp * Math.sin(ba), 0]); }
    g.add(instanced(new THREE.SphereGeometry(bd / 2, 18, 12), mB, balls));
    var cw = bd * 0.3, cz = bd * 0.42;
    var cage = revolve(loop([[rp - cw, -0.45], [rp + cw, -0.45], [rp + cw, 0.45], [rp - cw, 0.45]]), SEG);
    g.add(mesh(cage, mC, 0, 0, cz)); g.add(mesh(cage, mC, 0, 0, -cz));
    return g;
  }
  // Joint à lèvre (bague d'étanchéité), centré en z = 0
  function lipSeal(rI, rO, hh, mt) {
    var w = rO - rI, h = hh / 2;
    return mesh(revolve(loop([[rO, -h], [rO, h], [rI + 0.62 * w, h], [rI + 0.45 * w, h - 0.45 * hh], [rI + 0.25 * w, h], [rI + 0.08 * w, h], [rI, h - 0.3 * hh], [rI, -h + 0.25 * hh], [rI + 0.15 * w, -h]]), SEG), mt);
  }
  // Bouchon fileté M16 à tête hexagonale + joint cuivre, axe z, posé en z = 0
  function plug(mP, mCu) {
    var g = new THREE.Group();
    g.add(mesh(revolve(loop([[8.2, 0], [11, 0], [11, 1.5], [8.2, 1.5]]), SEG_S), mCu));
    g.add(mesh(revolve(loop([[0, 1.5], [11.5, 1.5], [11.5, 3], [0, 3]]), SEG_S), mP));
    var hx = new THREE.CylinderGeometry(12.1, 12.1, 8, 6); hx.rotateX(Math.PI / 2); hx.translate(0, 0, 7);
    g.add(mesh(hx, mP)); return g;
  }
  // Clavette parallèle forme A (bouts ronds) : largeur b, hauteur hk, longueur L, posée sur un arbre de rayon rs
  function keyGeo(b, hk, L, rs, t1, zc) {
    var s = new THREE.Shape(), r = b / 2, l = L / 2 - r;
    s.moveTo(-r, -l); s.lineTo(-r, l); s.absarc(0, l, r, Math.PI, 0, true); s.lineTo(r, -l); s.absarc(0, -l, r, 0, Math.PI, true);
    var g = extrudeShape(s, hk, 0.4, 12);
    g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
    g.translate(rs - t1 + hk / 2, 0, zc); return g;
  }

  /* ---------- Assemblage (cotes en mm, z = plan médian des engrenages) ---------- */
  var assembly = new THREE.Group(); assembly.rotation.x = -Math.PI / 2; scene.add(assembly);
  var ringData = ringInnerLoop(Zr, m);
  var RD = m * Zr / 2 + 1.25 * m;                 // pied de denture couronne : 160,5
  var R_OUT = RD + 28, R_ENV = R_OUT;              // Ø377 commun carter / couronne / flasque
  var BC = RD + 14, NB = 12;                       // cercle de perçage Ø349, 12 vis CHC M10
  var R_WALL_IN = RD + 3, Z_TOP = TR / 2, Z_BOT = -TR / 2;
  var bolts = [], i;
  for (i = 0; i < NB; i++) { var ba0 = (i + 0.5) * 2 * Math.PI / NB; bolts.push([BC * Math.cos(ba0), BC * Math.sin(ba0)]); }
  var dowels = [[BC, 0], [-BC, 0]];
  function holes(list, r) { return list.map(function (p) { return [p[0], p[1], r]; }); }

  // Couronne : denture intérieure, 12 passages Ø11, 2 alésages de goupille Ø10
  var gRing = new THREE.Group(); assembly.add(gRing);
  var ringShape = disc(R_OUT, holes(bolts, 5.5).concat(holes(dowels, 5)));
  ringShape.holes.push(new THREE.Path(ringData.inner.slice().reverse().map(function (p) { return new THREE.Vector2(p[0], p[1]); })));
  gRing.add(mesh(extrudeShape(ringShape, TR, 0, small ? 96 : 160), mRing));
  var dowelGeo = revolve([[0, -25], [4, -25], [4.98, -24], [4.98, 24], [4, 25], [0, 25]], SEG_S);
  dowels.forEach(function (p) { gRing.add(mesh(dowelGeo, mDowel, p[0], p[1], 0)); });

  // Porte-satellites monobloc : flasque Ø276 ép. 16 avec allègements, arbre de sortie Ø40 / Ø35
  var gCarrier = new THREE.Group(); assembly.add(gCarrier);
  var Z_PL_TOP = Z_BOT, Z_PL_BOT = Z_BOT - 16, pinXY = [], winXY = [];
  for (i = 0; i < NPL; i++) {
    var be = 2 * Math.PI * i / NPL, bw = be + Math.PI / NPL;
    pinXY.push([CARRIER_R * Math.cos(be), CARRIER_R * Math.sin(be)]); winXY.push([85 * Math.cos(bw), 85 * Math.sin(bw)]);
  }
  var plateM = mesh(extrudeShape(disc(138, holes(pinXY, 15).concat(holes(winXY, 22))), 16, 1, 64), mCarrier, 0, 0, (Z_PL_TOP + Z_PL_BOT) / 2);
  gCarrier.add(plateM);
  gCarrier.add(mesh(revolve([[0, Z_PL_BOT], [28, Z_PL_BOT], [28, -37], [27, -38], [20, -38], [20, -89], [19, -90], [17.5, -91.5], [17.5, -148.5], [16, -150], [0, -150]], SEG), mCarrier));
  gCarrier.add(mesh(keyGeo(10, 8, 50, 17.5, 5, -122), mKeyOut));
  // Axes de satellites Ø30 rectifiés, gorge de circlip en tête
  var pinGeo = revolve([[0, Z_PL_BOT], [14.5, Z_PL_BOT], [15, Z_PL_BOT + 0.5], [15, 17], [13.95, 17], [13.95, 18.6], [15, 18.6], [15, 19.2], [14.2, 20], [0, 20]], SEG_S);
  pinXY.forEach(function (p) { gCarrier.add(mesh(pinGeo, mPin, p[0], p[1], 0)); });

  // Satellites Z15 alésés Ø40, douilles à aiguilles, rondelles de butée bronze, circlips DIN 471
  var gPlanets = new THREE.Group(); assembly.add(gPlanets);
  var pGeo = gearGeo(Zp, TG, 20), planetHolders = [], planetSpin = [];
  var cupGeo = revolve(loop([[20, -13], [20, 13], [17, 13], [17, 12.2], [18.8, 12.2], [18.8, -12.2], [17, -12.2], [17, -13]]), SEG_S);
  var needleGeo = new THREE.CylinderGeometry(1.5, 1.5, 22, 8); needleGeo.rotateX(Math.PI / 2);
  var needles = []; for (i = 0; i < 30; i++) { var na = 2 * Math.PI * i / 30; needles.push([16.5 * Math.cos(na), 16.5 * Math.sin(na), 0]); }
  var washerGeo = revolve(loop([[15.5, 0], [24, 0], [24, 2], [15.5, 2]]), SEG_S);
  var clipShape = new THREE.Shape(); clipShape.absarc(0, 0, 17.6, 0.32, Math.PI * 2 - 0.32, false); clipShape.absarc(0, 0, 14.2, Math.PI * 2 - 0.32, 0.32, true);
  var clipGeo = extrudeShape(clipShape, 1.5, 0, 24);
  for (i = 0; i < NPL; i++) {
    var hold = new THREE.Group(), spin = new THREE.Group();
    spin.add(mesh(pGeo, mGear)); spin.add(mesh(cupGeo, mNeedle)); spin.add(instanced(needleGeo, mNeedle, needles));
    hold.add(spin);
    hold.add(mesh(washerGeo, mBronze, 0, 0, TG / 2)); hold.add(mesh(washerGeo, mBronze, 0, 0, -TG / 2 - 2));
    var clip = mesh(clipGeo, mClip, 0, 0, 17.8); clip.rotation.z = i * 1.3; hold.add(clip);
    gPlanets.add(hold); planetHolders.push(hold); planetSpin.push(spin);
  }

  // Arbre d'entrée avec solaire Z21 taillé dans la masse, portée Ø30, bout d'arbre Ø25 claveté
  var gSun = new THREE.Group(); assembly.add(gSun);
  gSun.add(mesh(gearGeo(Zs, TG, 0), mGear));
  gSun.add(mesh(revolve([[0, TG / 2], [18, TG / 2], [18, 17], [15, 17], [15, 51], [13.5, 52.5], [12.5, 52.5], [12.5, 98], [11.5, 99], [0, 99]], SEG), mGear));
  gSun.add(mesh(keyGeo(8, 7, 28, 12.5, 4, 76), mKeyIn));

  // Roulement d'entrée 6206 (30 × 62 × 16) logé dans la flasque
  var gBrgIn = new THREE.Group(); assembly.add(gBrgIn);
  var brgIn = ballBearing(30, 62, 16, 9.5, 9, mBrgIn, mBallIn, mCageIn); brgIn.position.z = Z_TOP + 8; gBrgIn.add(brgIn);

  // Flasque : bride ép. 14 percée Ø11 / Ø10 / M16, moyeu avec logement de roulement Ø62 et de joint Ø47
  var gCover = new THREE.Group(); assembly.add(gCover);
  var Z_CV = Z_TOP + 14, fillXY = [0, 110];
  var flange = new THREE.Mesh(extrudeShape(disc(R_OUT, holes(bolts, 5.5).concat(holes(dowels, 5), [[0, 0, 60], [fillXY[0], fillXY[1], 8]])), 14, 0.8, small ? 96 : 160), [mCoverMach, mCoverCast]);
  flange.position.z = Z_TOP + 7; gCover.add(flange);
  gCover.add(mesh(revolve(loop([[60, Z_TOP], [60, Z_CV], [50, Z_CV], [50, Z_CV + 14], [46, Z_CV + 18], [23.5, Z_CV + 18], [23.5, Z_CV + 11], [17, Z_CV + 11], [17, Z_TOP + 16], [31, Z_TOP + 16], [31, Z_TOP]]), SEG), mCoverMach));
  var plugIn = plug(mPlugIn, mCuIn); plugIn.position.set(fillXY[0], fillXY[1], Z_CV); gCover.add(plugIn);

  // Joint à lèvre d'entrée 30 × 47 × 7
  var gSealIn = new THREE.Group(); assembly.add(gSealIn);
  var sealIn = lipSeal(15, 23.5, 7, mSealIn); sealIn.position.z = Z_CV + 14.5; gSealIn.add(sealIn);

  // Vis CHC M10 × 65 ISO 4762 (tête Ø16 × 10, six pans creux 8, filetage b = 32)
  var gScrews = new THREE.Group(); assembly.add(gScrews);
  var SL = 65, hd = new THREE.Shape(); hd.absarc(0, 0, 8, 0, Math.PI * 2, false);
  var hexS = new THREE.Path(); for (var k6 = 0; k6 <= 6; k6++) { var h6 = k6 * Math.PI / 3; hexS[k6 ? 'lineTo' : 'moveTo'](4.62 * Math.cos(h6), 4.62 * Math.sin(h6)); }
  hd.holes.push(hexS);
  var headTop = extrudeShape(hd, 5.5, 0.5, small ? 24 : 40); headTop.translate(0, 0, 4.5 + 2.75);
  var headLow = revolve(loop([[0, 4.5], [0, 0], [7.6, 0], [8, 0.4], [8, 4.5]]), SEG_S);
  var shank = revolve([[0, -SL], [3.6, -SL], [4.9, -SL + 1.2]].concat(threadPts(4.92, 4.2, 1.5, -SL + 1.2, -SL + 32), [[4.9, -SL + 32.6], [4.9, -0.5], [5.4, 0], [0, 0]]), SEG_S);
  var screwList = bolts.map(function (p, n) { return [p[0], p[1], Z_CV, n * 0.61]; });
  gScrews.add(instanced(headTop, mScrew, screwList)); gScrews.add(instanced(headLow, mScrew, screwList)); gScrews.add(instanced(shank, mScrew, screwList));

  // Carter (fonte) : paroi taraudée M10 prof. 20, fond, bossage de sortie, bouchon de vidange
  var gHousing = new THREE.Group(); assembly.add(gHousing);
  var Z_FLOOR = Z_BOT - 21;
  var wall = new THREE.Mesh(extrudeShape(disc(R_OUT, holes(bolts, 5).concat(holes(dowels, 5), [[0, 0, R_WALL_IN]])), 21, 0, small ? 96 : 160), [mHouseMach, mHouseCast]);
  wall.position.z = Z_BOT - 10.5; gHousing.add(wall);
  var tapGeo = revolve(threadPts(5, 4.25, 1.5, -20, 0).reverse(), 16);
  gHousing.add(instanced(tapGeo, mHouseMach, bolts.map(function (p) { return [p[0], p[1], Z_BOT]; })));
  gHousing.add(mesh(revolve([[R_OUT, Z_FLOOR], [R_OUT, Z_FLOOR - 10], [R_OUT - 4, Z_FLOOR - 14], [66, Z_FLOOR - 14], [58, Z_FLOOR - 22], [58, -86], [54, -90], [31, -90]], SEG), mHouseCast));
  gHousing.add(mesh(revolve([[31, -90], [31, -80], [40, -80], [40, Z_FLOOR], [R_OUT, Z_FLOOR]], SEG), mHouseMach));
  var drainH = new THREE.Group(), drainP = plug(mPlugOut, mCuOut);
  drainP.rotation.y = Math.PI / 2; drainP.position.set(R_OUT, 0, Z_BOT - 12); drainH.add(drainP); drainH.rotation.z = Math.PI / 2; gHousing.add(drainH);

  // Roulements de sortie 6208 (40 × 80 × 18) × 2 et entretoise
  var gBrgOut = new THREE.Group(); assembly.add(gBrgOut);
  var bA = ballBearing(40, 80, 18, 12, 9, mBrgOut, mBallOut, mCageOut); bA.position.z = Z_FLOOR - 9; gBrgOut.add(bA);
  var bB = ballBearing(40, 80, 18, 12, 9, mBrgOut, mBallOut, mCageOut); bB.position.z = Z_FLOOR - 33; gBrgOut.add(bB);
  gBrgOut.add(mesh(revolve(loop([[20.2, Z_FLOOR - 24], [25, Z_FLOOR - 24], [25, Z_FLOOR - 18], [20.2, Z_FLOOR - 18]]), SEG_S), mBrgOut));

  // Joint à lèvre de sortie 40 × 62 × 8
  var gSealOut = new THREE.Group(); assembly.add(gSealOut);
  var sealOut = lipSeal(20, 31, 8, mSealOut); sealOut.rotation.x = Math.PI; sealOut.position.z = -86; gSealOut.add(sealOut);

  /* Éclatement le long de l'axe, de haut en bas */
  var explode = [
    { g: gScrews, dz: 360 }, { g: gSealIn, dz: 275 }, { g: gCover, dz: 240 }, { g: gBrgIn, dz: 195 },
    { g: gSun, dz: 150 }, { g: gPlanets, dz: 70 }, { g: gRing, dz: 0 }, { g: gCarrier, dz: -70 },
    { g: gBrgOut, dz: -110 }, { g: gHousing, dz: -230 }, { g: gSealOut, dz: -270 }
  ];
  var STACK = { h0: 250, c0: -25, h1: 762, c1: 20 };   // hauteur et centre de l'empilage, assemblé puis éclaté

  var glow = new THREE.Color(0xe39a5f).convertSRGBToLinear(), tint = new THREE.Color(0xd98a4e).convertSRGBToLinear();
  chapterMats.forEach(function (ms) { ms.forEach(function (mm) { mm.emissive = glow.clone(); mm.emissiveIntensity = 0; mm.userData.base = mm.color.clone(); }); });
  function shade(mm, hi, dim) {
    mm.color.copy(mm.userData.base).lerp(tint, 0.6 * hi).multiplyScalar(dim);
    mm.envMapIntensity = dim * mm.userData.env; mm.emissiveIntensity = 0.16 * hi;
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
    gSun.rotation.z = thetaS; gCarrier.rotation.z = thetaC;
    for (var k = 0; k < NPL; k++) {
      var b = thetaC + 2 * Math.PI * k / NPL;
      planetHolders[k].position.set(CARRIER_R * Math.cos(b), CARRIER_R * Math.sin(b), 0); planetSpin[k].rotation.z = thetaP;
    }
    // Éclatement le long de l'axe
    explode.forEach(function (x) { x.g.position.z = x.dz * e; });

    // Mise en avant de la pièce du chapitre : teinte cuivre sur la pièce, les autres s'assombrissent
    var his = chapterMats.map(function (ms, idx) {
      var s0 = CH0 + idx * SEG;
      return smooth(s0 - SEG * 0.15, s0 + SEG * 0.2, p) * (1 - smooth(s0 + SEG * 0.85, s0 + SEG * 1.15, p));
    });
    var F = smooth(CH0 - 0.03, CH0 + 0.03, p) * (1 - smooth(CH1 - 0.03, CH1 + 0.02, p));
    chapterMats.forEach(function (ms, idx) { var hi = his[idx]; ms.forEach(function (mm) { shade(mm, hi, 1 - 0.72 * F * (1 - hi)); }); });

    // Caméra
    orbit += dt * 0.035;
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    var el = lerp(0.6, 0.27, e) - mouse.sy * 0.12;
    var az = 0.55 + p * 1.1 + orbit + mouse.sx * 0.3;
    var stackH = lerp(STACK.h0, STACK.h1, e), cz = lerp(STACK.c0, STACK.c1, e), R = R_ENV + 12;
    var tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var halfH = 0.5 * (stackH * Math.cos(el) + 2 * R * Math.sin(el)) * 1.1, halfW = R * 1.1;
    var dist = Math.max(halfH / (tanV * L.ah), halfW / (tanV * camera.aspect * L.aw));
    camera.position.set(dist * Math.cos(el) * Math.sin(az), cz + dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(0, cz, 0);
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
