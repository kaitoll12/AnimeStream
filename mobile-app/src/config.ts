// Configuración centralizada de la aplicación

// Durante el desarrollo, usa la IP local de tu computadora (Wi-Fi)
// Si publicas la app web en Vercel, cambia esto por tu URL pública (ej. https://aniflex.vercel.app)
export const API_URL = 'https://anime-steam-projects.vercel.app';

export const getImageUrl = (url: string | undefined | null) => {
  if (!url) return 'https://via.placeholder.com/400x600';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Colores oficiales de la aplicación (Theme Premium Aniflex)
export const COLORS = {
  background: '#0a0a0a',     // Fondo principal súper oscuro (casi negro)
  card: '#141414',           // Fondo de tarjetas estilo Netflix
  cardElevated: '#1f1f1f',   // Fondo para elementos elevados
  primary: '#8b5cf6',        // Morado principal (acentos)
  text: '#ffffff',           // Texto principal blanco puro
  textMuted: '#a3a3a3',      // Texto secundario gris claro
  overlay: 'rgba(0,0,0,0.6)' // Overlay para fondos
};
