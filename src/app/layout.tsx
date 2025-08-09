import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import PerformanceMonitor from "./components/PerformanceMonitor";
import PerformanceDashboard from "./components/PerformanceDashboard";
import ErrorBoundary from "./components/ErrorBoundary";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Dil2Deal - Local Deals Directory",
  description: "Discover amazing local deals and offers from businesses in your area. Save money while supporting your community.",
  keywords: "local deals, discounts, offers, community, businesses",
  authors: [{ name: "Dil2Deal Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Dil2Deal - Local Deals Directory",
    description: "Discover amazing local deals and offers from businesses in your area.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dil2Deal - Local Deals Directory",
    description: "Discover amazing local deals and offers from businesses in your area.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/categories" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/locations/states" as="fetch" crossOrigin="anonymous" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Preload critical pages
              const preloadLinks = ['/deals', '/vendor'];
              preloadLinks.forEach(href => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = href;
                document.head.appendChild(link);
              });
            `,
          }}
        />
      </head>
      <body className={`${geist.className} antialiased`}>
        <ErrorBoundary>
          <PerformanceMonitor />
          <Header />
          {children}
          <PerformanceDashboard />
        </ErrorBoundary>
      </body>
    </html>
  );
}
