'use client'
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";



export default function RootLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
  return (
        <html lang="en">
            <body className={`${GeistSans.className} min-h-screen`}>
                <SettingsProvider>
                    <ThemeUpdater />
                    {children}
                </SettingsProvider>
                <Analytics />
            </body>
        </html>
    );
}
