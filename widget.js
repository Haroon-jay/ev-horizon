/**
 * EV Horizon — Embeddable EV Savings Widget
 * Drop one <script> tag on any dealer/partner site.
 *
 * Usage:
 *   <div id="ev-savings-widget"></div>
 *   <script src="https://evhorizon.media/widget.js"
 *     data-dealer="Your Dealership Name"
 *     data-color="#00D4FF"
 *     data-unit="mi"
 *     data-model="Model 3"
 *     data-logo="https://yourdomain.com/logo.png"
 *     data-webhook="https://hooks.zapier.com/hooks/catch/YOUR_HOOK"
 *     data-cta="Book a Test Drive"
 *     data-show-lead="true"
 *     defer>
 *   </script>
 *
 * Programmatic API (also re-renders live):
 *   window.EVWidget.init({ dealer, color, unit, model, logo, webhook, cta, showLead, target })
 */
(function () {
  'use strict';

  /* ── Static styles (injected once; color via CSS custom property --evhw-c) ── */
  var STYLE_ID = 'evh-widget-styles';
  if (!document.getElementById(STYLE_ID)) {
    var darkBg   = '#05070A';
    var darkCard = '#0e1219';
    var border   = '#1e2430';
    var muted    = '#8892a4';
    var textMain = '#f0f2f5';

    var CSS = [
      '.evh-w{--evhw-c:#00D4FF;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      'box-sizing:border-box;color:',textMain,';background:',darkBg,';',
      'border-radius:16px;border:1px solid ',border,';overflow:hidden;',
      'max-width:680px;margin:0 auto;line-height:1.5;transition:--evhw-c .2s}',
      '.evh-w *{box-sizing:border-box}',

      '.evh-w__head{padding:20px 24px 16px;border-bottom:1px solid ',border,';',
      'background:linear-gradient(135deg,',darkCard,' 0%,#0a0d14 100%)}',
      '.evh-w__logo-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.evh-w__logo-img{height:28px;max-width:120px;object-fit:contain;border-radius:4px}',
      '.evh-w__dealer{font-size:13px;color:var(--evhw-c);font-weight:600;letter-spacing:.3px}',
      '.evh-w__title{font-size:17px;font-weight:700;margin:0;color:',textMain,'}',
      '.evh-w__sub{font-size:13px;color:',muted,';margin:4px 0 0}',

      '.evh-w__body{padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}',
      '@media(max-width:500px){.evh-w__body{grid-template-columns:1fr}}',
      '.evh-w__section-label{font-size:11px;font-weight:600;letter-spacing:.8px;',
      'text-transform:uppercase;color:var(--evhw-c);margin:0 0 12px}',
      '.evh-w__field{margin-bottom:12px}',
      '.evh-w__label{display:block;font-size:12px;color:',muted,';margin-bottom:4px;font-weight:500}',
      '.evh-w__input{width:100%;background:#111622;border:1px solid ',border,';',
      'border-radius:8px;padding:9px 12px;color:',textMain,';font-size:14px;outline:none;transition:border-color .15s}',
      '.evh-w__input:focus{border-color:var(--evhw-c)}',

      '.evh-w__units{display:flex;gap:4px;margin-bottom:14px}',
      '.evh-w__unit-btn{flex:1;padding:7px;border-radius:7px;border:1px solid ',border,';',
      'background:transparent;color:',muted,';font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}',
      '.evh-w__unit-btn.active{background:color-mix(in srgb,var(--evhw-c) 15%,transparent);',
      'border-color:var(--evhw-c);color:var(--evhw-c)}',

      '.evh-w__results{background:#0a0d14;border-top:1px solid ',border,';padding:16px 24px}',
      '.evh-w__result-row{display:flex;justify-content:space-between;align-items:center;',
      'padding:8px 0;border-bottom:1px solid rgba(30,36,48,.5)}',
      '.evh-w__result-row:last-child{border-bottom:none}',
      '.evh-w__result-label{font-size:13px;color:',muted,'}',
      '.evh-w__result-val{font-size:14px;font-weight:600;color:',textMain,'}',
      '.evh-w__result-row.primary .evh-w__result-label{color:',textMain,';font-weight:600}',
      '.evh-w__result-row.primary .evh-w__result-val{font-size:22px;color:var(--evhw-c)}',
      '.evh-w__result-row.green .evh-w__result-val{color:#7CFF6B}',

      '.evh-w__lead{padding:16px 24px 20px;border-top:1px solid ',border,'}',
      '.evh-w__lead-title{font-size:14px;font-weight:600;margin:0 0 12px;color:',textMain,'}',
      '.evh-w__lead-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}',
      '@media(max-width:500px){.evh-w__lead-row{grid-template-columns:1fr}}',
      '.evh-w__btn{width:100%;padding:12px;border-radius:10px;border:none;',
      'background:var(--evhw-c);color:#000;font-size:14px;font-weight:700;',
      'cursor:pointer;transition:opacity .15s;margin-top:2px}',
      '.evh-w__btn:hover{opacity:.85}',
      '.evh-w__btn:disabled{opacity:.5;cursor:not-allowed}',
      '.evh-w__lead-ok{text-align:center;padding:10px;font-size:14px;color:#7CFF6B;display:none}',
      '.evh-w__lead-err{font-size:12px;color:#ff6b6b;margin-top:6px;display:none}',

      '.evh-w__footer{padding:10px 24px;border-top:1px solid ',border,';display:flex;justify-content:flex-end}',
      '.evh-w__powered{font-size:11px;color:',muted,';text-decoration:none;opacity:.5;transition:opacity .15s}',
      '.evh-w__powered:hover{opacity:1}',

      /* AI match section */
      '.evh-w__ai{border-top:1px solid ',border,';padding:16px 24px 20px}',
      '.evh-w__ai-trigger{width:100%;padding:12px 16px;border-radius:10px;',
      'background:linear-gradient(135deg,#0d1f2d,#0a1a28);',
      'border:1px solid color-mix(in srgb,var(--evhw-c) 35%,transparent);',
      'color:',textMain,';font-size:14px;font-weight:600;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}',
      '.evh-w__ai-trigger:hover{background:linear-gradient(135deg,#102030,#0d2035);',
      'border-color:color-mix(in srgb,var(--evhw-c) 60%,transparent)}',
      '.evh-w__ai-trigger:disabled{opacity:.6;cursor:not-allowed}',
      '.evh-w__ai-spark{font-size:16px}',

      '.evh-w__ai-loading{display:none;text-align:center;padding:20px 0}',
      '.evh-w__ai-dots{display:inline-flex;gap:5px}',
      '.evh-w__ai-dots span{width:7px;height:7px;border-radius:50%;',
      'background:var(--evhw-c);opacity:.3;animation:evhw-dot .9s infinite}',
      '.evh-w__ai-dots span:nth-child(2){animation-delay:.15s}',
      '.evh-w__ai-dots span:nth-child(3){animation-delay:.3s}',
      '@keyframes evhw-dot{0%,80%,100%{opacity:.3}40%{opacity:1}}',
      '.evh-w__ai-loading-txt{font-size:12px;color:',muted,';margin-top:8px}',

      '.evh-w__ai-result{display:none}',
      '.evh-w__ai-top{background:linear-gradient(135deg,#0d1f2d 0%,#0a1428 100%);',
      'border:1px solid color-mix(in srgb,var(--evhw-c) 30%,transparent);',
      'border-radius:12px;padding:16px;margin-bottom:12px}',
      '.evh-w__ai-crown{font-size:11px;font-weight:700;letter-spacing:.6px;',
      'text-transform:uppercase;color:var(--evhw-c);margin-bottom:6px;display:flex;align-items:center;gap:5px}',
      '.evh-w__ai-model{font-size:17px;font-weight:700;color:',textMain,';margin-bottom:4px}',
      '.evh-w__ai-tagline{font-size:13px;color:var(--evhw-c);margin-bottom:10px;font-weight:500}',
      '.evh-w__ai-reason{font-size:13px;color:',muted,';line-height:1.5;margin-bottom:10px}',
      '.evh-w__ai-chips{display:flex;gap:8px;flex-wrap:wrap}',
      '.evh-w__ai-chip{background:#ffffff10;border:1px solid ',border,';',
      'border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;color:',muted,'}',
      '.evh-w__ai-chip.hi{background:color-mix(in srgb,var(--evhw-c) 12%,transparent);',
      'border-color:color-mix(in srgb,var(--evhw-c) 40%,transparent);color:var(--evhw-c)}',

      '.evh-w__ai-alts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}',
      '@media(max-width:500px){.evh-w__ai-alts{grid-template-columns:1fr}}',
      '.evh-w__ai-alt{background:#0e1219;border:1px solid ',border,';',
      'border-radius:10px;padding:12px}',
      '.evh-w__ai-alt-model{font-size:13px;font-weight:700;color:',textMain,';margin-bottom:3px}',
      '.evh-w__ai-alt-tag{font-size:12px;color:var(--evhw-c);margin-bottom:6px;font-weight:500}',
      '.evh-w__ai-alt-reason{font-size:12px;color:',muted,';line-height:1.45;margin-bottom:6px}',
      '.evh-w__ai-alt-payback{font-size:11px;font-weight:600;color:',muted,'}',

      '.evh-w__ai-summary{font-size:13px;color:',textMain,';',
      'background:#7CFF6B12;border:1px solid #7CFF6B30;border-radius:8px;',
      'padding:10px 14px;line-height:1.5}',
      '.evh-w__ai-err{font-size:13px;color:#ff6b6b;text-align:center;padding:10px}',
      '.evh-w__ai-retry{background:none;border:1px solid ',border,';color:',muted,';',
      'border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer;margin-top:8px}',
    ].join('');

    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function money(x) {
    if (!isFinite(x)) return '—';
    return '$' + (Math.abs(x) >= 100 ? Math.round(x).toLocaleString('en-US') : x.toFixed(2));
  }

  var DEFAULTS = {
    km: { dist: 1500, fuel: 7.5,  fprice: 1.60, eveff: 17,  eprice: 0.15 },
    mi: { dist: 1500, fuel: 22,   fprice: 3.60, eveff: 3.8, eprice: 0.15 },
  };
  var LABELS = {
    km: { dist:'Monthly Distance (km)', fuel:'Fuel Use (L/100 km)', fprice:'Fuel Price ($/L)',   eveff:'EV Efficiency (kWh/100 km)' },
    mi: { dist:'Monthly Distance (mi)', fuel:'Fuel Economy (MPG)',   fprice:'Fuel Price ($/gal)', eveff:'EV Efficiency (mi/kWh)' },
  };

  /* ── Core render ─────────────────────────────────────────────────────── */
  function renderWidget(cfg) {
    cfg = cfg || {};
    var DEALER    = cfg.dealer    || 'Your Dealership';
    var COLOR     = cfg.color     || '#00D4FF';
    var UNIT      = cfg.unit === 'mi' ? 'mi' : 'km';
    var MODEL     = cfg.model     || '';
    var LOGO      = cfg.logo      || '';          // URL or data URL
    var WEBHOOK   = cfg.webhook   || '';
    // Absolute URL so the AI match works when embedded on a dealer's own domain.
    // Override with data-endpoint if the function is hosted elsewhere.
    var ENDPOINT  = cfg.endpoint  || 'https://evhorizon.netlify.app/.netlify/functions/ev-match';
    var CTA       = cfg.cta       || 'Get a Personalised Quote';
    var SHOW_LEAD = cfg.showLead !== false;       // default: true
    var TARGET    = cfg.target    || 'ev-savings-widget';

    /* mount */
    var mount = document.getElementById(TARGET);
    if (!mount) {
      mount = document.createElement('div');
      mount.id = TARGET;
      document.body.appendChild(mount);
    }

    /* logo markup */
    var DEFAULT_SVG = '<svg width="24" height="24" viewBox="0 0 32 32" fill="none">'
      + '<circle cx="16" cy="16" r="14.5" stroke="var(--evhw-c)" stroke-width="2"/>'
      + '<path d="M5 19h22" stroke="#7CFF6B" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M10 19c0-5 2.6-8.5 6-8.5s6 3.5 6 8.5" stroke="var(--evhw-c)" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M14.2 10.2L17 13l-2.4 1.4 3.2 3.2" stroke="#F5F7FA" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';
    var logoHTML = LOGO
      ? '<img class="evh-w__logo-img" src="' + esc(LOGO) + '" alt="' + esc(DEALER) + ' logo">'
      : DEFAULT_SVG;

    /* heading */
    var modelStr  = MODEL ? ' switching to the ' + MODEL : ' going electric';
    var heading   = 'How much could you save' + modelStr + '?';

    function field(id, label, step) {
      return '<div class="evh-w__field">'
        + '<label class="evh-w__label evhw-lbl-' + id + '">' + esc(label) + '</label>'
        + '<input class="evh-w__input evhw-inp-' + id + '" type="number" min="0"'
        + ' step="' + (step || 0.1) + '" inputmode="decimal">'
        + '</div>';
    }

    var leadHTML = (SHOW_LEAD && WEBHOOK) ? [
      '<div class="evh-w__lead">',
        '<p class="evh-w__lead-title">' + esc(CTA) + '</p>',
        '<div class="evh-w__lead-row">',
          '<input class="evh-w__input evhw-lead-name" type="text" placeholder="Your name" autocomplete="name">',
          '<input class="evh-w__input evhw-lead-email" type="email" placeholder="Email address" autocomplete="email">',
        '</div>',
        '<input class="evh-w__input evhw-lead-phone" type="tel" placeholder="Phone (optional)" autocomplete="tel" style="margin-bottom:10px">',
        '<button class="evh-w__btn evhw-lead-btn">' + esc(CTA) + '</button>',
        '<p class="evh-w__lead-err evhw-lead-err">Please enter your name and email.</p>',
        '<p class="evh-w__lead-ok evhw-lead-ok">✓ Thanks! The team will be in touch shortly.</p>',
      '</div>',
    ].join('') : (SHOW_LEAD && !WEBHOOK ? [
      /* preview mode: show lead form but no real submission */
      '<div class="evh-w__lead">',
        '<p class="evh-w__lead-title">' + esc(CTA) + '</p>',
        '<div class="evh-w__lead-row">',
          '<input class="evh-w__input" type="text" placeholder="Your name" autocomplete="name">',
          '<input class="evh-w__input" type="email" placeholder="Email address" autocomplete="email">',
        '</div>',
        '<input class="evh-w__input" type="tel" placeholder="Phone (optional)" style="margin-bottom:10px">',
        '<button class="evh-w__btn">' + esc(CTA) + '</button>',
      '</div>',
    ].join('') : '');

    mount.innerHTML = [
      '<div class="evh-w" style="--evhw-c:' + esc(COLOR) + '">',
        '<div class="evh-w__head">',
          '<div class="evh-w__logo-row">', logoHTML,
            '<span class="evh-w__dealer">', esc(DEALER), '</span>',
          '</div>',
          '<p class="evh-w__title">', esc(heading), '</p>',
          '<p class="evh-w__sub">Enter your driving details to see your real numbers.</p>',
        '</div>',
        '<div class="evh-w__body">',
          '<div>',
            '<p class="evh-w__section-label">Your Driving</p>',
            '<div class="evh-w__units">',
              '<button class="evh-w__unit-btn evhw-u-km">km · L</button>',
              '<button class="evh-w__unit-btn evhw-u-mi">miles · gal</button>',
            '</div>',
            field('dist',   LABELS[UNIT].dist),
            field('fuel',   LABELS[UNIT].fuel),
            field('fprice', LABELS[UNIT].fprice),
          '</div>',
          '<div>',
            '<p class="evh-w__section-label">EV Costs</p>',
            '<div style="height:38px"></div>',
            field('eveff',  LABELS[UNIT].eveff),
            field('eprice', 'Electricity ($/kWh)', 0.01),
          '</div>',
        '</div>',
        '<div class="evh-w__results">',
          '<div class="evh-w__result-row">',
            '<span class="evh-w__result-label">Monthly gas cost</span>',
            '<span class="evh-w__result-val evhw-r-gas">—</span>',
          '</div>',
          '<div class="evh-w__result-row">',
            '<span class="evh-w__result-label">Monthly EV cost</span>',
            '<span class="evh-w__result-val evhw-r-ev">—</span>',
          '</div>',
          '<div class="evh-w__result-row primary">',
            '<span class="evh-w__result-label">Monthly savings</span>',
            '<span class="evh-w__result-val evhw-r-month">—</span>',
          '</div>',
          '<div class="evh-w__result-row green">',
            '<span class="evh-w__result-label">Yearly savings</span>',
            '<span class="evh-w__result-val evhw-r-year">—</span>',
          '</div>',
          '<div class="evh-w__result-row green">',
            '<span class="evh-w__result-label">5-year savings</span>',
            '<span class="evh-w__result-val evhw-r-five">—</span>',
          '</div>',
        '</div>',
        /* AI match section */
        '<div class="evh-w__ai">',
          '<button class="evh-w__ai-trigger evhw-ai-btn">',
            '<span class="evh-w__ai-spark">✨</span>',
            'Find My Best EV Match with AI',
          '</button>',
          '<div class="evh-w__ai-loading evhw-ai-loading">',
            '<div class="evh-w__ai-dots"><span></span><span></span><span></span></div>',
            '<div class="evh-w__ai-loading-txt">Analysing your driving profile…</div>',
          '</div>',
          '<div class="evh-w__ai-result evhw-ai-result"></div>',
        '</div>',
        leadHTML,
        '<div class="evh-w__footer">',
          '<a class="evh-w__powered" href="https://evhorizon.media" target="_blank" rel="noopener">',
            'Powered by EV Horizon',
          '</a>',
        '</div>',
      '</div>',
    ].join('');

    /* ── Unit toggle ── */
    var currentUnit = UNIT;
    function q(sel) { return mount.querySelector(sel); }
    function qa(sel) { return mount.querySelectorAll(sel); }

    function applyUnit(u) {
      currentUnit = u;
      var defs = DEFAULTS[u], lbls = LABELS[u];
      ['dist','fuel','fprice','eveff'].forEach(function(id) {
        var inp = q('.evhw-inp-' + id), lbl = q('.evhw-lbl-' + id);
        if (inp) inp.value = defs[id];
        if (lbl) lbl.textContent = lbls[id];
      });
      var ep = q('.evhw-inp-eprice');
      if (ep) ep.value = defs.eprice;
      q('.evhw-u-km').classList.toggle('active', u === 'km');
      q('.evhw-u-mi').classList.toggle('active', u === 'mi');
      compute();
    }

    q('.evhw-u-km').addEventListener('click', function() { applyUnit('km'); });
    q('.evhw-u-mi').addEventListener('click', function() { applyUnit('mi'); });

    /* ── Compute ── */
    function n(cls) {
      var el = q('.evhw-inp-' + cls);
      if (!el) return 0;
      var v = parseFloat(el.value);
      return isNaN(v) ? 0 : v;
    }
    function setOut(cls, text) {
      var el = q('.evhw-r-' + cls);
      if (el) el.textContent = text;
    }
    function compute() {
      var dist = n('dist'), fuel = n('fuel'), fprice = n('fprice');
      var eveff = n('eveff'), eprice = n('eprice');
      var gas, ev;
      if (currentUnit === 'km') {
        gas = fuel > 0 ? dist / 100 * fuel * fprice : NaN;
        ev  = eveff > 0 ? dist / 100 * eveff * eprice : NaN;
      } else {
        gas = fuel > 0 ? dist / fuel * fprice : NaN;
        ev  = eveff > 0 ? dist / eveff * eprice : NaN;
      }
      var monthly = gas - ev;
      setOut('gas',   money(gas));
      setOut('ev',    money(ev));
      setOut('month', money(monthly));
      setOut('year',  money(monthly * 12));
      setOut('five',  money(monthly * 60));
    }

    qa('.evh-w__input').forEach(function(el) {
      el.addEventListener('input', compute);
    });

    applyUnit(currentUnit);

    /* ── AI EV Match ── */
    var aiBtn     = q('.evhw-ai-btn');
    var aiLoading = q('.evhw-ai-loading');
    var aiResult  = q('.evhw-ai-result');

    function renderAiResult(data) {
      var tp  = data.topPick || {};
      var alts = data.alternatives || [];

      var chipsHtml = [
        tp.payback ? '<span class="evh-w__ai-chip hi">⚡ Payback ' + esc(tp.payback) + '</span>' : '',
        tp.range   ? '<span class="evh-w__ai-chip">📍 ' + esc(tp.range) + ' range</span>' : '',
      ].join('');

      var altsHtml = alts.map(function(a) {
        return [
          '<div class="evh-w__ai-alt">',
            '<div class="evh-w__ai-alt-model">', esc(a.model || ''), '</div>',
            '<div class="evh-w__ai-alt-tag">', esc(a.tagline || ''), '</div>',
            '<div class="evh-w__ai-alt-reason">', esc(a.reason || ''), '</div>',
            a.payback ? '<div class="evh-w__ai-alt-payback">Payback: ' + esc(a.payback) + '</div>' : '',
          '</div>',
        ].join('');
      }).join('');

      aiResult.innerHTML = [
        '<div class="evh-w__ai-top">',
          '<div class="evh-w__ai-crown">🏆 Top Pick</div>',
          '<div class="evh-w__ai-model">', esc(tp.model || ''), '</div>',
          '<div class="evh-w__ai-tagline">', esc(tp.tagline || ''), '</div>',
          '<div class="evh-w__ai-reason">', esc(tp.reason || ''), '</div>',
          '<div class="evh-w__ai-chips">', chipsHtml, '</div>',
        '</div>',
        alts.length ? '<div class="evh-w__ai-alts">' + altsHtml + '</div>' : '',
        data.summary ? '<div class="evh-w__ai-summary">💚 ' + esc(data.summary) + '</div>' : '',
      ].join('');

      aiLoading.style.display = 'none';
      aiResult.style.display  = 'block';
      aiBtn.style.display     = 'none';
    }

    function showAiError(msg) {
      aiResult.innerHTML = [
        '<div class="evh-w__ai-err">', esc(msg), '<br>',
          '<button class="evh-w__ai-retry evhw-ai-retry">Try again</button>',
        '</div>',
      ].join('');
      aiLoading.style.display = 'none';
      aiResult.style.display  = 'block';
      var retry = q('.evhw-ai-retry');
      if (retry) retry.addEventListener('click', runAiMatch);
    }

    function runAiMatch() {
      aiBtn.style.display     = 'none';
      aiResult.style.display  = 'none';
      aiLoading.style.display = 'block';

      var monthEl = q('.evhw-r-month');
      var yearEl  = q('.evhw-r-year');

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit:            currentUnit,
          monthly_dist:    n('dist'),
          fuel_use:        n('fuel'),
          fuel_price:      n('fprice'),
          ev_efficiency:   n('eveff'),
          elec_price:      n('eprice'),
          monthly_savings: monthEl ? monthEl.textContent : '',
          yearly_savings:  yearEl  ? yearEl.textContent  : '',
          dealer:          DEALER,
          model:           MODEL,
        }),
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.error) { showAiError(data.error); return; }
        renderAiResult(data);
        // stash recommendation so lead payload includes it
        mount._evhwAiPick = (data.topPick || {}).model || '';
      })
      .catch(function() {
        showAiError('Could not reach AI service. Check your connection and try again.');
      });
    }

    if (aiBtn) aiBtn.addEventListener('click', runAiMatch);

    /* ── Lead capture ── */
    var leadBtn = q('.evhw-lead-btn');
    if (leadBtn && WEBHOOK) {
      leadBtn.addEventListener('click', function() {
        var name  = (q('.evhw-lead-name')  || {}).value || '';
        var email = (q('.evhw-lead-email') || {}).value || '';
        var phone = (q('.evhw-lead-phone') || {}).value || '';
        var err   = q('.evhw-lead-err');
        var ok    = q('.evhw-lead-ok');

        if (!name.trim() || !email.trim() || !email.includes('@')) {
          if (err) err.style.display = 'block'; return;
        }
        if (err) err.style.display = 'none';
        leadBtn.disabled = true;
        leadBtn.textContent = 'Sending…';

        fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealer: DEALER, model: MODEL,
            name: name.trim(), email: email.trim(), phone: phone.trim(),
            unit: currentUnit,
            monthly_dist: n('dist'), fuel_use: n('fuel'), fuel_price: n('fprice'),
            ev_efficiency: n('eveff'), elec_price: n('eprice'),
            monthly_savings: (q('.evhw-r-month') || {}).textContent || '',
            yearly_savings:  (q('.evhw-r-year')  || {}).textContent || '',
            ai_recommended: mount._evhwAiPick || '',
            source: window.location.href,
            submitted_at: new Date().toISOString(),
          }),
        }).then(function(res) {
          if (!res.ok) throw new Error();
          leadBtn.style.display = 'none';
          if (ok) ok.style.display = 'block';
        }).catch(function() {
          leadBtn.disabled = false;
          leadBtn.textContent = CTA;
          if (err) { err.textContent = 'Something went wrong — please try again.'; err.style.display = 'block'; }
        });
      });
    }
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  window.EVWidget = { init: renderWidget };

  /* ── Auto-init from script data attributes ──────────────────────────── */
  var scriptEl = document.currentScript || (function() {
    var s = document.querySelectorAll('script[src*="widget.js"]');
    return s[s.length - 1];
  })();

  function attr(key, fallback) {
    var w = window.EVWidgetConfig && window.EVWidgetConfig[key];
    if (w !== undefined) return w;
    var a = scriptEl && scriptEl.getAttribute('data-' + key);
    return (a !== null && a !== undefined) ? a : fallback;
  }

  renderWidget({
    dealer:   attr('dealer', 'Your Dealership'),
    color:    attr('color',  '#00D4FF'),
    unit:     attr('unit',   'km'),
    model:    attr('model',  ''),
    logo:     attr('logo',   ''),
    webhook:  attr('webhook',''),
    endpoint: attr('endpoint',''),
    cta:      attr('cta',   'Get a Personalised Quote'),
    showLead: attr('show-lead', 'true') !== 'false',
    target:   attr('target','ev-savings-widget'),
  });

})();
