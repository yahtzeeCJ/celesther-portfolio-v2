/**
 * Admin Bridge v9 — Robust Framer Editor
 * Post-hydration discovery with reliable text editing for ALL elements.
 * Discovers elements AFTER hydration using data-framer-name + .framer-text.
 * Generates stable IDs, injects overlays to <html> to escape stacking.
 */
(function () {
  'use strict';

  var isAdmin = false;
  var selectedId = null;
  var adminRoot = null;
  var selBox = null;
  var hoverBox = null;
  var toolbar = null;
  var rafId = null;
  var idMap = {};        // stableId -> element
  var idCounter = 0;

  // ====== STYLES ======
  var css = document.createElement('style');
  css.textContent = [
    '.admin-mode body{--framer-will-change-override:auto!important}',
    '.admin-mode [data-framer-appear-id]{will-change:auto!important;opacity:1!important;transform:none!important}',
    '#admin-root{position:fixed;inset:0;z-index:2147483647;pointer-events:none}',
    '#a-sel{position:fixed;pointer-events:none;border:2px solid #2563eb;display:none;box-sizing:border-box;border-radius:2px}',
    '#a-sel::after{content:attr(data-label);position:absolute;top:-20px;left:-1px;background:#2563eb;color:#fff;font:500 10px/1 -apple-system,sans-serif;padding:2px 8px;border-radius:3px;white-space:nowrap}',
    '#a-hover{position:fixed;pointer-events:none;border:1px solid rgba(37,99,235,0.5);display:none;box-sizing:border-box;border-radius:2px;background:rgba(37,99,235,0.04)}',
    '#a-hover::after{content:attr(data-label);position:absolute;top:-18px;left:-1px;background:rgba(37,99,235,0.85);color:#fff;font:500 9px/1 -apple-system,sans-serif;padding:2px 6px;border-radius:3px;white-space:nowrap}',
    '#a-toolbar{position:fixed;pointer-events:auto;display:none;gap:2px;padding:3px 6px;background:rgba(30,30,30,0.96);border:1px solid #2563eb;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,0.8)}',
    '#a-toolbar button{width:26px;height:26px;border:none;border-radius:4px;background:transparent;color:#ddd;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px}',
    '#a-toolbar button:hover{background:rgba(37,99,235,0.25);color:#2563eb}',
    '#a-toolbar .del:hover{background:rgba(239,68,68,0.25);color:#ef4444}',
    '.admin-mode [data-framer-name]{cursor:pointer!important}',
    '.admin-mode .framer-text{cursor:text!important}',
    '.admin-hidden{opacity:0.1!important;pointer-events:none!important}',
    '.admin-section-bg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
    '.admin-section-grad{position:absolute;inset:0;z-index:0;pointer-events:none}',
  ].join('\n');
  document.head.appendChild(css);

  // ====== GENERATE STABLE ID ======
  function getStableId(el) {
    if (el._adminId) return el._adminId;
    var id = 'f-' + (idCounter++);
    el._adminId = id;
    idMap[id] = el;
    return id;
  }

  // ====== DISCOVER ALL ELEMENTS (post-hydration) ======
  function discoverElements() {
    idMap = {};
    idCounter = 0;
    // Clear old IDs to prevent stale references
    var oldEls = document.querySelectorAll('[data-framer-name], .framer-text, img, video, a, button, input, textarea, svg, h1, h2, h3, h4, h5, h6, p, span, li');
    oldEls.forEach(function (el) { delete el._adminId; });
    // Re-discover everything
    var all = document.querySelectorAll('[data-framer-name], .framer-text, img, video, a, button, input, textarea, svg, h1, h2, h3, h4, h5, h6');
    all.forEach(function (el) { getStableId(el); });
    console.log('[Bridge v9] Discovered', Object.keys(idMap).length, 'elements');
  }

  // ====== BUILD LAYER TREE ======
  function buildLayerTree() {
    var root = document.getElementById('main') || document.body;
    var sections = root.querySelectorAll(':scope > [data-framer-name], :scope > div > [data-framer-name], :scope > div > div > [data-framer-name]');
    var tree = [];
    var seen = new Set();
    sections.forEach(function (sec) {
      var id = getStableId(sec);
      if (seen.has(id)) return;
      seen.add(id);
      tree.push(buildNode(sec, 0));
    });
    return tree;
  }

  function buildNode(el, depth) {
    if (depth > 12) return null;
    var name = el.getAttribute('data-framer-name') || el.tagName.toLowerCase();
    var type = guessType(el);
    var id = getStableId(el);
    var text = '';
    if (type === 'text' && el.textContent) text = el.textContent.substring(0, 80).trim();
    var children = [];
    if (type !== 'text') {
      var childEls = el.children;
      for (var i = 0; i < childEls.length; i++) {
        var child = childEls[i];
        if (child.getAttribute('data-framer-name') || child.classList.contains('framer-text') ||
            child.tagName === 'IMG' || child.tagName === 'VIDEO' || child.tagName === 'A' ||
            child.tagName === 'H1' || child.tagName === 'H2' || child.tagName === 'H3' ||
            child.tagName === 'H4' || child.tagName === 'P' ||
            child.children.length > 0) {
          var node = buildNode(child, depth + 1);
          if (node) children.push(node);
        }
      }
    }
    return { id: id, name: name, type: type, tag: el.tagName, textContent: text, children: children };
  }

  function guessType(el) {
    if (el.classList.contains('framer-text')) return 'text';
    if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6') return 'text';
    if (el.tagName === 'P' && el.closest('.framer-text')) return 'text';
    if (el.tagName === 'IMG') return 'image';
    if (el.tagName === 'VIDEO') return 'video';
    if (el.tagName === 'A') return 'link';
    if (el.tagName === 'BUTTON') return 'button';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return 'input';
    if (el.tagName === 'SVG') return 'icon';
    if (el.tagName === 'UL') return 'gallery';
    return 'frame';
  }

  // ====== CREATE OVERLAYS (on <html>) ======
  function createOverlays() {
    if (adminRoot) return;
    adminRoot = document.createElement('div');
    adminRoot.id = 'admin-root';
    document.documentElement.appendChild(adminRoot);

    var overlayCss = document.createElement('style');
    overlayCss.textContent =
      '.admin-mode .framer-text { position: relative !important; z-index: 2000000000 !important; pointer-events: auto !important; }' +
      '.admin-mode h1, .admin-mode h2, .admin-mode h3, .admin-mode h4, .admin-mode p { pointer-events: auto !important; }';
    adminRoot.appendChild(overlayCss);

    selBox = document.createElement('div');
    selBox.id = 'a-sel';
    adminRoot.appendChild(selBox);

    hoverBox = document.createElement('div');
    hoverBox.id = 'a-hover';
    adminRoot.appendChild(hoverBox);

    toolbar = document.createElement('div');
    toolbar.id = 'a-toolbar';
    toolbar.innerHTML = '<button title="Hide" data-act="hide">👁</button><button title="Delete" data-act="del" class="del">🗑</button>';
    adminRoot.appendChild(toolbar);
    toolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !selectedId) return;
      e.stopPropagation();
      window.parent.postMessage({ type: 'TOOLBAR_ACTION', action: btn.dataset.act, id: selectedId }, '*');
    });
  }

  // ====== POSITION OVERLAY ======
  function posOn(overlay, el, pad) {
    var r = el.getBoundingClientRect();
    overlay.style.top = (r.top - pad) + 'px';
    overlay.style.left = (r.left - pad) + 'px';
    overlay.style.width = (r.width + pad * 2) + 'px';
    overlay.style.height = (r.height + pad * 2) + 'px';
    overlay.style.display = 'block';
  }

  // ====== SELECTION TRACKING (RAF) ======
  function startTracking() {
    stopTracking();
    function tick() {
      var el = idMap[selectedId];
      if (!el || !selectedId) { stopTracking(); return; }
      posOn(selBox, el, 2);
      var r = el.getBoundingClientRect();
      toolbar.style.display = 'flex';
      toolbar.style.left = r.left + 'px';
      toolbar.style.top = Math.max(2, r.top - 34) + 'px';
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopTracking() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (selBox) selBox.style.display = 'none';
    if (toolbar) toolbar.style.display = 'none';
    var texts = document.querySelectorAll('[contenteditable="true"]');
    texts.forEach(function(t) { t.removeAttribute('contenteditable'); });
  }

  // ====== EVENT HANDLERS ======
  function onHover(e) {
    if (!isAdmin) return;
    var el = findEditable(e.target);
    if (el && getStableId(el) !== selectedId) {
      posOn(hoverBox, el, 1);
      hoverBox.setAttribute('data-label', el.getAttribute('data-framer-name') || el.tagName);
    } else {
      hoverBox.style.display = 'none';
    }
  }

  function onClick(e) {
    if (!isAdmin) return;
    if (e.target.closest('#a-toolbar')) return;

    // Prevent navigation for links/buttons
    var linkOrBtn = e.target.closest('a, button');
    if (linkOrBtn) {
      e.preventDefault();
    }

    var el = findEditable(e.target);
    if (el) {
      e.preventDefault();
      e.stopPropagation();
      selectElement(el);
    } else {
      selectedId = null;
      stopTracking();
      window.parent.postMessage({ type: 'LAYER_CLICKED', id: null }, '*');
    }
  }

  // Handle live inline edits
  document.body.addEventListener('input', function(e) {
    if (!isAdmin) return;
    var el = e.target;
    if (el._adminId) {
      window.parent.postMessage({ type: 'TEXT_UPDATED', id: el._adminId, content: el.textContent }, '*');
    }
  });

  function findEditable(target) {
    var el = target;
    // First check: UL gallery containers
    var ul = target.closest ? target.closest('ul') : null;
    if (ul) return ul;

    while (el && el !== document.body) {
      // Match framer-text, named elements, heading tags, and other editable nodes
      if (el.getAttribute && (
        el.getAttribute('data-framer-name') ||
        el.classList.contains('framer-text') ||
        el.tagName === 'UL' ||
        el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' ||
        el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6' ||
        el.tagName === 'A' || el.tagName === 'BUTTON'
      )) return el;
      el = el.parentElement;
    }
    return null;
  }

  // ====== SELECT ======
  function selectElement(el) {
    var texts = document.querySelectorAll('[contenteditable="true"]');
    texts.forEach(function(t) { if (t !== el) t.removeAttribute('contenteditable'); });

    var id = getStableId(el);
    selectedId = id;
    hoverBox.style.display = 'none';
    selBox.setAttribute('data-label', el.getAttribute('data-framer-name') || el.tagName);
    posOn(selBox, el, 2);
    startTracking();
    window.parent.postMessage({ type: 'LAYER_CLICKED', id: id }, '*');
  }

  function selectById(id) {
    var el = idMap[id];
    if (!el) return;
    selectedId = id;
    selBox.setAttribute('data-label', el.getAttribute('data-framer-name') || el.tagName);
    posOn(selBox, el, 2);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    startTracking();
  }

  // ====== HYDRATION OBSERVER ======
  var hydrationObserver = new MutationObserver(function() {
    if (!isAdmin) return;
    if (window._discTimer) clearTimeout(window._discTimer);
    window._discTimer = setTimeout(function() {
      discoverElements();
      if (selectedId && (!idMap[selectedId] || !document.body.contains(idMap[selectedId]))) {
         if (idMap[selectedId]) startTracking();
      }
    }, 200);
  });

  // ====== ADMIN MODE ======
  function toggleAdmin(on) {
    isAdmin = on;
    if (on) {
      createOverlays();
      document.documentElement.classList.add('admin-mode');
      discoverElements();
      var tree = buildLayerTree();
      window.parent.postMessage({ type: 'LAYER_TREE', layers: tree }, '*');
      document.body.addEventListener('click', onClick, true);
      document.body.addEventListener('mousemove', onHover);
      hydrationObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      document.documentElement.classList.remove('admin-mode');
      document.body.removeEventListener('click', onClick, true);
      document.body.removeEventListener('mousemove', onHover);
      hydrationObserver.disconnect();
      stopTracking();
      if (hoverBox) hoverBox.style.display = 'none';
    }
  }

  // ====== APPLY EDITS (ROBUST — works for ALL text elements) ======
  function applyEdit(id, prop, value) {
    var el = idMap[id];
    if (!el) {
      // Try to re-discover and retry
      discoverElements();
      el = idMap[id];
      if (!el) return;
    }
    switch (prop) {
      case 'textContent':
        // Strategy: find ALL text nodes in the element, replace the first non-empty one
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var textNode = null;
        var node;
        while(node = walk.nextNode()) {
          if (node.nodeValue && node.nodeValue.trim() !== '') {
            textNode = node;
            break;
          }
        }
        if (textNode) {
          textNode.nodeValue = value;
        } else {
          // Fallback: set textContent directly (for elements with no text nodes)
          el.textContent = value;
        }
        break;
      case 'src':
        if (el.tagName === 'IMG') el.src = value;
        if (el.tagName === 'VIDEO') {
          el.src = value;
          var source = el.querySelector('source');
          if (source) source.src = value;
        }
        break;
      case 'alt': el.alt = value; break;
      case 'href': el.href = value; break;
      case 'target': el.target = value; break;
      case 'placeholder':
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = value;
        break;
      case 'visibility':
        value === 'hidden' ? el.classList.add('admin-hidden') : el.classList.remove('admin-hidden');
        break;
    }
  }

  function applyTextStyle(id, styles) {
    var el = idMap[id];
    if (!el) return;
    if (styles.fontFamily) { el.style.fontFamily = "'" + styles.fontFamily + "',sans-serif"; loadFont(styles.fontFamily); }
    if (styles.fontSize) el.style.fontSize = styles.fontSize + 'px';
    if (styles.fontWeight) el.style.fontWeight = styles.fontWeight;
    if (styles.color) el.style.setProperty('color', styles.color, 'important');
    if (styles.animation && styles.animation !== 'none') {
      el.style.animation = styles.animation + ' ' + (styles.animationDuration || 0.6) + 's ease-out ' + (styles.animationDelay || 0) + 's both';
    } else { el.style.animation = ''; }
  }

  var loadedFonts = {};
  function loadFont(name) {
    if (loadedFonts[name]) return;
    loadedFonts[name] = true;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + name.replace(/ /g, '+') + ':wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(l);
  }

  // ====== THEME ======
  function applyTheme(theme) {
    var ov = document.getElementById('admin-theme-css');
    if (!ov) { ov = document.createElement('style'); ov.id = 'admin-theme-css'; document.head.appendChild(ov); }
    var hueFilter = '';
    if (theme.hueRotate) {
       hueFilter = '  html, body { --framer-global-hue-rotate: hue-rotate(' + theme.hueRotate + '); }\n' +
                   '  .framer-image:not(ul .framer-image), video:not(ul video) { filter: var(--framer-global-hue-rotate); }\n' +
                   '  [style*="rgb(0, 85"], [style*="rgba(0, 85"], [style*="#0055f"], [style*="#055af7"] { filter: var(--framer-global-hue-rotate); }\n' +
                   '  ul [style*="rgb(0, 85"], ul [style*="rgba(0, 85"], ul [style*="#0055f"], ul [style*="#055af7"] { filter: none !important; }\n';
    }
    ov.textContent = [
      ':root{',
      '  --theme-primary:' + theme.primaryColor + ';',
      '  --theme-secondary:' + theme.secondaryColor + ';',
      '  --theme-accent:' + theme.accentColor + ';',
      '  --token-f951c3a8-aa43-4825-aa75-915aa92c20d1: ' + theme.primaryColor + ' !important;',
      '  --token-ad10564e-4158-40a7-94e1-51af1b841a47: ' + theme.primaryColor + '33 !important;',
      '  --token-f5219c3a-5ee2-4639-9e23-4bdcf5509ebd: ' + theme.primaryColor + '26 !important;',
      '  --token-64bf095d-9ad7-4fc0-9f3c-f96ec87f9b9b: ' + theme.primaryColor + '14 !important;',
      '  --token-db45a5b7-645b-4156-8616-6cff499bb824: ' + theme.primaryColor + '0a !important;',
      '}',
      hueFilter,
      '[style*="color: rgb(0, 85,"],.framer-text [style*="color: rgb(0, 85,"]{color:' + theme.primaryColor + '!important}',
      '[style*="background-color: rgb(0, 85,"],[style*="background: rgb(0, 85,"]{background-color:' + theme.primaryColor + '!important}',
      '[style*="color:#0055fe"],[style*="color: #0055fe"]{color:' + theme.primaryColor + '!important}',
      '[style*="background:#0055fe"],[style*="background-color:#0055fe"]{background-color:' + theme.primaryColor + '!important}',
      '[style*="color:#055af7"]{color:' + theme.primaryColor + '!important}',
      '[style*="background:#055af7"],[style*="background-color:#055af7"]{background-color:' + theme.primaryColor + '!important}',
      'svg path[fill="#0055fe"],svg path[fill="#055af7"]{fill:' + theme.primaryColor + '!important}',
      'svg path[stroke="#0055fe"],svg path[stroke="#055af7"]{stroke:' + theme.primaryColor + '!important}',
    ].join('\n');
  }

  // ====== SECTION BG / GRADIENT ======
  function applySectionBg(secId, bg) {
    var sec = idMap[secId]; if (!sec) return;
    sec.style.position = 'relative';
    var old = sec.querySelector('.admin-section-bg'); if (old) old.remove();
    if (!bg || bg.type === 'none') return;
    var ov = document.createElement('div'); ov.className = 'admin-section-bg';
    ov.style.opacity = bg.opacity != null ? bg.opacity : 0.5;
    if (bg.type === 'image' && bg.url) { ov.style.backgroundImage = "url('" + bg.url + "')"; ov.style.backgroundSize = 'cover'; ov.style.backgroundPosition = 'center'; }
    else if (bg.type === 'video' && bg.url) { var v = document.createElement('video'); v.src = bg.url; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true; v.style.objectFit = 'cover'; v.style.width = '100%'; v.style.height = '100%'; ov.appendChild(v); }
    else if (bg.type === 'code' && bg.code) { ov.innerHTML = bg.code; }
    sec.insertBefore(ov, sec.firstChild);
  }

  function applySectionGrad(secId, grad) {
    var sec = idMap[secId]; if (!sec) return;
    sec.style.position = 'relative';
    var old = sec.querySelector('.admin-section-grad'); if (old) old.remove();
    if (!grad || !grad.enabled) return;
    var ov = document.createElement('div'); ov.className = 'admin-section-grad';
    var c = grad.color1 + ',' + grad.color2 + (grad.color3 ? ',' + grad.color3 : '');
    ov.style.background = grad.type === 'radial' ? 'radial-gradient(circle,' + c + ')' : 'linear-gradient(' + (grad.direction || 'to bottom') + ',' + c + ')';
    ov.style.opacity = grad.opacity != null ? grad.opacity : 0.5;
    sec.insertBefore(ov, sec.firstChild);
  }

  function hideSection(id) { var e = idMap[id]; if (e) e.classList.add('admin-hidden'); }
  function showSection(id) { var e = idMap[id]; if (e) e.classList.remove('admin-hidden'); }

  // ====== INITIAL STATE ======
  function applyInitial(data) {
    if (data.animationCSS) {
      var s = document.getElementById('admin-anim-css');
      if (!s) { s = document.createElement('style'); s.id = 'admin-anim-css'; document.head.appendChild(s); }
      s.textContent = data.animationCSS;
    }
    if (data.theme && data.theme.primaryColor) applyTheme(data.theme);

    // Re-apply all saved text edits
    if (data.textEdits) {
      Object.keys(data.textEdits).forEach(function(id) {
        applyEdit(id, 'textContent', data.textEdits[id]);
      });
    }
    // Re-apply all saved text styles
    if (data.textStyles) {
      Object.keys(data.textStyles).forEach(function(id) {
        applyTextStyle(id, data.textStyles[id]);
      });
    }
  }

  function applyTickerImage(id, imgUrl) {
    var ul = idMap[id];
    if (!ul || ul.tagName !== 'UL') return;
    var firstLi = ul.querySelector('li');
    if (!firstLi) return;
    var newLi = firstLi.cloneNode(true);
    var img = newLi.querySelector('img');
    if (img) img.src = imgUrl;
    ul.appendChild(newLi);
  }

  // ====== MESSAGE LISTENER ======
  window.addEventListener('message', function (ev) {
    var d = ev.data; if (!d || !d.type) return;
    switch (d.type) {
      case 'ADMIN_MODE_TOGGLE': toggleAdmin(d.enabled); break;
      case 'SELECT_LAYER': selectById(d.id); break;
      case 'APPLY_EDIT': applyEdit(d.id, d.prop, d.value); break;
      case 'APPLY_TEXT_STYLE': applyTextStyle(d.id, d.styles); break;
      case 'APPLY_SECTION_BG': applySectionBg(d.sectionId, d.bg); break;
      case 'APPLY_SECTION_GRADIENT': applySectionGrad(d.sectionId, d.gradient); break;
      case 'APPLY_THEME': applyTheme(d.theme); break;
      case 'HIDE_SECTION': hideSection(d.sectionId); break;
      case 'SHOW_SECTION': showSection(d.sectionId); break;
      case 'INITIAL_STATE': applyInitial(d); break;
      case 'ADD_TICKER_IMAGE': applyTickerImage(d.id, d.url); break;
    }
  });

  // Wait for Framer hydration to complete, then signal ready
  function waitForHydration() {
    var check = setInterval(function () {
      var named = document.querySelectorAll('[data-framer-name]');
      if (named.length > 30) {
        clearInterval(check);
        console.log('[Bridge v9] Hydration complete,', named.length, 'named elements found');
        window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
      }
    }, 150);
    // Fallback after 4s
    setTimeout(function () { clearInterval(check); window.parent.postMessage({ type: 'IFRAME_READY' }, '*'); }, 4000);
  }

  if (document.readyState === 'complete') waitForHydration();
  else window.addEventListener('load', waitForHydration);
})();
