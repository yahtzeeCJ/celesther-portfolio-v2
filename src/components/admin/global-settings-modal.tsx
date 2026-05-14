'use client';

import { useState } from 'react';
import { X, Palette, PanelTop, TypeIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext';
import type { ThemeSettings } from '@/types/content';

type SettingsTab = 'theme' | 'banners' | 'typography' | 'effects';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'theme', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
  { id: 'banners', label: 'Banners', icon: <PanelTop className="w-4 h-4" /> },
  { id: 'typography', label: 'Typography', icon: <TypeIcon className="w-4 h-4" /> },
  { id: 'effects', label: 'Effects', icon: <Sparkles className="w-4 h-4" /> },
];

const GOOGLE_FONTS = [
  'Poppins', 'Inter', 'Roboto', 'Montserrat', 'Playfair Display',
  'Bebas Neue', 'Space Grotesk', 'IBM Plex Mono', 'Outfit',
  'Bricolage Grotesque', 'Oswald', 'Raleway', 'Lato', 'Open Sans',
  'Nunito', 'Source Sans 3', 'DM Sans', 'Manrope', 'Plus Jakarta Sans',
];

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSettingsModal({ isOpen, onClose }: GlobalSettingsModalProps) {
  const { siteContent, updateSiteContent } = useAdmin();
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  const theme = siteContent.themeSettings;

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    updateSiteContent('themeSettings', { ...theme, ...updates });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[520px] max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Global Settings
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ===== THEME TAB ===== */}
          {activeTab === 'theme' && (
            <>
              {/* Primary Gradient */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Primary Gradient (Buttons/Links)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 1</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.primaryGradient.color1} onChange={e => updateTheme({ primaryGradient: { ...theme.primaryGradient, color1: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.primaryGradient.color1} onChange={e => updateTheme({ primaryGradient: { ...theme.primaryGradient, color1: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 2</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.primaryGradient.color2} onChange={e => updateTheme({ primaryGradient: { ...theme.primaryGradient, color2: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.primaryGradient.color2} onChange={e => updateTheme({ primaryGradient: { ...theme.primaryGradient, color2: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-3 rounded-full" style={{ background: `linear-gradient(to right, ${theme.primaryGradient.color1}, ${theme.primaryGradient.color2})` }} />
              </div>

              {/* Accent Gradient */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-3">Accent Gradient (Highlights)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 1</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.accentGradient.color1} onChange={e => updateTheme({ accentGradient: { ...theme.accentGradient, color1: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.accentGradient.color1} onChange={e => updateTheme({ accentGradient: { ...theme.accentGradient, color1: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 2</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.accentGradient.color2} onChange={e => updateTheme({ accentGradient: { ...theme.accentGradient, color2: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.accentGradient.color2} onChange={e => updateTheme({ accentGradient: { ...theme.accentGradient, color2: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-3 rounded-full" style={{ background: `linear-gradient(to right, ${theme.accentGradient.color1}, ${theme.accentGradient.color2})` }} />
              </div>

              {/* Background Gradient */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Background Gradient</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 1</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.backgroundGradient.color1} onChange={e => updateTheme({ backgroundGradient: { ...theme.backgroundGradient, color1: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.backgroundGradient.color1} onChange={e => updateTheme({ backgroundGradient: { ...theme.backgroundGradient, color1: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Color 2</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.backgroundGradient.color2} onChange={e => updateTheme({ backgroundGradient: { ...theme.backgroundGradient, color2: e.target.value } })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.backgroundGradient.color2} onChange={e => updateTheme({ backgroundGradient: { ...theme.backgroundGradient, color2: e.target.value } })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-3 rounded-full border border-border" style={{ background: `linear-gradient(to right, ${theme.backgroundGradient.color1}, ${theme.backgroundGradient.color2})` }} />
              </div>

              {/* Card Neutral & Main Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">Card Neutral</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="color" value={theme.cardNeutral} onChange={e => updateTheme({ cardNeutral: e.target.value })} className="h-10 w-14 p-0.5 cursor-pointer" />
                    <Input value={theme.cardNeutral} onChange={e => updateTheme({ cardNeutral: e.target.value })} className="h-8 text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">Main Text</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="color" value={theme.mainText} onChange={e => updateTheme({ mainText: e.target.value })} className="h-10 w-14 p-0.5 cursor-pointer" />
                    <Input value={theme.mainText} onChange={e => updateTheme({ mainText: e.target.value })} className="h-8 text-xs font-mono" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== BANNERS TAB ===== */}
          {activeTab === 'banners' && (
            <>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Top/Bottom Banners (Solid)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Top Banner</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.bannerTopColor} onChange={e => updateTheme({ bannerTopColor: e.target.value })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.bannerTopColor} onChange={e => updateTheme({ bannerTopColor: e.target.value })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bottom Banner</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="color" value={theme.bannerBottomColor} onChange={e => updateTheme({ bannerBottomColor: e.target.value })} className="h-10 w-14 p-0.5 cursor-pointer" />
                      <Input value={theme.bannerBottomColor} onChange={e => updateTheme({ bannerBottomColor: e.target.value })} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Card Background</h3>
                <div className="flex items-center gap-2">
                  <Input type="color" value={theme.cardBackground} onChange={e => updateTheme({ cardBackground: e.target.value })} className="h-10 w-14 p-0.5 cursor-pointer" />
                  <Input value={theme.cardBackground} onChange={e => updateTheme({ cardBackground: e.target.value })} className="h-8 text-xs font-mono flex-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider">Card Opacity ({(theme.cardOpacity * 100).toFixed(0)}%)</Label>
                <input type="range" min={0} max={1} step={0.05} value={theme.cardOpacity} onChange={e => updateTheme({ cardOpacity: Number(e.target.value) })} className="w-full mt-2 accent-cyan-400" />
              </div>
            </>
          )}

          {/* ===== TYPOGRAPHY TAB ===== */}
          {activeTab === 'typography' && (
            <>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Headline Font</h3>
                <select value={theme.headlineFont} onChange={e => updateTheme({ headlineFont: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="mt-2 text-lg" style={{ fontFamily: theme.headlineFont }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Body Font</h3>
                <select value={theme.bodyFont} onChange={e => updateTheme({ bodyFont: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="mt-2 text-sm" style={{ fontFamily: theme.bodyFont }}>
                  The quick brown fox jumps over the lazy dog. 0123456789
                </p>
              </div>
            </>
          )}

          {/* ===== EFFECTS TAB ===== */}
          {activeTab === 'effects' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Visual effects and animation settings for the site. More effects coming soon.</p>
              <div className="p-4 rounded-lg border border-border bg-background/50 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400 opacity-50" />
                <p className="text-sm text-muted-foreground">WebGL loader, particle effects, and scroll animations will be configurable here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
