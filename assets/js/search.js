/* EV Horizon — global search (brand, model, category, article, keyword) */
(function () {
  'use strict';
  if (typeof SEARCH_INDEX === 'undefined') return;

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var counter = document.getElementById('search-count');
  var filterBtns = document.querySelectorAll('.search-filters button');
  if (!input || !results) return;

  var activeType = 'all';

  function norm(s) { return (s || '').toLowerCase(); }

  function score(item, q) {
    if (!q) return 1; // empty query lists everything
    var s = 0;
    var hay = {
      title: norm(item.title),
      excerpt: norm(item.excerpt),
      category: norm(item.categoryLabel),
      keywords: norm((item.keywords || []).join(' ')),
      brands: norm((item.brands || []).join(' ')),
      models: norm((item.models || []).join(' ')),
    };
    q.split(/\s+/).forEach(function (term) {
      if (!term) return;
      if (hay.title.indexOf(term) !== -1) s += 6;
      if (hay.brands.indexOf(term) !== -1) s += 5;
      if (hay.models.indexOf(term) !== -1) s += 5;
      if (hay.category.indexOf(term) !== -1) s += 3;
      if (hay.keywords.indexOf(term) !== -1) s += 3;
      if (hay.excerpt.indexOf(term) !== -1) s += 2;
    });
    return s;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render() {
    var q = norm(input.value.trim());
    var matches = SEARCH_INDEX
      .filter(function (it) { return activeType === 'all' || it.type === activeType; })
      .map(function (it) { return { item: it, s: score(it, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });

    if (counter) {
      counter.textContent = q
        ? matches.length + ' result' + (matches.length === 1 ? '' : 's') + ' for “' + input.value.trim() + '”'
        : 'Browse everything on EV Horizon — or start typing to search by brand, model, category or keyword.';
    }

    if (!matches.length) {
      results.innerHTML = '<p class="no-results">No results. Try a brand (“Tesla”, “BYD”), a topic (“charging”, “battery”) or a tool (“savings”).</p>';
      return;
    }
    results.innerHTML = matches.map(function (r) {
      var it = r.item;
      return '<a class="result-item" href="' + it.url + '">' +
        '<span class="chip' + (it.type === 'tool' ? ' green' : '') + '">' + esc(it.categoryLabel) + '</span>' +
        '<h3>' + esc(it.title) + '</h3>' +
        '<p>' + esc(it.excerpt) + '</p>' +
        '</a>';
    }).join('');
  }

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      activeType = b.getAttribute('data-type');
      filterBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
      render();
    });
  });

  input.addEventListener('input', render);

  // Read ?q= from the URL (header search form lands here)
  try {
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) input.value = q;
  } catch (e) { /* no-op */ }

  input.focus();
  render();
})();
