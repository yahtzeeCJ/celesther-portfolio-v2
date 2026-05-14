const fs = require('fs');

const jsx = fs.readFileSync('framer-export/framer-body.jsx', 'utf8');

const component = `"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import EditableTextInline from '@/components/editable-text-inline';

export default function FramerPage() {
  const { isAdmin, siteContent } = useAdmin();
  return (
    <>
      ${jsx}
    </>
  );
}
`;

fs.writeFileSync('src/components/framer-page.tsx', component);
console.log('Wrote framer-page.tsx: ' + component.length + ' bytes');
