const fs = require('fs');
const jsx = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/framer-export/hero-raw.jsx', 'utf8');

const newContent = `"use client";

import { useAdmin } from '@/contexts/AdminContext';
import EditableTextInline from '@/components/editable-text-inline';
import DraggableNativeElement from '@/components/admin/draggable-native-element';
import Link from 'next/link';

export default function HeroSection() {
  const { isAdmin, siteContent } = useAdmin();
  return (
    <section id="home" className="w-full flex justify-center items-center relative py-20 min-h-screen">
      ${jsx}
    </section>
  );
}
`;

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', newContent);
console.log('Successfully wrote to hero-section.tsx');
