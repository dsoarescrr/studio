'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const resources = {
  'pt-PT': {
    translation: {
      // Common
      'app.name': 'Pixel Universe',
      'app.tagline': 'Mapa Interativo de Portugal',
      
      // Navigation
      'nav.universe': 'Universo',
      'nav.market': 'Market',
      'nav.gallery': 'Galeria',
      'nav.profile': 'Perfil',
      'nav.ranking': 'Ranking',
      'nav.achievements': 'Conquistas',
      'nav.settings': 'Definições',
      
      // Map
      'map.loading': 'A carregar mapa...',
      'map.zoom': 'Zoom',
      'map.reset': 'Resetar Vista',
      'map.coordinates': 'Coordenadas',
      'map.pixel': 'Pixel',
      'map.pixels': 'Pixels no Mapa',
      'map.generate': 'Gerar Descrição com IA',
      'map.generating': 'Gerando descrição com IA...',
      'map.location': 'Ir para Minha Localização',
      'map.view': 'Ver no Google Maps',
      'map.performance': 'Modo de Desempenho',
      
      // Pixel Details
      'pixel.owner': 'Proprietário',
      'pixel.price': 'Preço',
      'pixel.region': 'Região',
      'pixel.views': 'Visualizações',
      'pixel.likes': 'Curtidas',
      'pixel.buy': 'Comprar',
      'pixel.edit': 'Editar',
      'pixel.share': 'Partilhar',
      
      // Achievements
      'achievements.unlocked': 'Conquista Desbloqueada!',
      'achievements.progress': 'Progresso',
      'achievements.reward': 'Recompensa',
      'achievements.xp': 'XP',
      'achievements.credits': 'Créditos',
      
      // User
      'user.level': 'Nível',
      'user.credits': 'Créditos',
      'user.special': 'Especiais',
      'user.pixels': 'Pixels',
      'user.achievements': 'Conquistas',
      
      // Errors
      'error.loading': 'Erro ao carregar',
      'error.retry': 'Tentar Novamente',
      'error.map': 'Não foi possível carregar o mapa',
      'error.grid': 'Não foi possível gerar a grelha interativa',
      'error.purchase': 'Falha na compra',
      'error.ai': 'Não foi possível gerar uma descrição',
    }
  },
  'en-US': {
    translation: {
      // Common
      'app.name': 'Pixel Universe',
      'app.tagline': 'Interactive Map of Portugal',
      
      // Navigation
      'nav.universe': 'Universe',
      'nav.market': 'Market',
      'nav.gallery': 'Gallery',
      'nav.profile': 'Profile',
      'nav.ranking': 'Ranking',
      'nav.achievements': 'Achievements',
      'nav.settings': 'Settings',
      
      // Map
      'map.loading': 'Loading map...',
      'map.zoom': 'Zoom',
      'map.reset': 'Reset View',
      'map.coordinates': 'Coordinates',
      'map.pixel': 'Pixel',
      'map.pixels': 'Pixels on Map',
      'map.generate': 'Generate AI Description',
      'map.generating': 'Generating AI description...',
      'map.location': 'Go to My Location',
      'map.view': 'View on Google Maps',
      'map.performance': 'Performance Mode',
      
      // Pixel Details
      'pixel.owner': 'Owner',
      'pixel.price': 'Price',
      'pixel.region': 'Region',
      'pixel.views': 'Views',
      'pixel.likes': 'Likes',
      'pixel.buy': 'Buy',
      'pixel.edit': 'Edit',
      'pixel.share': 'Share',
      
      // Achievements
      'achievements.unlocked': 'Achievement Unlocked!',
      'achievements.progress': 'Progress',
      'achievements.reward': 'Reward',
      'achievements.xp': 'XP',
      'achievements.credits': 'Credits',
      
      // User
      'user.level': 'Level',
      'user.credits': 'Credits',
      'user.special': 'Special',
      'user.pixels': 'Pixels',
      'user.achievements': 'Achievements',
      
      // Errors
      'error.loading': 'Loading Error',
      'error.retry': 'Try Again',
      'error.map': 'Could not load the map',
      'error.grid': 'Could not generate the interactive grid',
      'error.purchase': 'Purchase failed',
      'error.ai': 'Could not generate a description',
    }
  },
  'es-ES': {
    translation: {
      // Common
      'app.name': 'Pixel Universe',
      'app.tagline': 'Mapa Interactivo de Portugal',
      
      // Navigation
      'nav.universe': 'Universo',
      'nav.market': 'Mercado',
      'nav.gallery': 'Galería',
      'nav.profile': 'Perfil',
      'nav.ranking': 'Ranking',
      'nav.achievements': 'Logros',
      'nav.settings': 'Ajustes',
      
      // Map
      'map.loading': 'Cargando mapa...',
      'map.zoom': 'Zoom',
      'map.reset': 'Restablecer Vista',
      'map.coordinates': 'Coordenadas',
      'map.pixel': 'Pixel',
      'map.pixels': 'Píxeles en el Mapa',
      'map.generate': 'Generar Descripción con IA',
      'map.generating': 'Generando descripción con IA...',
      'map.location': 'Ir a Mi Ubicación',
      'map.view': 'Ver en Google Maps',
      'map.performance': 'Modo de Rendimiento',
      
      // Pixel Details
      'pixel.owner': 'Propietario',
      'pixel.price': 'Precio',
      'pixel.region': 'Región',
      'pixel.views': 'Vistas',
      'pixel.likes': 'Me gusta',
      'pixel.buy': 'Comprar',
      'pixel.edit': 'Editar',
      'pixel.share': 'Compartir',
      
      // Achievements
      'achievements.unlocked': '¡Logro Desbloqueado!',
      'achievements.progress': 'Progreso',
      'achievements.reward': 'Recompensa',
      'achievements.xp': 'XP',
      'achievements.credits': 'Créditos',
      
      // User
      'user.level': 'Nivel',
      'user.credits': 'Créditos',
      'user.special': 'Especiales',
      'user.pixels': 'Píxeles',
      'user.achievements': 'Logros',
      
      // Errors
      'error.loading': 'Error de carga',
      'error.retry': 'Intentar de nuevo',
      'error.map': 'No se pudo cargar el mapa',
      'error.grid': 'No se pudo generar la cuadrícula interactiva',
      'error.purchase': 'Falló la compra',
      'error.ai': 'No se pudo generar una descripción',
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? 
      (localStorage.getItem('pixel-universe-locale') || 'pt-PT') : 
      'pt-PT',
    fallbackLng: 'pt-PT',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
