export interface TextAnimation {
  id: string;
  name: string;
  category: 'in' | 'out' | 'combo';
  css: string; // keyframes CSS
  defaultDuration: number;
  defaultEasing: string;
}

export const TEXT_ANIMATIONS: TextAnimation[] = [
  // === ENTRANCE (8) ===
  { id: 'fadeIn', name: 'Fade In', category: 'in', defaultDuration: 0.6, defaultEasing: 'ease-out',
    css: `@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }` },
  { id: 'slideUp', name: 'Slide Up', category: 'in', defaultDuration: 0.7, defaultEasing: 'cubic-bezier(0.16,1,0.3,1)',
    css: `@keyframes slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }` },
  { id: 'slideDown', name: 'Slide Down', category: 'in', defaultDuration: 0.7, defaultEasing: 'cubic-bezier(0.16,1,0.3,1)',
    css: `@keyframes slideDown { from { opacity:0; transform:translateY(-40px) } to { opacity:1; transform:translateY(0) } }` },
  { id: 'slideLeft', name: 'Slide Left', category: 'in', defaultDuration: 0.7, defaultEasing: 'cubic-bezier(0.16,1,0.3,1)',
    css: `@keyframes slideLeft { from { opacity:0; transform:translateX(60px) } to { opacity:1; transform:translateX(0) } }` },
  { id: 'slideRight', name: 'Slide Right', category: 'in', defaultDuration: 0.7, defaultEasing: 'cubic-bezier(0.16,1,0.3,1)',
    css: `@keyframes slideRight { from { opacity:0; transform:translateX(-60px) } to { opacity:1; transform:translateX(0) } }` },
  { id: 'scaleIn', name: 'Scale In', category: 'in', defaultDuration: 0.5, defaultEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    css: `@keyframes scaleIn { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }` },
  { id: 'blurIn', name: 'Blur In', category: 'in', defaultDuration: 0.8, defaultEasing: 'ease-out',
    css: `@keyframes blurIn { from { opacity:0; filter:blur(12px) } to { opacity:1; filter:blur(0) } }` },
  { id: 'typewriter', name: 'Typewriter', category: 'in', defaultDuration: 2.0, defaultEasing: 'steps(40,end)',
    css: `@keyframes typewriter { from { width:0; border-right:2px solid } to { width:100%; border-right:2px solid } }` },

  // === EXIT (6) ===
  { id: 'fadeOut', name: 'Fade Out', category: 'out', defaultDuration: 0.5, defaultEasing: 'ease-in',
    css: `@keyframes fadeOut { from { opacity:1 } to { opacity:0 } }` },
  { id: 'slideOutUp', name: 'Slide Out Up', category: 'out', defaultDuration: 0.6, defaultEasing: 'ease-in',
    css: `@keyframes slideOutUp { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-40px) } }` },
  { id: 'slideOutDown', name: 'Slide Out Down', category: 'out', defaultDuration: 0.6, defaultEasing: 'ease-in',
    css: `@keyframes slideOutDown { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(40px) } }` },
  { id: 'scaleOut', name: 'Scale Out', category: 'out', defaultDuration: 0.5, defaultEasing: 'ease-in',
    css: `@keyframes scaleOut { from { opacity:1; transform:scale(1) } to { opacity:0; transform:scale(0.5) } }` },
  { id: 'blurOut', name: 'Blur Out', category: 'out', defaultDuration: 0.6, defaultEasing: 'ease-in',
    css: `@keyframes blurOut { from { opacity:1; filter:blur(0) } to { opacity:0; filter:blur(12px) } }` },
  { id: 'collapse', name: 'Collapse', category: 'out', defaultDuration: 0.5, defaultEasing: 'ease-in',
    css: `@keyframes collapse { from { max-height:200px; opacity:1 } to { max-height:0; opacity:0; overflow:hidden } }` },

  // === COMBINATION (6) ===
  { id: 'bounceIn', name: 'Bounce In', category: 'combo', defaultDuration: 0.8, defaultEasing: 'cubic-bezier(0.34,1.56,0.64,1)',
    css: `@keyframes bounceIn { 0% { opacity:0; transform:scale(0.3) } 50% { transform:scale(1.05) } 70% { transform:scale(0.95) } 100% { opacity:1; transform:scale(1) } }` },
  { id: 'flipIn', name: 'Flip In', category: 'combo', defaultDuration: 0.8, defaultEasing: 'ease-out',
    css: `@keyframes flipIn { from { opacity:0; transform:perspective(600px) rotateX(-90deg) } to { opacity:1; transform:perspective(600px) rotateX(0) } }` },
  { id: 'glitch', name: 'Glitch', category: 'combo', defaultDuration: 0.6, defaultEasing: 'steps(2,jump-none)',
    css: `@keyframes glitch { 0% { clip-path:inset(40% 0 61% 0); transform:translate(-2px,2px) } 20% { clip-path:inset(92% 0 1% 0); transform:translate(1px,-3px) } 40% { clip-path:inset(43% 0 1% 0); transform:translate(-1px,3px) } 60% { clip-path:inset(25% 0 58% 0); transform:translate(3px,1px) } 80% { clip-path:inset(54% 0 7% 0); transform:translate(-3px,-2px) } 100% { clip-path:inset(0); transform:translate(0) } }` },
  { id: 'splitReveal', name: 'Split Reveal', category: 'combo', defaultDuration: 0.8, defaultEasing: 'cubic-bezier(0.77,0,0.175,1)',
    css: `@keyframes splitReveal { from { clip-path:inset(0 50% 0 50%); opacity:0 } to { clip-path:inset(0 0 0 0); opacity:1 } }` },
  { id: 'wave', name: 'Wave', category: 'combo', defaultDuration: 1.2, defaultEasing: 'ease-out',
    css: `@keyframes wave { 0% { opacity:0; transform:translateY(20px) rotate(-5deg) } 50% { transform:translateY(-5px) rotate(2deg) } 100% { opacity:1; transform:translateY(0) rotate(0) } }` },
  { id: 'neonPulse', name: 'Neon Pulse', category: 'combo', defaultDuration: 2.0, defaultEasing: 'ease-in-out',
    css: `@keyframes neonPulse { 0%,100% { text-shadow:0 0 4px currentColor, 0 0 11px currentColor, 0 0 19px currentColor } 50% { text-shadow:0 0 2px currentColor, 0 0 5px currentColor, 0 0 10px currentColor } }` },
];

export const BG_ANIMATIONS = [
  { id: 'none', name: 'None' },
  { id: 'bgFadeIn', name: 'Fade In', css: `@keyframes bgFadeIn { from { opacity:0 } to { opacity:var(--bg-opacity,1) } }` },
  { id: 'bgFadeOut', name: 'Fade Out', css: `@keyframes bgFadeOut { from { opacity:var(--bg-opacity,1) } to { opacity:0 } }` },
  { id: 'bgZoomIn', name: 'Ken Burns Zoom In', css: `@keyframes bgZoomIn { from { transform:scale(1) } to { transform:scale(1.15) } }` },
  { id: 'bgZoomOut', name: 'Ken Burns Zoom Out', css: `@keyframes bgZoomOut { from { transform:scale(1.15) } to { transform:scale(1) } }` },
  { id: 'bgSlideLeft', name: 'Slide In Left', css: `@keyframes bgSlideLeft { from { transform:translateX(-100%) } to { transform:translateX(0) } }` },
  { id: 'bgSlideRight', name: 'Slide In Right', css: `@keyframes bgSlideRight { from { transform:translateX(100%) } to { transform:translateX(0) } }` },
  { id: 'bgPulse', name: 'Pulse', css: `@keyframes bgPulse { 0%,100% { opacity:var(--bg-opacity,0.5) } 50% { opacity:calc(var(--bg-opacity,0.5) * 0.6) } }` },
];
