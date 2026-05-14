'use client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FramerTheme } from '@/types/content';
import { THEME_PRESETS } from '@/lib/theme-presets';

interface Props {
  theme: FramerTheme;
  onThemeChange: (theme: FramerTheme) => void;
}

export default function ThemeTab({ theme, onThemeChange }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* Presets */}
      <div>
        <Label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mb-2 block">Theme Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map(preset => (
            <button key={preset.id}
              onClick={() => onThemeChange({ primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, preset: preset.id, hueRotate: preset.hueRotate })}
              className={`p-2 rounded-lg border transition-all text-center ${theme.preset === preset.id ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
              <div className="flex justify-center gap-0.5 mb-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
              </div>
              <span className="text-[10px] text-gray-300">{preset.emoji} {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current theme preview */}
      <div>
        <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Current Theme</Label>
        <div className="h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})` }} />
      </div>

      {/* Custom colors */}
      <div className="space-y-3">
        <Label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Custom Colors</Label>
        {[
          { key: 'primaryColor' as const, label: 'Primary', color: theme.primaryColor },
          { key: 'secondaryColor' as const, label: 'Secondary', color: theme.secondaryColor },
          { key: 'accentColor' as const, label: 'Accent', color: theme.accentColor },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => onThemeChange({ ...theme, [key]: e.target.value, preset: 'custom' })} className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent shrink-0" />
            <div className="flex-1">
              <Label className="text-[9px] text-gray-500">{label}</Label>
              <Input value={color} onChange={e => onThemeChange({ ...theme, [key]: e.target.value, preset: 'custom' })} className="h-6 text-[10px] bg-black/30 border-white/10" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-gray-500 italic">Theme colors are applied via CSS variables across the entire site.</p>
    </div>
  );
}
