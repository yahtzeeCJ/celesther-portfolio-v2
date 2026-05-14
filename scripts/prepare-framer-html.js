const fs = require('fs');
const { parse } = require('node-html-parser');
const path = require('path');

let idCounter = 0;

function classifyElement(node) {
  const tag = node.tagName;
  const framerName = node.getAttribute('data-framer-name');
  const isText = node.classList && node.classList.contains('framer-text');
  const hasBgImage = (node.getAttribute('style') || '').includes('background-image');

  if (isText) return 'text';
  if (tag === 'IMG') return 'image';
  if (tag === 'VIDEO') return 'video';
  if (tag === 'SVG' || tag === 'svg') return 'icon';
  if (tag === 'A') return 'link';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return 'input';
  if (tag === 'BUTTON') return 'button';
  if (hasBgImage) return 'bg-image';
  if (framerName) return 'frame';
  return 'element';
}

function getTextContent(node) {
  // Get direct text content without going into children too deep
  let text = '';
  for (const child of node.childNodes) {
    if (child.nodeType === 3) { // TEXT_NODE
      text += child.rawText.trim();
    }
  }
  return text || null;
}

function extractLayers(node, parentPath = 'r') {
  const layers = [];

  if (!node.childNodes) return layers;

  let childIndex = 0;
  for (const child of node.childNodes) {
    if (child.nodeType !== 1) continue; // Skip non-elements

    const tag = child.tagName;
    const framerName = child.getAttribute('data-framer-name');
    const isText = child.classList && child.classList.contains('framer-text');
    const isImg = tag === 'IMG';
    const isVideo = tag === 'VIDEO';
    const isSvg = tag === 'SVG' || tag === 'svg';
    const isLink = tag === 'A';
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const isButton = tag === 'BUTTON';
    const hasBgImage = (child.getAttribute('style') || '').includes('background-image');

    // We want to capture: named frames, text, images, videos, SVGs, links, inputs, buttons, bg-images
    const isInteresting = framerName || isText || isImg || isVideo || isSvg || isLink || isInput || isButton || hasBgImage;

    const currentPath = `${parentPath}-${childIndex}`;

    if (isInteresting) {
      const id = `fl-${idCounter++}`;
      child.setAttribute('data-admin-id', id);

      const type = classifyElement(child);

      const layer = {
        id,
        name: framerName || (isText ? (getTextContent(child) || 'Text').substring(0, 40) : null) || tag,
        type,
        tag,
      };

      // Add metadata based on type
      if (isImg) {
        layer.src = child.getAttribute('src') || '';
        layer.alt = child.getAttribute('alt') || '';
      }
      if (isVideo) {
        layer.src = child.getAttribute('src') || '';
        const source = child.querySelector('source');
        if (source) layer.src = source.getAttribute('src') || layer.src;
      }
      if (isLink) {
        layer.href = child.getAttribute('href') || '';
        layer.target = child.getAttribute('target') || '';
      }
      if (isInput) {
        layer.inputType = child.getAttribute('type') || 'text';
        layer.placeholder = child.getAttribute('placeholder') || '';
        layer.name = child.getAttribute('name') || layer.name;
      }
      if (isButton) {
        layer.textContent = child.text?.trim().substring(0, 60) || '';
      }
      if (hasBgImage) {
        const style = child.getAttribute('style') || '';
        const bgMatch = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/);
        if (bgMatch) layer.bgImageUrl = bgMatch[1];
      }
      if (isText) {
        layer.textContent = child.text?.trim().substring(0, 100) || '';
      }

      // Recurse into children
      layer.children = extractLayers(child, currentPath);

      layers.push(layer);
    } else {
      // Flatten unnamed structural wrappers
      const childLayers = extractLayers(child, currentPath);
      layers.push(...childLayers);
    }

    childIndex++;
  }
  return layers;
}

function countLayers(layers) {
  let total = layers.length;
  for (const l of layers) {
    if (l.children) total += countLayers(l.children);
  }
  return total;
}

function prepareHtml() {
  const inputPath = path.join(process.cwd(), 'public', 'framer.html');
  const outputPath = path.join(process.cwd(), 'public', 'framer-editable.html');
  const jsonPath = path.join(process.cwd(), 'public', 'framer-layers.json');

  if (!fs.existsSync(inputPath)) {
    console.error('framer.html not found in public folder.');
    process.exit(1);
  }

  console.log('Reading public/framer.html...');
  const html = fs.readFileSync(inputPath, 'utf8');
  const root = parse(html);

  const body = root.querySelector('body');
  if (!body) {
    console.error('No <body> tag found.');
    process.exit(1);
  }

  // Reset counter
  idCounter = 0;

  // Extract full layer tree
  console.log('Extracting ALL layers...');
  const layerTree = extractLayers(body);

  const totalLayers = countLayers(layerTree);

  // Save the layer tree
  fs.writeFileSync(jsonPath, JSON.stringify(layerTree, null, 2));
  console.log(`Saved ${totalLayers} layers to public/framer-layers.json.`);

  // Count types
  const typeCounts = {};
  function countTypes(layers) {
    for (const l of layers) {
      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1;
      if (l.children) countTypes(l.children);
    }
  }
  countTypes(layerTree);
  console.log('Layer type breakdown:', JSON.stringify(typeCounts, null, 2));

  // Inject admin-bridge.js
  const scriptTag = '\n    <!-- Injected by Next.js Admin Mode -->\n    <script src="/admin-bridge.js"></script>\n';
  body.insertAdjacentHTML('beforeend', scriptTag);
  console.log('Injected admin-bridge.js script tag.');

  // Save the new file
  fs.writeFileSync(outputPath, root.toString());
  console.log(`Successfully generated public/framer-editable.html`);
}

prepareHtml();
