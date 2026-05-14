'use client';

import Script from 'next/script';

export default function ModelViewerScript() {
  return (
    <Script
      type="module"
      src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
      strategy="afterInteractive"
    />
  );
}
