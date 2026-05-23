
import type { Metadata } from 'next';
import './globals.css';
import './framer.css';
import { Toaster } from '@/components/ui/toaster';
// Old Navbar and Footer removed - Framer page has its own
import { ThemeProvider } from '@/components/theme-provider';
import { AdminProvider } from '@/contexts/AdminContext'; // Added AdminProvider
import ModelViewerScript from '@/components/model-viewer-script';

export const metadata: Metadata = {
  metadataBase: new URL('https://celesther.com'), // Replace with actual domain if different
  title: {
    default: "Celesther John Lutche | Professional Portfolio",
    template: "%s | Celesther John Lutche"
  },
  description: "Portfolio of Celesther John Lutche, a passion-driven Editor and 3D artist.",
  openGraph: {
    title: "Celesther John Lutche | Professional Portfolio",
    description: "Portfolio of Celesther John Lutche, a passion-driven Editor and 3D artist.",
    url: 'https://celesther.com',
    siteName: 'Celesther John Lutche Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Celesther John Lutche | Professional Portfolio",
    description: "Portfolio of Celesther John Lutche, a passion-driven Editor and 3D artist.",
    creator: "@celesther", // You can update this if you have a specific handle
  },
};

import { getSiteContent } from '@/app/actions'; // Import action

// ... imports ...

// ... metadata ...

// Force this layout to always be dynamically rendered — never serve stale cached HTML
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Poppins font is now loaded efficiently via next/font */}
      </head>
      <body className="font-body antialiased">
        <AdminProvider initialContent={siteContent}> {/* Wrapped with AdminProvider and initialContent */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <main>
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </AdminProvider>
        {/* Model Viewer Script */}
        <ModelViewerScript />
      </body>
    </html>
  );
}
