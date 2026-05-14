'use client';

import { useState, useEffect, useCallback } from 'react';
import { Edit2, Layout, Palette, Save, LogOut, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { FramerLayer, FramerTextStyle, FramerSectionBackground, FramerSectionGradient, FramerTheme, FramerCustomSection } from '@/types/content';
import PropertiesTab from './tabs/properties-tab';
import SectionsTab from './tabs/sections-tab';
import ThemeTab from './tabs/theme-tab';

interface RightPanelProps {
  postToIframe: (msg: Record<string, unknown>) => void;
}

const TABS = [
  { id: 'properties', label: 'Design', Icon: Edit2 },
  { id: 'sections', label: 'Sections', Icon: Layout },
  { id: 'theme', label: 'Theme', Icon: Palette },
] as const;

type TabId = typeof TABS[number]['id'];

export default function RightPanel({ postToIframe }: RightPanelProps) {
  const { isAdmin, selectedLayerId, setSelectedLayerId, siteContent, updateSiteContent, saveChanges, logout, undo, redo, canUndo, canRedo } = useAdmin();
  const [layers, setLayers] = useState<FramerLayer[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('properties');
  const [saving, setSaving] = useState(false);

  // Load layer tree
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (Array.isArray(detail)) setLayers(detail);
    };
    window.addEventListener('admin:layerTree', handler);
    fetch('/framer-layers.json').then(r => r.json()).then(d => { if (layers.length === 0) setLayers(d); }).catch(() => {});
    return () => window.removeEventListener('admin:layerTree', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-switch to properties when a layer is selected
  useEffect(() => {
    if (selectedLayerId) setActiveTab('properties');
  }, [selectedLayerId]);

  // Listen for add-section / toolbar requests
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.afterId) {
        handleAddSection(detail.afterId);
        setActiveTab('sections');
      }
    };
    const toolbarHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.id) return;
      const { action, id } = detail;
      if (action === 'visibility') {
        const hidden = siteContent.framerHiddenSections || [];
        const isHidden = hidden.includes(id);
        if (isHidden) {
          updateSiteContent('framerHiddenSections', hidden.filter((s: string) => s !== id));
          postToIframe({ type: 'SHOW_SECTION', sectionId: id });
        } else {
          updateSiteContent('framerHiddenSections', [...hidden, id]);
          postToIframe({ type: 'HIDE_SECTION', sectionId: id });
        }
      } else if (action === 'delete') {
        const isCustom = (siteContent.framerCustomSections || []).some((s: { id: string }) => s.id === id);
        if (isCustom) {
          handleDeleteSection(id);
        } else {
          const hidden = siteContent.framerHiddenSections || [];
          if (!hidden.includes(id)) {
            updateSiteContent('framerHiddenSections', [...hidden, id]);
            postToIframe({ type: 'HIDE_SECTION', sectionId: id });
          }
        }
      }
    };
    window.addEventListener('admin:addSectionRequest', handler);
    window.addEventListener('admin:toolbarAction', toolbarHandler);
    return () => {
      window.removeEventListener('admin:addSectionRequest', handler);
      window.removeEventListener('admin:toolbarAction', toolbarHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteContent, postToIframe]);

  // Find selected layer
  const findLayer = useCallback((nodes: FramerLayer[], id: string): FramerLayer | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const f = findLayer(n.children || [], id);
      if (f) return f;
    }
    return null;
  }, []);

  const selectedLayer = selectedLayerId ? findLayer(layers, selectedLayerId) : null;
  const currentTextEdit = selectedLayerId ? (siteContent.framerTextEdits?.[selectedLayerId] || '') : '';
  const currentEdits = selectedLayerId ? (siteContent.framerEdits?.[selectedLayerId] || {}) : {};
  const currentTextStyle: FramerTextStyle = selectedLayerId ? (siteContent.framerTextStyles?.[selectedLayerId] || {}) : {};

  const topSections = layers.filter(l => l.name && !['SVG', 'Light'].includes(l.name));

  // --- Edit handlers ---
  const handleTextEdit = (val: string) => {
    if (!selectedLayerId) return;
    const edits = { ...(siteContent.framerTextEdits || {}), [selectedLayerId]: val };
    updateSiteContent('framerTextEdits', edits);
    postToIframe({ type: 'APPLY_EDIT', id: selectedLayerId, prop: 'textContent', value: val });
  };

  const handlePropertyEdit = (prop: string, val: string) => {
    if (!selectedLayerId) return;
    const layerEdits = { ...(siteContent.framerEdits?.[selectedLayerId] || {}), [prop]: val };
    updateSiteContent('framerEdits', { ...(siteContent.framerEdits || {}), [selectedLayerId]: layerEdits });
    postToIframe({ type: 'APPLY_EDIT', id: selectedLayerId, prop, value: val });
  };

  const handleTextStyleChange = (partial: Partial<FramerTextStyle>) => {
    if (!selectedLayerId) return;
    const merged = { ...currentTextStyle, ...partial };
    updateSiteContent('framerTextStyles', { ...(siteContent.framerTextStyles || {}), [selectedLayerId]: merged });
    postToIframe({ type: 'APPLY_TEXT_STYLE', id: selectedLayerId, styles: merged });
  };

  const handleUpdateBackground = (sectionId: string, bg: FramerSectionBackground) => {
    updateSiteContent('framerSectionBackgrounds', { ...(siteContent.framerSectionBackgrounds || {}), [sectionId]: bg });
    postToIframe({ type: 'APPLY_SECTION_BG', sectionId, bg });
  };

  const handleUpdateGradient = (sectionId: string, grad: FramerSectionGradient) => {
    updateSiteContent('framerSectionGradients', { ...(siteContent.framerSectionGradients || {}), [sectionId]: grad });
    postToIframe({ type: 'APPLY_SECTION_GRADIENT', sectionId, gradient: grad });
  };

  const handleToggleSection = (sectionId: string, currentlyHidden: boolean) => {
    const hidden = [...(siteContent.framerHiddenSections || [])];
    if (currentlyHidden) {
      const idx = hidden.indexOf(sectionId);
      if (idx >= 0) hidden.splice(idx, 1);
      postToIframe({ type: 'SHOW_SECTION', sectionId });
    } else {
      hidden.push(sectionId);
      postToIframe({ type: 'HIDE_SECTION', sectionId });
    }
    updateSiteContent('framerHiddenSections', hidden);
  };

  const handleAddSection = (afterId: string) => {
    const id = `custom-${Date.now()}`;
    const newSec: FramerCustomSection = { id, name: `New Section`, insertAfter: afterId, height: 400, backgroundColor: '#0a0a1a', content: '<div style="text-align:center;padding:60px;color:#888;font-size:14px">New Section — Edit me!</div>', visible: true };
    const arr = [...(siteContent.framerCustomSections || []), newSec];
    updateSiteContent('framerCustomSections', arr);
    postToIframe({ type: 'INSERT_CUSTOM_SECTION', section: newSec });
  };

  const handleDeleteSection = (sectionId: string) => {
    const arr = (siteContent.framerCustomSections || []).filter(s => s.id !== sectionId);
    updateSiteContent('framerCustomSections', arr);
    postToIframe({ type: 'DELETE_CUSTOM_SECTION', sectionId });
  };

  const handleThemeChange = (theme: FramerTheme) => {
    updateSiteContent('framerTheme', theme);
    postToIframe({ type: 'APPLY_THEME', theme });
  };

  const handleSave = async () => {
    setSaving(true);
    try { await saveChanges(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 flex flex-col bg-[#1e1e1e] border-l border-[#333] z-[200] select-none" style={{ width: 320, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333] bg-[#252525]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="h-7 w-7 text-gray-400 hover:text-white" title="Undo (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="h-7 w-7 text-gray-400 hover:text-white" title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving} className="h-7 px-2.5 text-[11px] text-green-400 hover:bg-green-500/10 font-medium">
            <Save className="w-3.5 h-3.5 mr-1" />{saving ? '...' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="h-7 px-2.5 text-[11px] text-red-400 hover:bg-red-500/10">
            <LogOut className="w-3.5 h-3.5 mr-1" />Exit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#252525]">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium tracking-wide transition-colors
              ${activeTab === tab.id ? 'text-white border-b-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'properties' && (
          <PropertiesTab selectedLayer={selectedLayer} selectedLayerId={selectedLayerId} currentTextEdit={currentTextEdit} currentEdits={currentEdits} currentTextStyle={currentTextStyle} onTextEdit={handleTextEdit} onPropertyEdit={handlePropertyEdit} onTextStyleChange={handleTextStyleChange} />
        )}
        {activeTab === 'sections' && (
          <SectionsTab sections={topSections} sectionBackgrounds={siteContent.framerSectionBackgrounds || {}} sectionGradients={siteContent.framerSectionGradients || {}} customSections={siteContent.framerCustomSections || []} hiddenSections={siteContent.framerHiddenSections || []} onUpdateBackground={handleUpdateBackground} onUpdateGradient={handleUpdateGradient} onToggleSection={handleToggleSection} onAddSection={handleAddSection} onDeleteSection={handleDeleteSection} />
        )}
        {activeTab === 'theme' && (
          <ThemeTab theme={siteContent.framerTheme || { primaryColor: '#0ea5e9', secondaryColor: '#06b6d4', accentColor: '#0891b2', preset: 'ocean' }} onThemeChange={handleThemeChange} />
        )}
      </div>
    </div>
  );
}
