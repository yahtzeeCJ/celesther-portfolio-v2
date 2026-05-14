'use client';
import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Type, Box, Video, Link2, Edit2, Search, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FramerLayer } from '@/types/content';

function LayerIcon({ type }: { type: string }) {
  const c = 'w-3.5 h-3.5 shrink-0';
  switch (type) {
    case 'text': return <Type className={`${c} text-cyan-400`} />;
    case 'image': case 'bg-image': return <ImageIcon className={`${c} text-green-400`} />;
    case 'video': return <Video className={`${c} text-purple-400`} />;
    case 'link': return <Link2 className={`${c} text-blue-400`} />;
    case 'button': return <Box className={`${c} text-orange-400`} />;
    case 'input': return <Edit2 className={`${c} text-pink-400`} />;
    default: return <Box className={`${c} text-muted-foreground/50`} />;
  }
}

interface Props {
  layers: FramerLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

export default function LayersTab({ layers, selectedLayerId, setSelectedLayerId, expandedIds, toggleExpand }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

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

  const LayerNode = ({ node, depth = 0 }: { node: FramerLayer; depth?: number }) => {
    const isSel = selectedLayerId === node.id;
    const hasKids = (node.children || []).length > 0;
    const isExp = expandedIds.has(node.id);
    return (
      <div>
        <div
          className={`flex items-center gap-1 py-1 cursor-pointer select-none transition-colors ${isSel ? 'bg-cyan-500/15 text-cyan-300' : 'hover:bg-white/5 text-gray-300'}`}
          style={{ paddingLeft: `${depth * 14 + 8}px`, paddingRight: '8px' }}
          onClick={() => setSelectedLayerId(node.id)}
        >
          {hasKids ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-300 shrink-0">
              {isExp ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-4 shrink-0" />}
          <LayerIcon type={node.type} />
          <span className="text-[11px] truncate flex-1">{node.name}</span>
          {!['frame','element'].includes(node.type) && <span className="text-[9px] text-gray-500 uppercase font-mono shrink-0">{node.type}</span>}
        </div>
        {isExp && hasKids && node.children.map((c, i) => <LayerNode key={`${c.id}-${i}`} node={c} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search layers..." className="h-7 pl-7 text-xs bg-black/30 border-white/10 focus:border-cyan-500 placeholder:text-gray-600" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {filtered.map((n, i) => <LayerNode key={`${n.id}-${i}`} node={n} />)}
        {filtered.length === 0 && <p className="text-center text-xs text-gray-500 py-6">No layers match.</p>}
      </div>
    </div>
  );
}
