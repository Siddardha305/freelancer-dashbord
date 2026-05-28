import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FreelanceOS | Premium Dashboard",
  description: "High-performance dashboard for independent professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || localStorage.getItem('admin-theme') || 'light';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning className="bg-background text-foreground font-sans">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

