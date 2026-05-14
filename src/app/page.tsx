'use client';

import { useEffect, useRef, useCallback } from 'react';
import LeftPanel from '@/components/admin/left-panel';
import RightPanel from '@/components/admin/right-panel';
import { useAdmin } from '@/contexts/AdminContext';
import { TEXT_ANIMATIONS, BG_ANIMATIONS } from '@/lib/text-animations';

export default function Home() {
  const { isAdmin, siteContent, updateSiteContent, selectedLayerId, setSelectedLayerId } = useAdmin();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const postToIframe = useCallback((msg: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, []);

  // Send admin mode toggle
  useEffect(() => {
    postToIframe({ type: 'ADMIN_MODE_TOGGLE', enabled: isAdmin });
  }, [isAdmin, postToIframe]);

  // Send layer selection
  useEffect(() => {
    postToIframe({ type: 'SELECT_LAYER', id: selectedLayerId });
  }, [selectedLayerId, postToIframe]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'IFRAME_READY') {
        const allCss = [
          ...TEXT_ANIMATIONS.map(a => a.css),
          ...BG_ANIMATIONS.filter(a => a.css).map(a => a.css!)
        ].join('\n');

        postToIframe({
          type: 'INITIAL_STATE',
          textEdits: siteContent.framerTextEdits || {},
          edits: siteContent.framerEdits || {},
          textStyles: siteContent.framerTextStyles || {},
          sectionBackgrounds: siteContent.framerSectionBackgrounds || {},
          sectionGradients: siteContent.framerSectionGradients || {},
          theme: siteContent.framerTheme || {},
          hiddenSections: siteContent.framerHiddenSections || [],
          customSections: siteContent.framerCustomSections || [],
          animationCSS: allCss,
        });
        postToIframe({ type: 'ADMIN_MODE_TOGGLE', enabled: isAdmin });
      } else if (data.type === 'TEXT_UPDATED') {
        const newEdits = { ...(siteContent.framerTextEdits || {}) };
        newEdits[data.id] = data.content;
        updateSiteContent('framerTextEdits', newEdits);
      } else if (data.type === 'LAYER_CLICKED') {
        setSelectedLayerId(data.id);
      } else if (data.type === 'ADD_SECTION_REQUEST') {
        window.dispatchEvent(new CustomEvent('admin:addSectionRequest', { detail: data }));
      } else if (data.type === 'TOOLBAR_ACTION') {
        window.dispatchEvent(new CustomEvent('admin:toolbarAction', { detail: data }));
      } else if (data.type === 'LAYER_TREE') {
        window.dispatchEvent(new CustomEvent('admin:layerTree', { detail: data.layers }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAdmin, siteContent, updateSiteContent, postToIframe, setSelectedLayerId]);

  const LEFT_W = 280;
  const RIGHT_W = 320;

  return (
    <>
      {/* LEFT PANEL — Pages / Layers / Assets */}
      {isAdmin && <LeftPanel />}

      {/* CENTER — Canvas (iframe) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isAdmin ? LEFT_W : 0,
        right: isAdmin ? RIGHT_W : 0,
        bottom: 0,
        zIndex: 0,
        transition: 'left 0.3s ease, right 0.3s ease',
        background: '#111',
      }}>
        <iframe
          ref={iframeRef}
          src="/framer-editable.html"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Portfolio"
        />
      </div>

      {/* RIGHT PANEL — Properties / Sections / Theme */}
      {isAdmin && <RightPanel postToIframe={postToIframe} />}

      {/* Admin login gear when NOT in admin mode */}
      {!isAdmin && (
        <a
          href="/admin"
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
            padding: '12px', borderRadius: '50%', cursor: 'pointer',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.2s',
          }}
          title="Admin Login"
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </a>
      )}
    </>
  );
}
