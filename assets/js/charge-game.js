/* EV Horizon — charging mini-game.
   Drag the cable from the station into the car's charge port. */
(function () {
  'use strict';

  var stage = document.querySelector('.showcase-stage');
  if (!stage) return;
  var game = stage.querySelector('.charge-game');
  var scene = stage.querySelector('.showcase-scene');
  var carSvg = stage.querySelector('.showcase-car svg');
  if (!game || !scene || !carSvg) return;

  var plug = game.querySelector('.cg-plug');
  var station = game.querySelector('.cg-station');
  var cableSvg = game.querySelector('.cg-cable-svg');
  var cableOuter = game.querySelector('.cg-cable-outer');
  var cableCore = game.querySelector('.cg-cable-core');
  var cableFlow = game.querySelector('.cg-cable-flow');
  var ring = game.querySelector('.cg-ring');
  var hud = game.querySelector('.cg-hud');
  var fill = game.querySelector('.cg-fill');
  var pctEl = game.querySelector('.cg-pct');
  var subEl = game.querySelector('.cg-sub');
  var hint = game.querySelector('.cg-hint');

  // Charge port location inside the car SVG's viewBox (760 × 400)
  var PORT = { x: 156, y: 186 };
  var MAX_RANGE = 612; // km shown at 100%
  var SNAP_DIST = 38;

  var state = 'idle'; // idle | dragging | charging | full | returning
  var pos = { x: 0, y: 0 };       // nozzle tip, stage-local px
  var grabOff = { x: 0, y: 0 };
  var dragMoved = 0;
  var pct = 0;
  var lastT = null;

  // Infinite-driving parallax: the car cruises until you grab the cable,
  // then pulls over; it accelerates away again after you unplug.
  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var driveSpeed = 0; // 0 stopped … 1 cruising
  var layers = [
    { sel: '.scroll-slow', v: 12 },
    { sel: '.scroll-mid', v: 58 },
    { sel: '.scroll-fast', v: 175 },
    { sel: '.scroll-front', v: 290 },
  ].map(function (l) {
    return { el: scene.querySelector(l.sel), v: l.v, off: 0 };
  }).filter(function (l) { return l.el; });

  function stageRect() { return stage.getBoundingClientRect(); }

  function portPos() {
    var r = carSvg.getBoundingClientRect(), s = stageRect();
    return {
      x: r.left - s.left + PORT.x * (r.width / 760),
      y: r.top - s.top + PORT.y * (r.height / 400),
    };
  }
  function holsterPos() {
    var r = station.getBoundingClientRect(), s = stageRect();
    return { x: r.right - s.left + 2, y: r.top - s.top + r.height * 0.40 };
  }
  function anchorPos() {
    var r = station.getBoundingClientRect(), s = stageRect();
    return { x: r.left - s.left + r.width * 0.5, y: r.top - s.top + 4 };
  }
  function dist(p, q) { return Math.hypot(p.x - q.x, p.y - q.y); }

  function setCharging(on) {
    scene.classList.toggle('is-charging', on);
    game.classList.toggle('is-flowing', on);
    if (on) hud.hidden = false;
  }

  function beginCharge() {
    state = 'charging';
    stage.classList.remove('game-active');
    game.classList.add('played');
    setCharging(true);
    hud.classList.remove('full');
    subEl.textContent = 'DC fast charge — quick to 80%, taper to 100%';
  }

  // ---- pointer handling -------------------------------------------------
  plug.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var s = stageRect();
    var p = { x: e.clientX - s.left, y: e.clientY - s.top };
    if (state === 'charging' || state === 'full') {
      setCharging(false);
      hud.hidden = true;
      if (pct >= 100) pct = 0; // fresh session next time
    }
    state = 'dragging';
    dragMoved = 0;
    grabOff = { x: pos.x - p.x, y: pos.y - p.y };
    stage.classList.add('game-active');
    scene.style.setProperty('--rx', '0deg');
    scene.style.setProperty('--ry', '0deg');
    scene.style.setProperty('--sc', '1');
    hint.style.display = 'none';
    try { plug.setPointerCapture(e.pointerId); } catch (err) {}
  });

  plug.addEventListener('pointermove', function (e) {
    if (state !== 'dragging') return;
    var s = stageRect();
    var nx = e.clientX - s.left + grabOff.x;
    var ny = e.clientY - s.top + grabOff.y;
    dragMoved += Math.abs(nx - pos.x) + Math.abs(ny - pos.y);
    pos.x = nx; pos.y = ny;
    if (dist(pos, portPos()) < SNAP_DIST) {
      try { plug.releasePointerCapture(e.pointerId); } catch (err) {}
      beginCharge();
    }
  });

  function endDrag(e) {
    if (state !== 'dragging') return;
    if (dragMoved < 8) {
      // simple click: auto-plug (also the keyboard/accessibility path)
      beginCharge();
      return;
    }
    stage.classList.remove('game-active');
    state = 'returning';
  }
  plug.addEventListener('pointerup', endDrag);
  plug.addEventListener('pointercancel', endDrag);

  // ---- render loop ------------------------------------------------------
  function render(t) {
    var dt = lastT == null ? 0 : Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    var port = portPos();
    var holster = holsterPos();
    var anchor = anchorPos();

    if (state === 'idle') {
      pos.x = holster.x; pos.y = holster.y;
    } else if (state === 'returning') {
      pos.x += (holster.x - pos.x) * 0.16;
      pos.y += (holster.y - pos.y) * 0.16;
      if (dist(pos, holster) < 1.5) state = 'idle';
    } else if (state === 'charging' || state === 'full') {
      pos.x = port.x; pos.y = port.y; // rides the car's float animation
    }

    // charging progress: fast to 80%, taper to 100 (like a real DC session)
    if (state === 'charging') {
      pct += (pct < 80 ? 26 : 9) * dt;
      if (pct >= 100) {
        pct = 100;
        state = 'full';
        hud.classList.add('full');
        subEl.textContent = 'Fully charged — unplug when ready ⚡';
      }
      var range = Math.round((pct / 100) * MAX_RANGE);
      pctEl.textContent = Math.floor(pct) + '%  ·  ' + range + ' km';
      fill.style.width = pct + '%';
    }

    // plug element (nozzle tip at local 2,32)
    plug.style.transform = 'translate(' + (pos.x - 2) + 'px,' + (pos.y - 32) + 'px)';

    // cable from station head to plug boot, with sag
    var bx = pos.x + 44, by = pos.y;
    var d = dist({ x: bx, y: by }, anchor);
    var sag = 36 + d * 0.28;
    var path = 'M' + anchor.x + ' ' + anchor.y +
      ' C' + (anchor.x - 14) + ' ' + (anchor.y + sag) +
      ', ' + (bx + 50) + ' ' + (by + sag * 0.8) +
      ', ' + bx + ' ' + by;
    cableOuter.setAttribute('d', path);
    cableCore.setAttribute('d', path);
    cableFlow.setAttribute('d', path);

    // port target ring
    ring.style.transform = 'translate(' + port.x + 'px,' + port.y + 'px)';
    ring.classList.toggle('show', state === 'dragging');

    // driving parallax: cruise while idle, pull over for charging
    var targetSpeed = (!reducedMotion && (state === 'idle' || state === 'returning')) ? 1 : 0;
    driveSpeed += (targetSpeed - driveSpeed) * (targetSpeed > driveSpeed ? 0.018 : 0.04);
    if (driveSpeed < 0.001) driveSpeed = 0;
    for (var li = 0; li < layers.length; li++) {
      var L = layers[li];
      L.off = (L.off - L.v * driveSpeed * dt) % 880;
      L.el.setAttribute('transform', 'translate(' + L.off.toFixed(2) + ' 0)');
    }
    scene.classList.toggle('is-driving', driveSpeed > 0.05);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
