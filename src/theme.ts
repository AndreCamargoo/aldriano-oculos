// Tema escuro moderno. Contraste alto e alvos de toque grandes (acessibilidade).
export const colors = {
  bg: '#0A0C16',
  surface: '#141A2E',
  surfaceHi: '#1C2442',
  border: 'rgba(255,255,255,0.09)',
  text: '#F5F7FF',
  muted: '#9EA8C7',
  accent: '#7C5CFF',
  accent2: '#22D3EE',
  danger: '#FF6B81',
  ok: '#34D399',
  onAccent: '#FFFFFF',
};

export const gradients = {
  primary: ['#7C5CFF', '#22D3EE'] as const,
  surface: ['#1C2442', '#141A2E'] as const,
  danger: ['#FF6B81', '#FF9A6B'] as const,
};

export const radius = { md: 16, lg: 24, xl: 32, pill: 999 };
