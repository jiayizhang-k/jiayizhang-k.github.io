(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || saved === 'light') {
    root.setAttribute('data-theme', saved);
  }

  function isDark() {
    var current = root.getAttribute('data-theme');
    if (current) return current === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Show the date of the latest change to the site (falls back to the date written in the page)
    var updated = document.getElementById('site-updated');
    if (updated && window.fetch) {
      fetch('https://api.github.com/repos/jiayizhang-k/jiayizhang-k.github.io/commits?per_page=1')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d[0]) return;
          var dt = new Date(d[0].commit.committer.date);
          if (isNaN(dt)) return;
          updated.textContent = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          updated.setAttribute('datetime', dt.toISOString().slice(0, 10));
        })
        .catch(function () {});
    }

    var button = document.querySelector('.theme-toggle');
    if (!button) return;
    button.setAttribute('aria-pressed', String(isDark()));
    button.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      button.setAttribute('aria-pressed', String(next === 'dark'));
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });
})();
