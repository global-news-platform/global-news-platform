(function () {
  'use strict';

  var PLACEHOLDER_BASE = 'https://placehold.co';
  var FALLBACK_TEXT = 'No Image Available';
  var DEFAULT_WIDTH = 300;
  var DEFAULT_HEIGHT = 200;

  function getDimensions(img) {
    var w = img.getAttribute('width');
    var h = img.getAttribute('height');

    if (w && h) {
      return {
        width: parseInt(w, 10) || DEFAULT_WIDTH,
        height: parseInt(h, 10) || DEFAULT_HEIGHT,
      };
    }

    var rect = img.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }

    var cs = window.getComputedStyle(img);
    var cw = parseInt(cs.width, 10);
    var ch = parseInt(cs.height, 10);
    if (cw > 0 && ch > 0) {
      return { width: cw, height: ch };
    }

    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  function buildPlaceholderUrl(img) {
    var dims = getDimensions(img);
    var alt = (img.getAttribute('alt') || '').trim() || FALLBACK_TEXT;
    return (
      PLACEHOLDER_BASE +
      '/' +
      dims.width +
      'x' +
      dims.height +
      '?text=' +
      encodeURIComponent(alt)
    );
  }

  function replaceWithPlaceholder(img) {
    var url = buildPlaceholderUrl(img);
    img.src = url;
  }

  function handleImageError() {
    this.onerror = null;
    replaceWithPlaceholder(this);
  }

  function bindImage(img) {
    if (img.hasAttribute('data-fb-bound')) return;
    img.setAttribute('data-fb-bound', '1');
    img.addEventListener('error', handleImageError, { once: true });
  }

  function scanImages() {
    var images = document.querySelectorAll('img');
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      bindImage(img);
      if (
        !img.complete ||
        img.naturalWidth === 0 ||
        img.naturalHeight === 0
      ) {
        if (img.getAttribute('src')) {
          var fallbackUrl = buildPlaceholderUrl(img);
          if (img.src === fallbackUrl) continue;
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanImages);
  } else {
    scanImages();
  }

  var observer = new MutationObserver(function () {
    scanImages();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
