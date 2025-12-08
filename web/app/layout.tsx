import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from '../lib/ThemeContext';
import EnhancedHeader from '../components/ui/EnhancedHeader';
import Footer from '../components/ui/Footer';

export const metadata = {
  title: 'Akorfa',
  description: 'Akorfa — Human Stack platform for self-discovery and growth'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-slate-900 amoled:bg-black text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <EnhancedHeader />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
