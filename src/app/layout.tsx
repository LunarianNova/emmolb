import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { ThemeProvider } from "@/hooks/ThemeContext";
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/components/Settings";

export const metadata: Metadata = {
  title: "Shards of Space",
  description: "Idunno what I'm doing (:",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} min-h-screen`}
      >
        <SettingsProvider>
        {children}
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
