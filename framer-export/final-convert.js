const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const htmlPath = path.join(__dirname, 'persistent-areas-651376.framer.app_tostatic', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const root = parse(html);
const framerRoot = root.querySelector('[data-framer-root]');

// SSR variants are kept intentionally because Framer's CSS handles showing/hiding them.
// Deleting them breaks the CSS grid/flexbox layouts and responsive design.

// Removed buggy unwrapping logic

// Now do the JSX conversion with all fixes baked in
function toJsx(node, depth = 0) {
  if (node.nodeType === 3) {
    let text = node.text;
    text = text.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');
    return text;
  }
  
  if (node.nodeType !== 1) return '';
  
  const tag = node.rawTagName ? node.rawTagName.toLowerCase() : '';
  if (!tag) return '';
  if (['script', 'style', 'noscript'].includes(tag)) return '';
  
  let jsx = '<' + tag;
  
  for (const [key, value] of Object.entries(node.attributes)) {
    let jsKey = key;
    if (jsKey === 'class') jsKey = 'className';
    else if (jsKey === 'for') jsKey = 'htmlFor';
    else if (jsKey === 'srcset') jsKey = 'srcSet';
    else if (jsKey === 'tabindex') jsKey = 'tabIndex';
    else if (jsKey === 'autocomplete') jsKey = 'autoComplete';
    else if (jsKey === 'crossorigin') jsKey = 'crossOrigin';
    else if (jsKey === 'datetime') jsKey = 'dateTime';
    else if (jsKey === 'rowspan') jsKey = 'rowSpan';
    else if (jsKey === 'colspan') jsKey = 'colSpan';
    else if (jsKey === 'playsinline') jsKey = 'playsInline';
    
    // Skip invalid DOM attributes
    if (['parentsize', 'constraints', 'rotation', 'shadows', 'intrinsicwidth', 
         'intrinsicheight', 'background', 'font', 'cornerShape'].includes(jsKey)) continue;
    if (jsKey === 'as' && value !== 'span') continue;
    
    if (jsKey === 'style') {
      const pairs = [];
      const rules = value.split(';');
      for (const rule of rules) {
        const trimmed = rule.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;
        let k = trimmed.substring(0, colonIdx).trim();
        let v = trimmed.substring(colonIdx + 1).trim().replace(/"/g, '\\"');
        
        if (k === 'cornerShape' || k === 'corner-shape') continue;
        
        // Fix opacity:0 (Framer animation initial state)
        if (k === 'opacity' && (v === '0' || v === '0.001' || v === '0.01')) v = '1';
        
        if (!k.startsWith('--')) {
          k = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
          if (k.startsWith('webkit')) k = 'W' + k.substring(1);
        }
        pairs.push('"' + k + '":"' + v + '"');
      }
      jsx += ' style={{' + pairs.join(',') + '} as React.CSSProperties}';
    } else if (jsKey === 'tabIndex') {
      jsx += ' tabIndex={' + (parseInt(value) || 0) + '}';
    } else if (['disabled', 'checked', 'selected', 'required', 'readOnly', 'multiple', 
                'autoFocus', 'loop', 'muted', 'playsInline', 'autoPlay', 'controls'].includes(jsKey)) {
      jsx += ' ' + jsKey + '={true}';
    } else if (jsKey === 'value' && tag === 'input') {
      jsx += ' defaultValue="' + value.replace(/"/g, '&quot;') + '"';
    } else if (value === '' && !['alt', 'src', 'href', 'action', 'method'].includes(jsKey)) {
      if (jsKey.startsWith('data-')) jsx += ' ' + jsKey + '={true}';
      else jsx += ' ' + jsKey + '=""';
    } else {
      const escapedValue = value.replace(/"/g, '&quot;');
      jsx += ' ' + jsKey + '="' + escapedValue + '"';
    }
  }
  
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  if (voidElements.includes(tag)) {
    jsx += ' />';
  } else {
    jsx += '>';
    for (const child of node.childNodes) {
      jsx += toJsx(child);
    }
    jsx += '</' + tag + '>';
  }
  
  return jsx;
}

const jsxContent = framerRoot.childNodes.map(child => toJsx(child, 0)).join('');

const component = '"use client";\n' +
'/* eslint-disable @next/next/no-img-element */\n' +
'/* eslint-disable jsx-a11y/alt-text */\n' +
'\n' +
'import React from "react";\n' +
'import { useAdmin } from "@/contexts/AdminContext";\n' +
'import EditableTextInline from "@/components/editable-text-inline";\n' +
'\n' +
'export default function FramerPage() {\n' +
'  const { isAdmin, siteContent } = useAdmin();\n' +
'  return (\n' +
'    <>\n' +
'      ' + jsxContent + '\n' +
'    </>\n' +
'  );\n' +
'}\n';

const outPath = path.join(__dirname, '..', 'src', 'components', 'framer-page.tsx');
fs.writeFileSync(outPath, component);
console.log('Wrote clean framer-page.tsx (' + component.length + ' bytes)');
