const fs = require('fs');
const { parse } = require('node-html-parser');

const html = fs.readFileSync('public/framer.html', 'utf8');
const root = parse(html);

// We only want to traverse nodes that are Elements
function extractLayers(node, path = '0') {
  const layers = [];
  
  if (!node.childNodes) return layers;

  let childIndex = 0;
  for (const child of node.childNodes) {
    if (child.nodeType === 1) { // ELEMENT_NODE
      const framerName = child.getAttribute('data-framer-name');
      const isTextNode = child.classList && child.classList.contains('framer-text');
      
      const currentPath = `${path}-${childIndex}`;
      
      if (framerName || isTextNode) {
        const layer = {
          id: child.getAttribute('data-admin-id') || currentPath, // Fallback ID
          name: framerName || (isTextNode ? 'Text Layer' : child.tagName),
          type: isTextNode ? 'text' : 'frame',
          children: extractLayers(child, currentPath)
        };
        layers.push(layer);
      } else {
        // If this node doesn't have a name, maybe its children do.
        // We flatten them up to this level so we don't have deeply nested unnamed divs.
        const childLayers = extractLayers(child, currentPath);
        layers.push(...childLayers);
      }
      childIndex++;
    }
  }
  return layers;
}

const body = root.querySelector('body');
const layerTree = extractLayers(body);

console.log(JSON.stringify(layerTree.slice(0, 2), null, 2));
