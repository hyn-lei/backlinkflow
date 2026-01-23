import type { Metadata } from 'next';
import { Outfit, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { GoogleAnalytics } from '@/components/google-analytics';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BacklinkFlow - Growth Ops for Distribution',
    template: '%s | BacklinkFlow',
  },
  description: 'Plan distribution, discover platforms, and track backlink submissions by project.',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'BacklinkFlow - Growth Ops for Distribution',
    description: 'Plan distribution, discover platforms, and track backlink submissions by project.',
    url: '/',
    siteName: 'BacklinkFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BacklinkFlow - Growth Ops for Distribution',
    description: 'Plan distribution, discover platforms, and track backlink submissions by project.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.className} ${manrope.variable} ${outfit.variable} antialiased`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-M05YV6XWCG'} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
