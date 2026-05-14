'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Layers, Image as ImageIcon, Search, ChevronDown, ChevronRight, Type, Box, Video, Link2, Edit2, Home, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import { FramerLayer } from '@/types/content';

// ============ PAGES DATA (matches your Framer project) ============
const PAGES = [
  { id: 'home', name: 'Home', icon: Home, path: '/' },
  { id: 'about', name: '/about', icon: FileText, path: '/about' },
  { id: 'portfolio', name: '/portfolio', icon: FileText, path: '/portfolio' },
  { id: 'contact', name: '/contact', icon: FileText, path: '/contact' },
  { id: '404', name: '/404', icon: FileText, path: '/404' },
];

// ============ LAYER ICON ============
function LayerIcon({ type }: { type: string }) {
  const c = 'w-3.5 h-3.5 shrink-0';
  switch (type) {
    case 'text': return <Type className={`${c} text-purple-400`} />;
    case 'image': case 'bg-image': return <ImageIcon className={`${c} text-green-400`} />;
    case 'video': return <Video className={`${c} text-pink-400`} />;
    case 'link': return <Link2 className={`${c} text-blue-400`} />;
    case 'button': return <Box className={`${c} text-orange-400`} />;
    case 'input': return <Edit2 className={`${c} text-rose-400`} />;
    case 'icon': return <Globe className={`${c} text-gray-400`} />;
    default: return <Box className={`${c} text-gray-500`} />;
  }
}

// ============ LEFT PANEL TABS ============
type LeftTab = 'pages' | 'layers' | 'assets';

export default function LeftPanel() {
  const { selectedLayerId, setSelectedLayerId } = useAdmin();
  const [activeTab, setActiveTab] = useState<LeftTab>('layers');
  const [layers, setLayers] = useState<FramerLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activePage, setActivePage] = useState('home');

  // Load layers from JSON + listen for dynamic updates
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (Array.isArray(detail)) { setLayers(detail); setLoading(false); }
    };
    window.addEventListener('admin:layerTree', handler);
    fetch('/framer-layers.json').then(r => r.json()).then(d => {
      if (layers.length === 0) { setLayers(d); setLoading(false); }
    }).catch(() => {});
    return () => window.removeEventListener('admin:layerTree', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand parent chain when a layer is selected
  useEffect(() => {
    const findPath = (nodes: FramerLayer[], targetId: string, path: string[] = []): string[] | null => {
      for (const n of nodes) {
        if (n.id === targetId) return [...path, n.id];
        const found = findPath(n.children || [], targetId, [...path, n.id]);
        if (found) return found;
      }
      return null;
    };
    if (selectedLayerId && layers.length > 0) {
      const path = findPath(layers, selectedLayerId);
      if (path) {
        setExpandedIds(prev => {
          const next = new Set(prev);
          path.forEach(id => next.add(id));
          return next;
        });
        setActiveTab('layers');
      }
    }
  }, [selectedLayerId, layers]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Filter layers by search
  const filterLayers = useCallback((nodes: FramerLayer[], q: string): FramerLayer[] => {
    if (!q) return nodes;
    const ql = q.toLowerCase();
    return nodes.reduce<FramerLayer[]>((acc, node) => {
      const match = node.name.toLowerCase().includes(ql) || node.type.includes(ql) || (node.textContent || '').toLowerCase().includes(ql);
      const kids = filterLayers(node.children || [], q);
      if (match || kids.length > 0) acc.push({ ...node, children: kids.length > 0 ? kids : (match ? node.children : []) });
      return acc;
    }, []);
  }, []);

  const filtered = useMemo(() => filterLayers(layers, searchQuery), [layers, searchQuery, filterLayers]);

  // Extract images from layers for Assets tab
  const allImages = useMemo(() => {
    const imgs: { id: string; src: string; name: string }[] = [];
    const walk = (nodes: FramerLayer[]) => {
      for (const n of nodes) {
        if ((n.type === 'image' || n.type === 'bg-image') && (n.src || n.bgImageUrl)) {
          imgs.push({ id: n.id, src: (n.src || n.bgImageUrl || ''), name: n.name || n.alt || 'Image' });
        }
        if (n.children) walk(n.children);
      }
    };
    walk(layers);
    return imgs;
  }, [layers]);

  // ============ LAYER NODE RENDER ============
  const LayerNode = ({ node, depth = 0 }: { node: FramerLayer; depth?: number }) => {
    const isSel = selectedLayerId === node.id;
    const hasKids = (node.children || []).length > 0;
    const isExp = expandedIds.has(node.id);
    return (
      <div>
        <div
          className={`flex items-center gap-1 py-[3px] cursor-pointer select-none transition-all duration-100
            ${isSel ? 'bg-blue-500/20 text-white' : 'hover:bg-white/[0.04] text-gray-400 hover:text-gray-200'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: '8px' }}
          onClick={() => setSelectedLayerId(node.id)}
        >
          {hasKids ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-300 shrink-0">
              {isExp ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-4 shrink-0" />}
          <LayerIcon type={node.type} />
          <span className="text-[11px] truncate flex-1">{node.name}</span>
        </div>
        {isExp && hasKids && node.children!.map((c, i) => <LayerNode key={`${c.id}-${i}`} node={c} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 flex flex-col bg-[#1e1e1e] border-r border-[#333] z-[200] select-none" style={{ width: 280, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Tabs: Pages | Layers | Assets */}
      <div className="flex border-b border-[#333] bg-[#252525]">
        {([
          { id: 'pages' as LeftTab, label: 'Pages' },
          { id: 'layers' as LeftTab, label: 'Layers' },
          { id: 'assets' as LeftTab, label: 'Assets' },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium tracking-wide transition-colors
              ${activeTab === tab.id ? 'text-white border-b-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* ============ PAGES TAB ============ */}
        {activeTab === 'pages' && (
          <div className="flex-1 flex flex-col">
            {/* Design header */}
            <div className="px-3 py-2 border-b border-[#333]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Design</span>
                <span className="text-[10px] text-gray-600">+</span>
              </div>
            </div>
            {/* Pages list */}
            <div className="px-1 py-1">
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
              </div>
              {PAGES.map(page => (
                <button key={page.id} onClick={() => setActivePage(page.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-colors
                    ${activePage === page.id ? 'bg-blue-500/20 text-white' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'}`}>
                  <page.icon className="w-3.5 h-3.5 shrink-0" />
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============ LAYERS TAB ============ */}
        {activeTab === 'layers' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="px-2 py-2 border-b border-[#333]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-7 pl-7 text-[11px] bg-[#2a2a2a] border-[#444] focus:border-blue-500 placeholder:text-gray-600 rounded" />
              </div>
            </div>
            {/* Layer tree */}
            <div className="flex-1 overflow-y-auto pb-4">
              {loading ? (
                <div className="p-4 text-center text-xs text-gray-600 animate-pulse">Loading layers...</div>
              ) : (
                <>
                  {filtered.map((n, i) => <LayerNode key={`${n.id}-${i}`} node={n} />)}
                  {filtered.length === 0 && <p className="text-center text-xs text-gray-600 py-6">No layers match.</p>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ ASSETS TAB ============ */}
        {activeTab === 'assets' && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="px-1 py-1.5 mb-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Images ({allImages.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {allImages.slice(0, 60).map((img, i) => (
                <button key={i} onClick={() => setSelectedLayerId(img.id)}
                  className={`aspect-square rounded overflow-hidden border transition-all
                    ${selectedLayerId === img.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[#333] hover:border-gray-500'}`}>
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </button>
              ))}
            </div>
            {allImages.length === 0 && <p className="text-center text-xs text-gray-600 py-6">No image assets found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
