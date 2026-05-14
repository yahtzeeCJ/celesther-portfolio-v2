const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const htmlPath = path.join(__dirname, 'persistent-areas-651376.framer.app_tostatic', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const root = parse(html);
const framerRoot = root.querySelector('[data-framer-root]');

if (!framerRoot) {
  console.error("Could not find framer root!");
  process.exit(1);
}

function toJsx(node) {
  if (node.nodeType === 3) {
    let text = node.text;
    text = text.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');
    return text;
  }
  
  if (node.nodeType !== 1) return '';
  
  const tag = node.rawTagName.toLowerCase();
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
    
    if (jsKey === 'style') {
      const pairs = [];
      const rules = value.split(';');
      for (const rule of rules) {
        const trimmed = rule.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;
        let k = trimmed.substring(0, colonIdx).trim();
        const v = trimmed.substring(colonIdx + 1).trim().replace(/"/g, '\\"');
        
        if (k === 'cornerShape' || k === 'corner-shape') continue;
        
        if (!k.startsWith('--')) {
          k = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
          if (k.startsWith('webkit')) k = 'W' + k.substring(1);
        }
        pairs.push('"' + k + '":"' + v + '"');
      }
      jsx += ' style={{' + pairs.join(',') + '} as React.CSSProperties}';
    } else {
      if (['disabled', 'checked', 'selected', 'required', 'readOnly', 'multiple', 'autoFocus'].includes(jsKey)) {
        jsx += ' ' + jsKey + '={true}';
      } else if (value === '' && !['alt', 'src', 'href'].includes(jsKey)) {
        if (jsKey.startsWith('data-')) jsx += ' ' + jsKey + '={true}';
        else jsx += ' ' + jsKey + '=""';
      } else {
        const escapedValue = value.replace(/"/g, '&quot;');
        jsx += ' ' + jsKey + '="' + escapedValue + '"';
      }
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
'      ' + toJsx(framerRoot) + '\n' +
'    </>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('src/components/framer-page.tsx', component);
console.log('Successfully wrote reliable FramerPage component!');
