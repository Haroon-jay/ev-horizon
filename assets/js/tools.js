/* EV Horizon — interactive EV calculators */
(function () {
  'use strict';

  var root = document.querySelector('[data-tool]');
  if (!root) return;
  var tool = root.getAttribute('data-tool');
  var unit = 'km'; // 'km' | 'mi'

  function num(id, fallback) {
    var el = document.getElementById(id);
    if (!el) return fallback || 0;
    var v = parseFloat(el.value);
    return isNaN(v) ? (fallback || 0) : v;
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }
  function out(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function money(x) {
    if (!isFinite(x)) return '—';
    return '$' + (Math.abs(x) >= 100 ? Math.round(x).toLocaleString('en-US') : x.toFixed(2));
  }
  function fmt(x, dp) {
    if (!isFinite(x)) return '—';
    return x.toLocaleString('en-US', { maximumFractionDigits: dp == null ? 0 : dp });
  }
  function hours(h) {
    if (!isFinite(h) || h < 0) return '—';
    var hh = Math.floor(h);
    var mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh += 1; mm = 0; }
    if (hh === 0) return mm + ' min';
    return hh + ' h ' + (mm < 10 ? '0' : '') + mm + ' min';
  }
  function distLabel() { return unit === 'km' ? 'km' : 'mi'; }

  // Unit toggle: swap labels + defaults, then recompute
  function applyUnit() {
    document.querySelectorAll('[data-label-km]').forEach(function (el) {
      el.textContent = el.getAttribute(unit === 'km' ? 'data-label-km' : 'data-label-mi');
    });
    document.querySelectorAll('input[data-default-km]').forEach(function (el) {
      el.value = el.getAttribute(unit === 'km' ? 'data-default-km' : 'data-default-mi');
    });
    document.querySelectorAll('.unit-toggle button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-unit') === unit);
    });
    compute();
  }
  document.querySelectorAll('.unit-toggle button').forEach(function (b) {
    b.addEventListener('click', function () { unit = b.getAttribute('data-unit'); applyUnit(); });
  });

  /* ----------------------------------------------------------------------
     Tool implementations
     ---------------------------------------------------------------------- */

  function chargingCost() {
    var cap = num('cap', 60), from = num('from', 20), to = num('to', 80);
    var price = num('price', 0.15), eff = num('eff', 92) / 100;
    var cons = num('cons', unit === 'km' ? 17 : 3.8); // kWh/100km  |  mi/kWh
    var pct = Math.max(0, (to - from)) / 100;
    var energy = cap * pct;               // into the battery
    var grid = eff > 0 ? energy / eff : NaN; // drawn from the grid
    var cost = grid * price;
    var per100;
    if (unit === 'km') per100 = (cons * price) / (eff || 1);        // $ / 100 km
    else per100 = cons > 0 ? (100 / cons) * price / (eff || 1) : NaN; // $ / 100 mi
    out('r-energy', fmt(energy, 1) + ' kWh');
    out('r-grid', fmt(grid, 1) + ' kWh');
    out('r-cost', money(cost));
    out('r-per100', money(per100));
  }

  function chargingTime() {
    var cap = num('cap', 60), from = num('from', 20), to = num('to', 80);
    var power = num('power', 11);
    var energy = cap * Math.max(0, to - from) / 100;
    var t = power > 0 ? energy / power : NaN;
    out('r-time', hours(t));
    out('r-energy', fmt(energy, 1) + ' kWh');
    var note = document.getElementById('r-note');
    if (note) {
      note.textContent = power > 50
        ? 'DC fast charging slows above ~80% to protect the battery — real sessions to 100% take noticeably longer than the linear estimate.'
        : 'AC home charging is nearly linear, so this estimate is close to real-world time.';
    }
  }

  function savings() {
    var dist = num('dist', unit === 'km' ? 1500 : 900);       // per month
    var fuel = num('fuel', unit === 'km' ? 7.5 : 31);          // L/100km | MPG
    var fprice = num('fprice', unit === 'km' ? 1.6 : 3.6);     // $/L | $/gal
    var evEff = num('eveff', unit === 'km' ? 17 : 3.8);        // kWh/100km | mi/kWh
    var eprice = num('eprice', 0.15);
    var gas, ev;
    if (unit === 'km') {
      gas = dist / 100 * fuel * fprice;
      ev = dist / 100 * evEff * eprice;
    } else {
      gas = fuel > 0 ? dist / fuel * fprice : NaN;
      ev = evEff > 0 ? dist / evEff * eprice : NaN;
    }
    var monthly = gas - ev;
    out('r-gas', money(gas));
    out('r-ev', money(ev));
    out('r-month', money(monthly));
    out('r-year', money(monthly * 12));
    out('r-five', money(monthly * 60));
  }

  function range() {
    var cap = num('cap', 60);
    var eff = num('eff', unit === 'km' ? 17 : 3.8); // kWh/100km | mi/kWh
    var weather = parseFloat(val('weather') || '1');
    var style = parseFloat(val('style') || '1');
    var base = unit === 'km' ? (eff > 0 ? cap / eff * 100 : NaN) : cap * eff;
    var est = base * weather * style;
    out('r-range', fmt(est) + ' ' + distLabel());
    out('r-city', fmt(est * 1.1) + ' ' + distLabel());
    out('r-hwy', fmt(est * 0.78) + ' ' + distLabel());
    out('r-winter', fmt(base * 0.72 * style) + ' ' + distLabel());
  }

  function batteryHealth() {
    var age = parseFloat(val('age') || '0');          // years -> degradation share
    var miles = parseFloat(val('mileage') || '0');    // penalty pts
    var fast = parseFloat(val('fast') || '0');
    var full = parseFloat(val('full') || '0');
    var climate = parseFloat(val('climate') || '0');
    var observed = parseFloat(val('observed') || '0');
    // Base degradation: ~1.8%/yr, modified by habits
    var degr = age * 1.8 + miles + fast + full + climate + observed;
    var soh = Math.max(60, Math.min(100, 100 - degr));
    var low = Math.max(58, soh - 3), high = Math.min(100, soh + 2);
    out('r-soh', fmt(low) + '–' + fmt(high) + '%');
    var fill = document.getElementById('r-fill');
    if (fill) fill.style.width = soh + '%';
    var verdict = 'Excellent — this pack is aging better than average.';
    if (soh < 90) verdict = 'Healthy — normal aging. Nothing to worry about.';
    if (soh < 84) verdict = 'Fair — usable for years, but factor it into the price.';
    if (soh < 75) verdict = 'Tired — negotiate hard and check the battery warranty terms.';
    out('r-verdict', verdict);
    var tips = document.getElementById('r-tips');
    if (tips) {
      var t = [];
      if (fast >= 3) t.push('Frequent DC fast charging adds stress — mix in slow AC charging where possible.');
      if (full >= 2) t.push('Daily 100% charges accelerate aging on NMC packs — set an 80% limit (LFP packs are exempt).');
      if (climate >= 2) t.push('Hot climates age batteries faster — shaded parking and preconditioning help.');
      if (!t.length) t.push('Your habits look battery-friendly. Keep charging slow and shallow by default.');
      tips.innerHTML = t.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    }
  }

  var computeMap = {
    'charging-cost': chargingCost,
    'charging-time': chargingTime,
    'savings': savings,
    'range': range,
    'battery-health': batteryHealth,
  };
  function compute() { (computeMap[tool] || function () {})(); }

  root.querySelectorAll('input, select').forEach(function (el) {
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  applyUnit();
})();
