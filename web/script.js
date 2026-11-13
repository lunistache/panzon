(function () {
  'use strict';

  var WHATSAPP = '524426023298'; // +52 442 602 3298
  var root = document.documentElement;

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }
  function money(n) { return '$' + n.toLocaleString('es-MX'); }

  /* ── Loader: the lion floats until everything has loaded ── */
  var loader = document.getElementById('loader');
  var shownAt = Date.now();
  var MIN_VISIBLE = 900;

  function hideLoader() {
    if (!loader || loader.classList.contains('is-done')) return;
    var wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt));
    setTimeout(function () {
      loader.classList.add('is-done');
      root.classList.remove('is-loading');
    }, wait);
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 6000); // never trap the visitor behind the loader
  // Pages restored from the back/forward cache must not come back stuck behind the loader
  window.addEventListener('pageshow', function (e) { if (e.persisted) hideLoader(); });

  /* ── Theme toggle ── */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#140E0A' : '#F5EDE0');
  }
  applyTheme(root.getAttribute('data-theme') || 'light');

  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('panzon-theme', next); } catch (e) {}
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('panzon-theme'); } catch (err) {}
    if (!saved) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ── Tiramisù order form ── */
  var form = document.getElementById('orderForm');
  if (form) {
    var totalEl = document.getElementById('orderTotal');
    var hint = document.getElementById('orderHint');
    var hintDefault = hint.textContent;
    var dateInput = document.getElementById('orderDate');
    var sizes = Array.prototype.slice.call(form.querySelectorAll('.size'));
    var MAX_QTY = 20;

    var readOrder = function () {
      var items = [], total = 0;
      sizes.forEach(function (size) {
        var qty = parseInt(size.querySelector('output').textContent, 10) || 0;
        var price = parseInt(size.dataset.price, 10);
        if (qty > 0) {
          items.push({ label: size.dataset.label, qty: qty, subtotal: qty * price });
          total += qty * price;
        }
      });
      return { items: items, total: total };
    };

    var refreshTotal = function () {
      totalEl.textContent = money(readOrder().total) + ' MXN';
      hint.textContent = hintDefault;
      hint.classList.remove('is-error');
    };

    sizes.forEach(function (size) {
      var out = size.querySelector('output');
      size.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var qty = (parseInt(out.textContent, 10) || 0) + parseInt(btn.dataset.step, 10);
          out.textContent = Math.min(MAX_QTY, Math.max(0, qty));
          refreshTotal();
        });
      });
    });

    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var order = readOrder();
      if (!order.items.length) {
        hint.textContent = 'Agrega al menos un tiramisù para armar tu pedido.';
        hint.classList.add('is-error');
        return;
      }
      var name = document.getElementById('orderName').value.trim();
      var note = document.getElementById('orderNote').value.trim();
      var lines = ['¡Ciao Panzon! 🦁 Quiero pedir:', ''];
      order.items.forEach(function (item) {
        lines.push('• ' + item.qty + ' × ' + item.label + ' — ' + money(item.subtotal));
      });
      lines.push('', 'Total: ' + money(order.total) + ' MXN');
      if (name) lines.push('Nombre: ' + name);
      if (dateInput.value) {
        var parts = dateInput.value.split('-');
        var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        lines.push('Para el: ' + date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }));
      }
      if (note) lines.push('Nota: ' + note);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ── Workshop "tell me when it's available" form ── */
  var wform = document.getElementById('workshopForm');
  if (wform) {
    wform.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('workshopName').value.trim();
      var people = document.getElementById('workshopPeople').value.trim();
      var lines = ['¡Ciao Panzon! 🦁 Quiero que me avisen cuando esté disponible el taller de cocina italiana.'];
      if (name) lines.push('Nombre: ' + name);
      if (people) lines.push('Personas: ' + people);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();
