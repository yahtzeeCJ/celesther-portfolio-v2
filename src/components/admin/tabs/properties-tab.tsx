'use client';
import { Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FramerLayer, FramerTextStyle } from '@/types/content';
import { TEXT_ANIMATIONS } from '@/lib/text-animations';
import { PREMIUM_FONTS } from '@/lib/fonts';

interface Props {
  selectedLayer: FramerLayer | null;
  selectedLayerId: string | null;
  currentTextEdit: string;
  currentEdits: Record<string, string>;
  currentTextStyle: FramerTextStyle;
  onTextEdit: (val: string) => void;
  onPropertyEdit: (prop: string, val: string) => void;
  onTextStyleChange: (style: Partial<FramerTextStyle>) => void;
}

export default function PropertiesTab({ selectedLayer, selectedLayerId, currentTextEdit, currentEdits, currentTextStyle, onTextEdit, onPropertyEdit, onTextStyleChange }: Props) {
  if (!selectedLayer) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <p className="text-[11px] text-gray-500 text-center">Select a layer to edit its properties.</p>
    </div>
  );

  const fontsByCategory = {
    sans: PREMIUM_FONTS.filter(f => f.category === 'sans'),
    display: PREMIUM_FONTS.filter(f => f.category === 'display'),
    serif: PREMIUM_FONTS.filter(f => f.category === 'serif'),
    mono: PREMIUM_FONTS.filter(f => f.category === 'mono'),
  };

  const animsByCategory = {
    in: TEXT_ANIMATIONS.filter(a => a.category === 'in'),
    out: TEXT_ANIMATIONS.filter(a => a.category === 'out'),
    combo: TEXT_ANIMATIONS.filter(a => a.category === 'combo'),
  };

  const selectedFont = PREMIUM_FONTS.find(f => f.name === currentTextStyle.fontFamily);

  // Common input styles
  const inputCls = "h-7 text-[11px] bg-[#2a2a2a] border-[#444] focus:border-blue-500 text-gray-200 rounded";
  const selectCls = "w-full h-7 text-[11px] rounded border border-[#444] bg-[#2a2a2a] px-2 text-gray-300 focus:border-blue-500 outline-none";
  const labelCls = "text-[10px] text-gray-400 uppercase tracking-wider font-medium";
  const sectionLabelCls = "text-[10px] text-blue-400 uppercase tracking-wider font-semibold";

  return (
    <div className="p-3 space-y-3 overflow-y-auto flex-1">
      {/* Layer info */}
      <div className="pb-2 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-white truncate">{selectedLayer.name}</span>
        </div>
        <span className="text-[9px] font-mono text-gray-500">{selectedLayer.type} • {selectedLayer.tag} • {selectedLayer.id}</span>
      </div>

      {/* TEXT */}
      {selectedLayer.type === 'text' && (
        <>
          <div className="space-y-1.5">
            <Label className={sectionLabelCls}>Text Content</Label>
            <Textarea value={currentTextEdit} onChange={(e) => onTextEdit(e.target.value)} placeholder={selectedLayer.textContent || 'Enter text...'} rows={3} className={`text-[11px] bg-[#2a2a2a] border-[#444] resize-none focus:border-blue-500`} />
          </div>
          {/* Font Family */}
          <div className="space-y-1">
            <Label className={labelCls}>Font Family</Label>
            <select value={currentTextStyle.fontFamily || ''} onChange={e => onTextStyleChange({ fontFamily: e.target.value })} className={selectCls}>
              <option value="">Default</option>
              {Object.entries(fontsByCategory).map(([cat, fonts]) => (
                <optgroup key={cat} label={cat.toUpperCase()}>
                  {fonts.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {/* Font Size + Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className={labelCls}>Size (px)</Label>
              <Input type="number" value={currentTextStyle.fontSize || ''} onChange={e => onTextStyleChange({ fontSize: parseInt(e.target.value) || undefined })} placeholder="Auto" className={inputCls} />
            </div>
            <div>
              <Label className={labelCls}>Weight</Label>
              <select value={currentTextStyle.fontWeight || ''} onChange={e => onTextStyleChange({ fontWeight: e.target.value })} className={selectCls}>
                <option value="">Default</option>
                {(selectedFont?.weights || [300,400,500,600,700,800,900]).map(w => <option key={w} value={String(w)}>{w}</option>)}
              </select>
            </div>
          </div>
          {/* Color */}
          <div className="space-y-1">
            <Label className={labelCls}>Text Color</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={currentTextStyle.color || '#ffffff'} onChange={e => onTextStyleChange({ color: e.target.value })} className="w-7 h-7 rounded border border-[#444] cursor-pointer bg-transparent" />
              <Input value={currentTextStyle.color || ''} onChange={e => onTextStyleChange({ color: e.target.value })} placeholder="#ffffff" className={`flex-1 ${inputCls}`} />
            </div>
          </div>
          {/* Animation */}
          <div className="space-y-1">
            <Label className={sectionLabelCls}>Animation</Label>
            <select value={currentTextStyle.animation || 'none'} onChange={e => onTextStyleChange({ animation: e.target.value })} className={selectCls}>
              <option value="none">None</option>
              {Object.entries(animsByCategory).map(([cat, anims]) => (
                <optgroup key={cat} label={cat === 'in' ? '🟢 Entrance' : cat === 'out' ? '🔴 Exit' : '⚡ Combo'}>
                  {anims.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className={labelCls}>Duration (s)</Label>
              <Input type="number" step="0.1" value={currentTextStyle.animationDuration ?? 0.6} onChange={e => onTextStyleChange({ animationDuration: parseFloat(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <Label className={labelCls}>Delay (s)</Label>
              <Input type="number" step="0.1" value={currentTextStyle.animationDelay ?? 0} onChange={e => onTextStyleChange({ animationDelay: parseFloat(e.target.value) })} className={inputCls} />
            </div>
          </div>
        </>
      )}

      {/* IMAGE */}
      {(selectedLayer.type === 'image' || selectedLayer.type === 'bg-image') && (
        <div className="space-y-2">
          <Label className={sectionLabelCls}>Image Source</Label>
          <Input value={currentEdits.src || currentEdits.bgImageUrl || ''} onChange={e => onPropertyEdit(selectedLayer.type === 'image' ? 'src' : 'bgImageUrl', e.target.value)} placeholder={selectedLayer.src || selectedLayer.bgImageUrl || 'https://...'} className={inputCls} />
          {selectedLayer.type === 'image' && (
            <>
              <Label className={labelCls}>Alt Text</Label>
              <Input value={currentEdits.alt || ''} onChange={e => onPropertyEdit('alt', e.target.value)} placeholder={selectedLayer.alt || 'Describe...'} className={inputCls} />
            </>
          )}
        </div>
      )}

      {/* VIDEO */}
      {selectedLayer.type === 'video' && (
        <div className="space-y-2">
          <Label className={sectionLabelCls}>Video Source</Label>
          <Input value={currentEdits.src || ''} onChange={e => onPropertyEdit('src', e.target.value)} placeholder={selectedLayer.src || 'https://...'} className={inputCls} />
        </div>
      )}

      {/* LINK */}
      {selectedLayer.type === 'link' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={sectionLabelCls}>Button / Link Label</Label>
            <Input value={currentTextEdit} onChange={e => onTextEdit(e.target.value)} placeholder={selectedLayer.textContent || 'Link text...'} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={sectionLabelCls}>Link URL</Label>
            <Input value={currentEdits.href || ''} onChange={e => onPropertyEdit('href', e.target.value)} placeholder={selectedLayer.href || 'https://...'} className={inputCls} />
          </div>
          <div className="flex items-center gap-2">
            <Label className={labelCls}>Open In:</Label>
            <select value={currentEdits.target || selectedLayer.target || '_self'} onChange={e => onPropertyEdit('target', e.target.value)} className={`flex-1 ${selectCls}`}>
              <option value="_self">Same Window (_self)</option>
              <option value="_blank">New Tab (_blank)</option>
            </select>
          </div>
        </div>
      )}

      {/* BUTTON */}
      {selectedLayer.type === 'button' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={sectionLabelCls}>Button Text</Label>
            <Input value={currentTextEdit} onChange={e => onTextEdit(e.target.value)} placeholder={selectedLayer.textContent || 'Label...'} className={inputCls} />
          </div>
        </div>
      )}

      {/* INPUT */}
      {selectedLayer.type === 'input' && (
        <div className="space-y-2">
          <Label className={sectionLabelCls}>Placeholder</Label>
          <Input value={currentEdits.placeholder || ''} onChange={e => onPropertyEdit('placeholder', e.target.value)} placeholder={selectedLayer.placeholder || 'Text...'} className={inputCls} />
        </div>
      )}

      {/* GALLERY / TICKER */}
      {selectedLayer.type === 'gallery' && (
        <div className="space-y-2 pt-2 border-t border-[#333]">
          <Label className="text-[10px] text-yellow-400 uppercase font-semibold flex justify-between items-center">
            Logo / Gallery Images
            <button onClick={() => {
              const url = prompt('Enter new image URL:');
              if (url) window.parent.postMessage({ type: 'ADD_TICKER_IMAGE', id: selectedLayerId, url }, '*');
            }} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/40 text-[10px]">+ Add</button>
          </Label>
          <div className="space-y-1">
            {(selectedLayer.children || []).reduce((acc: any[], child: any) => {
              if (child.type === 'image') acc.push(child);
              else if (child.children) acc.push(...child.children.filter((c: any) => c.type === 'image'));
              return acc;
            }, []).map((child: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-1.5 bg-[#2a2a2a] rounded border border-[#333]">
                <div className="w-6 h-6 bg-[#333] rounded flex-shrink-0" style={{ backgroundImage: `url(${child.src || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <span className="text-[9px] text-gray-400 truncate flex-1">{child.src || child.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISIBILITY (all types) */}
      <div className="pt-2 border-t border-[#333] flex items-center justify-between">
        <Label className={labelCls}>Visibility</Label>
        <button onClick={() => onPropertyEdit('visibility', currentEdits.visibility === 'hidden' ? 'visible' : 'hidden')}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${currentEdits.visibility === 'hidden' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {currentEdits.visibility === 'hidden' ? <><EyeOff className="w-3 h-3" /> Hidden</> : <><Eye className="w-3 h-3" /> Visible</>}
        </button>
      </div>

      {['frame','element'].includes(selectedLayer.type) && (
        <p className="text-[10px] text-gray-500 italic">Structural layer. Select a child to edit content.</p>
      )}
    </div>
  );
}
