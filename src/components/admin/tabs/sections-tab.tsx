'use client';
import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2, Image as ImageIcon, Video, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FramerLayer, FramerSectionBackground, FramerSectionGradient, FramerCustomSection } from '@/types/content';
import { BG_ANIMATIONS } from '@/lib/text-animations';

interface Props {
  sections: FramerLayer[];
  sectionBackgrounds: Record<string, FramerSectionBackground>;
  sectionGradients: Record<string, FramerSectionGradient>;
  customSections: FramerCustomSection[];
  hiddenSections: string[];
  onUpdateBackground: (sectionId: string, bg: FramerSectionBackground) => void;
  onUpdateGradient: (sectionId: string, grad: FramerSectionGradient) => void;
  onToggleSection: (sectionId: string, visible: boolean) => void;
  onAddSection: (afterId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

export default function SectionsTab({ sections, sectionBackgrounds, sectionGradients, customSections, hiddenSections, onUpdateBackground, onUpdateGradient, onToggleSection, onAddSection, onDeleteSection }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const allSections = [
    ...sections.filter(s => s.name && !['SVG','Light'].includes(s.name)),
    ...customSections.map(cs => ({ id: cs.id, name: cs.name, type: 'frame' as const, tag: 'SECTION', children: [], isCustom: true }))
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {allSections.map(sec => {
        const isExpanded = expandedSection === sec.id;
        const isHidden = hiddenSections.includes(sec.id);
        const bg = sectionBackgrounds[sec.id] || { type: 'none' as const };
        const grad = sectionGradients[sec.id] || { enabled: false, color1: '#000000', color2: '#1a1a2e', direction: 'to bottom', type: 'linear' as const, opacity: 0.5 };
        const isCustom = 'isCustom' in sec;

        return (
          <div key={sec.id} className="border border-white/10 rounded-lg overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-pointer" onClick={() => setExpandedSection(isExpanded ? null : sec.id)}>
              <span className="text-xs font-medium text-gray-200">{sec.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); onToggleSection(sec.id, isHidden); }}
                  className={`p-1 rounded ${isHidden ? 'text-red-400' : 'text-green-400'}`}>
                  {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                {isCustom && (
                  <button onClick={e => { e.stopPropagation(); onDeleteSection(sec.id); }} className="p-1 rounded text-red-400 hover:bg-red-500/20">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="p-3 space-y-3 border-t border-white/10">
                {/* BACKGROUND */}
                <div>
                  <Label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Background</Label>
                  <select value={bg.type} onChange={e => onUpdateBackground(sec.id, { ...bg, type: e.target.value as FramerSectionBackground['type'] })}
                    className="w-full h-7 text-xs rounded border border-white/10 bg-black/30 px-2 text-gray-300 mt-1">
                    <option value="none">None</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="code">HTML/CSS Code</option>
                  </select>

                  {bg.type === 'image' && (
                    <div className="mt-2 space-y-2">
                      <Input value={bg.url || ''} onChange={e => onUpdateBackground(sec.id, { ...bg, url: e.target.value })} placeholder="Image URL..." className="h-7 text-xs bg-black/30 border-white/10" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] text-gray-500">Opacity</Label>
                          <input type="range" min="0" max="1" step="0.05" value={bg.opacity ?? 0.5} onChange={e => onUpdateBackground(sec.id, { ...bg, opacity: parseFloat(e.target.value) })} className="w-full h-1 accent-cyan-500" />
                        </div>
                        <div>
                          <Label className="text-[9px] text-gray-500">Blur (px)</Label>
                          <input type="range" min="0" max="20" step="1" value={bg.blur ?? 0} onChange={e => onUpdateBackground(sec.id, { ...bg, blur: parseInt(e.target.value) })} className="w-full h-1 accent-cyan-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {bg.type === 'video' && (
                    <div className="mt-2 space-y-2">
                      <Input value={bg.url || ''} onChange={e => onUpdateBackground(sec.id, { ...bg, url: e.target.value })} placeholder="Video URL..." className="h-7 text-xs bg-black/30 border-white/10" />
                      <div>
                        <Label className="text-[9px] text-gray-500">Opacity</Label>
                        <input type="range" min="0" max="1" step="0.05" value={bg.opacity ?? 0.5} onChange={e => onUpdateBackground(sec.id, { ...bg, opacity: parseFloat(e.target.value) })} className="w-full h-1 accent-cyan-500" />
                      </div>
                    </div>
                  )}

                  {bg.type === 'code' && (
                    <div className="mt-2">
                      <Textarea value={bg.code || ''} onChange={e => onUpdateBackground(sec.id, { ...bg, code: e.target.value })} placeholder="Paste HTML/CSS..." rows={4} className="text-xs bg-black/30 border-white/10 resize-none font-mono" />
                    </div>
                  )}

                  {bg.type !== 'none' && (
                    <div className="mt-2">
                      <Label className="text-[9px] text-gray-500">Animation</Label>
                      <select value={bg.animation || 'none'} onChange={e => onUpdateBackground(sec.id, { ...bg, animation: e.target.value })}
                        className="w-full h-7 text-xs rounded border border-white/10 bg-black/30 px-2 text-gray-300">
                        {BG_ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* GRADIENT */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Gradient Overlay</Label>
                    <button onClick={() => onUpdateGradient(sec.id, { ...grad, enabled: !grad.enabled })}
                      className={`text-[9px] px-2 py-0.5 rounded ${grad.enabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-400'}`}>
                      {grad.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {grad.enabled && (
                    <div className="mt-2 space-y-2">
                      <div className="h-6 rounded" style={{ background: grad.type === 'radial' ? `radial-gradient(circle, ${grad.color1}, ${grad.color2}${grad.color3 ? ', ' + grad.color3 : ''})` : `linear-gradient(${grad.direction}, ${grad.color1}, ${grad.color2}${grad.color3 ? ', ' + grad.color3 : ''})` }} />
                      <div className="grid grid-cols-3 gap-1">
                        <div>
                          <Label className="text-[9px] text-gray-500">Color 1</Label>
                          <input type="color" value={grad.color1} onChange={e => onUpdateGradient(sec.id, { ...grad, color1: e.target.value })} className="w-full h-6 rounded border border-white/10 cursor-pointer bg-transparent" />
                        </div>
                        <div>
                          <Label className="text-[9px] text-gray-500">Color 2</Label>
                          <input type="color" value={grad.color2} onChange={e => onUpdateGradient(sec.id, { ...grad, color2: e.target.value })} className="w-full h-6 rounded border border-white/10 cursor-pointer bg-transparent" />
                        </div>
                        <div>
                          <Label className="text-[9px] text-gray-500">Color 3</Label>
                          <input type="color" value={grad.color3 || '#000000'} onChange={e => onUpdateGradient(sec.id, { ...grad, color3: e.target.value })} className="w-full h-6 rounded border border-white/10 cursor-pointer bg-transparent" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] text-gray-500">Type</Label>
                          <select value={grad.type} onChange={e => onUpdateGradient(sec.id, { ...grad, type: e.target.value as 'linear' | 'radial' })} className="w-full h-6 text-[10px] rounded border border-white/10 bg-black/30 px-1 text-gray-300">
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-[9px] text-gray-500">Direction</Label>
                          <select value={grad.direction} onChange={e => onUpdateGradient(sec.id, { ...grad, direction: e.target.value })} className="w-full h-6 text-[10px] rounded border border-white/10 bg-black/30 px-1 text-gray-300">
                            <option value="to bottom">↓ Top to Bottom</option>
                            <option value="to right">→ Left to Right</option>
                            <option value="to bottom right">↘ Diagonal</option>
                            <option value="135deg">135°</option>
                            <option value="180deg">180°</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Opacity: {(grad.opacity * 100).toFixed(0)}%</Label>
                        <input type="range" min="0" max="1" step="0.05" value={grad.opacity} onChange={e => onUpdateGradient(sec.id, { ...grad, opacity: parseFloat(e.target.value) })} className="w-full h-1 accent-cyan-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* ADD SECTION AFTER THIS */}
                <button onClick={() => onAddSection(sec.id)} className="w-full flex items-center justify-center gap-1 py-1.5 rounded border border-dashed border-white/20 text-[10px] text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors">
                  <Plus className="w-3 h-3" /> Add section after this
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
