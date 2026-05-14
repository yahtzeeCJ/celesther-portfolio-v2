export interface FontOption {
  name: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
  weights: number[];
}

export const PREMIUM_FONTS: FontOption[] = [
  // Sans-serif
  { name: 'Inter', category: 'sans', weights: [300,400,500,600,700,800,900] },
  { name: 'Poppins', category: 'sans', weights: [300,400,500,600,700,800,900] },
  { name: 'Roboto', category: 'sans', weights: [300,400,500,700,900] },
  { name: 'Montserrat', category: 'sans', weights: [300,400,500,600,700,800,900] },
  { name: 'DM Sans', category: 'sans', weights: [400,500,700] },
  { name: 'Outfit', category: 'sans', weights: [300,400,500,600,700,800] },
  { name: 'Sora', category: 'sans', weights: [300,400,500,600,700,800] },
  { name: 'Manrope', category: 'sans', weights: [300,400,500,600,700,800] },
  { name: 'Plus Jakarta Sans', category: 'sans', weights: [300,400,500,600,700,800] },
  { name: 'Raleway', category: 'sans', weights: [300,400,500,600,700,800,900] },
  { name: 'Lato', category: 'sans', weights: [300,400,700,900] },
  { name: 'Space Grotesk', category: 'sans', weights: [300,400,500,600,700] },
  { name: 'Instrument Sans', category: 'sans', weights: [400,500,600,700] },

  // Display
  { name: 'Bebas Neue', category: 'display', weights: [400] },
  { name: 'Oswald', category: 'display', weights: [300,400,500,600,700] },
  { name: 'Archivo Black', category: 'display', weights: [400] },
  { name: 'Anton', category: 'display', weights: [400] },
  { name: 'Bricolage Grotesque', category: 'display', weights: [400,500,600,700,800] },

  // Serif
  { name: 'Playfair Display', category: 'serif', weights: [400,500,600,700,800,900] },
  { name: 'Libre Baskerville', category: 'serif', weights: [400,700] },
  { name: 'Cormorant Garamond', category: 'serif', weights: [300,400,500,600,700] },
  { name: 'Crimson Text', category: 'serif', weights: [400,600,700] },
  { name: 'Merriweather', category: 'serif', weights: [300,400,700,900] },

  // Monospace
  { name: 'IBM Plex Mono', category: 'mono', weights: [300,400,500,600,700] },
  { name: 'JetBrains Mono', category: 'mono', weights: [300,400,500,600,700,800] },
  { name: 'Fira Code', category: 'mono', weights: [300,400,500,600,700] },
  { name: 'Source Code Pro', category: 'mono', weights: [300,400,500,600,700,900] },
];

// Build Google Fonts URL for all fonts
export function buildGoogleFontsUrl(): string {
  const families = PREMIUM_FONTS.map(f => {
    const weights = f.weights.join(';');
    return `family=${f.name.replace(/ /g, '+')}:wght@${weights}`;
  }).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
