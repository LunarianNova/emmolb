'use client'
import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";
import { Navbar } from "@/components/Navbar";



export default function RootLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
  return (
        <html lang="en">
            <body className={`${GeistSans.className} ${GeistMono.variable} min-h-screen`}>
                <Navbar />
                <SettingsProvider>
                    <ThemeUpdater />
                    {children}
                </SettingsProvider>
                <Analytics />
            </body>
        </html>
    );
}
