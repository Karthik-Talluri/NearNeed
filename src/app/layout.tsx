import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NearNeedProvider } from '@/context/NearNeedContext';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NearNeed | Find What You Need Near You',
  description: 'NearNeed connects local shoppers with nearby stores for instant physical product availability, stock checking, and local reservations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <NearNeedProvider>
          <RoleSwitcher />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NearNeedProvider>
      </body>
    </html>
  );
}
