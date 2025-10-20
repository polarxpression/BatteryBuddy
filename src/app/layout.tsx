import { Montserrat, Lato } from 'next/font/google';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' });
const lato = Lato({ subsets: ['latin'], variable: '--font-headline', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Battery Buddy',
  description: 'An app to manage your battery storage',
};

import { AppSettingsProvider } from "@/contexts/app-settings-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body ${montserrat.variable} ${lato.variable} antialiased`}>
        <AppSettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
          >
            <div className="bg-polar-2">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </AppSettingsProvider>
      </body>
    </html>
  );
}