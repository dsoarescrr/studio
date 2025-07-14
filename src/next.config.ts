/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['@genkit-ai/ai', 'genkit'],
  env: {
    // Find these values in your Firebase project settings:
    // Project Settings > General > Your apps > Firebase SDK snippet > Config
    // Or go to: https://console.firebase.google.com/project/_/settings/general/
    NEXT_PUBLIC_FIREBASE_API_KEY: 'YOUR_API_KEY',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'YOUR_AUTH_DOMAIN',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'YOUR_PROJECT_ID',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'YOUR_STORAGE_BUCKET',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'YOUR_MESSAGING_SENDER_ID',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'YOUR_APP_ID',
  },
};

module.exports = nextConfig;
