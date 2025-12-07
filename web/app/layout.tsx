import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from '../lib/ThemeContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export const metadata = {
  title: 'Akorfa',
  description: 'Akorfa — Human Stack platform for self-discovery and growth'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
