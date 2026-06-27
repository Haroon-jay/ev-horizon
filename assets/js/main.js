/* EV Horizon — global behaviors */
(function () {
  'use strict';

  // "For Dealerships" nav link — injected dynamically so one change covers all pages
  (function () {
    var depth = window.location.pathname.replace(/\/$/, '').split('/').length - 2;
    var prefix = depth > 0 ? Array(depth + 1).join('../') : '';
    var menuInner = document.querySelector('.nav-more-menu .menu-inner');
    if (menuInner) {
      var a = document.createElement('a');
      a.href = prefix + 'widget/';
      a.textContent = 'For Dealerships';
      a.style.cssText = 'color:#00D4FF;font-weight:600';
      menuInner.appendChild(a);
    }
  })();

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', document.body.classList.contains('nav-open') ? 'true' : 'false');
    });
  }

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  // Real submissions via Formspree (set FORM_ENDPOINT in _build/site.js). Falls
  // back to a front-end demo when no endpoint is configured.
  var endpointMeta = document.querySelector('meta[name="form-endpoint"]');
  var FORM_ENDPOINT = endpointMeta ? (endpointMeta.getAttribute('content') || '').trim() : '';

  function showSuccess(form) {
    var ok = form.parentElement.querySelector('.form-success');
    if (ok) ok.classList.add('show');
    form.style.display = 'none';
  }

  function postForm(form, onDone) {
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (res.ok) { showSuccess(form); }
      else { onDone && onDone(false); }
    }).catch(function () { onDone && onDone(false); });
  }

  // Newsletter forms
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email || !email.value || email.value.indexOf('@') < 1) return;
      if (FORM_ENDPOINT) {
        var btn = form.querySelector('button');
        if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }
        postForm(form, function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
          alert('Sorry — something went wrong. Please try again.');
        });
      } else {
        showSuccess(form); // demo
      }
    });
  });

  // Contact form
  var contact = document.querySelector('form[data-contact]');
  if (contact) {
    contact.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (FORM_ENDPOINT) {
        var btn = contact.querySelector('button[type="submit"], button');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        postForm(contact, function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Send message'; }
          alert('Sorry — something went wrong. Please try again, or email us directly.');
        });
      } else {
        // demo — open the visitor's mail app, prefilled
        var name = (contact.querySelector('[name="name"]') || {}).value || '';
        var email = (contact.querySelector('[name="email"]') || {}).value || '';
        var topic = (contact.querySelector('[name="topic"]') || {}).value || 'General';
        var msg = (contact.querySelector('[name="message"]') || {}).value || '';
        var subject = encodeURIComponent('[' + topic + '] Message from ' + name);
        var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
        showSuccess(contact);
        window.location.href = 'mailto:hello@evhorizon.media?subject=' + subject + '&body=' + body;
      }
    });
  }

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Animated count-up for hero stats (progressive enhancement)
  var counters = document.querySelectorAll('.num[data-count]');
  if (counters.length) {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var runCount = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      var dur = 1200, start = null;
      el.textContent = '0' + suffix;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    if (reduce) {
      /* leave final values in place */
    } else if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { co.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  // 3D tilt showcase (home hero)
  var stage = document.querySelector('[data-tilt]');
  if (stage && window.matchMedia && matchMedia('(pointer: fine)').matches
      && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var scene = stage.querySelector('.showcase-scene');
    stage.addEventListener('mousemove', function (e) {
      if (stage.classList.contains('game-active')) return; // frozen while dragging the cable
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      scene.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      scene.style.setProperty('--rx', (-py * 11).toFixed(2) + 'deg');
      scene.style.setProperty('--sc', '1.025');
    });
    stage.addEventListener('mouseleave', function () {
      scene.style.setProperty('--ry', '0deg');
      scene.style.setProperty('--rx', '0deg');
      scene.style.setProperty('--sc', '1');
    });
  }
})();
