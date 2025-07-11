
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { AuthProvider } from '@/lib/auth-context';
import { StripeProvider } from '@/components/payment/StripePaymentProvider';

export const metadata: Metadata = {
  title: 'Pixel Universe - Mapa Interativo de Portugal',
  description: 'A collaborative pixel art map of Portugal.',
  keywords: 'pixel art, Portugal, interactive map, digital art, NFT, community',
  authors: [{ name: 'Pixel Universe Team' }],
  creator: 'Pixel Universe',
  publisher: 'Pixel Universe',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://pixeluniverse.pt',
    title: 'Pixel Universe - Mapa Interativo de Portugal',
    description: 'Explore, compre e personalize píxeis no mapa interativo de Portugal.',
    siteName: 'Pixel Universe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Universe - Mapa Interativo de Portugal',
    description: 'Explore, compre e personalize píxeis no mapa interativo de Portugal.',
    creator: '@pixeluniverse',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">{/* Keep 'dark' for now, h-full is important */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#D4A757" />
      </head>
      {/* h-full on body, overflow-hidden removed to allow MainLayout's overflow-y-auto to work */}
      <body className="font-body antialiased h-full">
        <AuthProvider>
          <StripeProvider>
            {children}
            <OfflineIndicator />
            <Toaster />
          </StripeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
