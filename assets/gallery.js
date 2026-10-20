document.querySelectorAll('[data-gallery]').forEach(function (link) {
  var dialog = document.getElementById(link.getAttribute('data-gallery'));
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var img = dialog.querySelector('.viewer-img');
  var video = dialog.querySelector('.viewer-video');
  var caption = dialog.querySelector('.viewer-caption');
  var count = dialog.querySelector('.viewer-count');
  var back = dialog.querySelector('.gallery-back');
  var thumbs = Array.prototype.slice.call(dialog.querySelectorAll('.thumb'));
  var current = 0;

  function stopVideo() { if (video && !video.paused) video.pause(); }

  function setMode(mode) {
    if (mode === 'grid') { stopVideo(); dialog.scrollTop = 0; }
    dialog.setAttribute('data-mode', mode);
  }

  function show(i, autoplay) {
    current = (i + thumbs.length) % thumbs.length;
    var t = thumbs[current];
    var isVideo = t.getAttribute('data-type') === 'video';
    stopVideo();
    if (isVideo && video) {
      img.hidden = true; video.hidden = false;
      if (video.getAttribute('src') !== t.getAttribute('data-full')) {
        video.poster = t.getAttribute('data-poster');
        video.src = t.getAttribute('data-full');
      }
      video.setAttribute('aria-label', t.getAttribute('data-alt'));
      if (autoplay) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    } else {
      if (video) { video.hidden = true; }
      img.hidden = false;
      img.src = t.getAttribute('data-full');
      img.alt = t.getAttribute('data-alt');
    }
    if (caption) caption.textContent = t.getAttribute('data-caption') || '';
    count.textContent = (current + 1) + ' / ' + thumbs.length;
    thumbs.forEach(function (b, k) { b.setAttribute('aria-current', k === current ? 'true' : 'false'); });
    t.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  thumbs.forEach(function (b, k) {
    b.addEventListener('click', function () {
      var fromGrid = dialog.getAttribute('data-mode') === 'grid';
      setMode('photo'); show(k, true);
      if (fromGrid) back.focus();
    });
  });
  back.addEventListener('click', function () { setMode('grid'); thumbs[current].focus(); thumbs[current].scrollIntoView({ block: 'nearest', inline: 'start' }); updateWall(); });
  dialog.querySelector('.prev').addEventListener('click', function () { show(current - 1, false); });
  dialog.querySelector('.next').addEventListener('click', function () { show(current + 1, false); });
  dialog.addEventListener('keydown', function (e) {
    if (dialog.getAttribute('data-mode') !== 'photo') return;
    if (e.target === video) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, false); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, false); }
  });
  // Esc from a large item goes back to the grid; Esc from the grid closes
  dialog.addEventListener('cancel', function (e) {
    if (dialog.getAttribute('data-mode') === 'photo') { e.preventDefault(); setMode('grid'); thumbs[current].focus(); }
  });

  var startX = null;
  if (img) {
    img.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1), false);
      startX = null;
    });
  }

  // Walk-through wall: arrows scroll the row of works one step at a time
  var row = dialog.querySelector('.thumbs');
  var wallPrev = dialog.querySelector('.wall-prev');
  var wallNext = dialog.querySelector('.wall-next');
  function updateWall() {
    if (!wallPrev) return;
    wallPrev.disabled = row.scrollLeft <= 2;
    wallNext.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
  }
  if (wallPrev) {
    var step = function (dir) { row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: 'smooth' }); };
    wallPrev.addEventListener('click', function () { step(-1); });
    wallNext.addEventListener('click', function () { step(1); });
    row.addEventListener('scroll', updateWall, { passive: true });
    window.addEventListener('resize', updateWall);
  }

  link.addEventListener('click', function () {
    setMode('grid'); dialog.showModal(); row.scrollLeft = 0;
    requestAnimationFrame(updateWall); setTimeout(updateWall, 400);
  });
  dialog.querySelector('.gallery-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { stopVideo(); link.focus(); });
});
