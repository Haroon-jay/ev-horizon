/* EV Horizon — car cursor with light trail.
   Disabled on touch devices and under prefers-reduced-motion. */
(function () {
  'use strict';
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('ev-cursor-on');

  // Top-view car glyph, drawn pointing up
  var car = document.createElement('div');
  car.id = 'ev-cursor';
  car.innerHTML =
    '<svg viewBox="0 0 30 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M15 2 C21 2 25 7 25.5 14 L26 35 C26 43 21.5 48 15 48 C8.5 48 4 43 4 35 L4.5 14 C5 7 9 2 15 2 Z"' +
    ' fill="rgba(8,13,20,0.92)" stroke="#00D4FF" stroke-width="2"/>' +
    '<path d="M8 16 C10 12.5 12.5 11 15 11 C17.5 11 20 12.5 22 16 L21 20 C17 18.6 13 18.6 9 20 Z" fill="rgba(0,212,255,0.35)"/>' +
    '<path d="M8.5 36 C12.5 38 17.5 38 21.5 36 L21 41 C17.5 42.6 12.5 42.6 9 41 Z" fill="rgba(0,212,255,0.22)"/>' +
    '<circle cx="9.5" cy="6.5" r="1.8" fill="#7CFF6B"/>' +
    '<circle cx="20.5" cy="6.5" r="1.8" fill="#7CFF6B"/>' +
    '</svg>';
  document.body.appendChild(car);

  // Light trail
  var TRAIL = 9;
  var dots = [];
  for (var i = 0; i < TRAIL; i++) {
    var d = document.createElement('div');
    d.className = 'ev-trail';
    var size = Math.max(2, 7 - i * 0.6);
    d.style.width = size + 'px';
    d.style.height = size + 'px';
    d.style.marginLeft = -size / 2 + 'px';
    d.style.marginTop = -size / 2 + 'px';
    d.style.opacity = String(0.45 * (1 - i / TRAIL));
    d.style.background = i % 3 === 2 ? '#7CFF6B' : '#00D4FF';
    document.body.appendChild(d);
    dots.push({ el: d, x: -100, y: -100 });
  }

  var mx = -100, my = -100;       // target (mouse)
  var x = -100, y = -100;         // car position (lerped)
  var angle = 0, targetAngle = 0; // car heading
  var scale = 1, targetScale = 1;
  var visible = false;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!visible) { x = mx; y = my; visible = true; }
  }, { passive: true });

  document.addEventListener('mouseleave', function () { visible = false; });

  // Grow over interactive elements
  document.addEventListener('mouseover', function (e) {
    targetScale = e.target.closest && e.target.closest('a, button, summary, .unit-toggle, input, select, textarea') ? 1.35 : 1;
  }, { passive: true });

  function shortestAngle(from, to) {
    var diff = (to - from + 540) % 360 - 180;
    return from + diff;
  }

  function tick() {
    var dx = mx - x, dy = my - y;
    x += dx * 0.22;
    y += dy * 0.22;

    var speed = Math.hypot(dx, dy);
    if (speed > 2.5) {
      targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // glyph points up
    }
    angle += (shortestAngle(angle, targetAngle) - angle) * 0.18;
    scale += (targetScale - scale) * 0.2;

    car.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + angle + 'deg) scale(' + scale + ')';
    car.style.opacity = visible ? '1' : '0';

    // trail follows in a chain
    var px = x, py = y;
    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      dot.x += (px - dot.x) * 0.32;
      dot.y += (py - dot.y) * 0.32;
      dot.el.style.transform = 'translate(' + dot.x + 'px,' + dot.y + 'px)';
      dot.el.style.visibility = visible ? 'visible' : 'hidden';
      px = dot.x; py = dot.y;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
