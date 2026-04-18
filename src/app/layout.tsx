import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { BreakReminderModal } from '@/components/player/BreakReminderModal';

export const metadata: Metadata = {
  title: 'Gmusic - Feel the Isai',
  description: 'Listen to the latest and trending Tamil songs with our modern music discovery platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen pb-24">
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
        <BreakReminderModal />
        <MusicPlayer />
      </body>
    </html>
  );
}
