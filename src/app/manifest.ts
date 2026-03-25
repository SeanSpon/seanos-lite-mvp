import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SeanOS - Life Dashboard',
    short_name: 'SeanOS',
    description: 'Your personal command center for everything in life',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a0a0f',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
