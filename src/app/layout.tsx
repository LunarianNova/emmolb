'use client'
import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
    const pathname = usePathname();
    const hideNavbar = pathname.includes('live');
  
    return (
        <html lang="en">
            <body className={`${GeistSans.className} ${GeistMono.variable} min-h-screen`}>
                {!hideNavbar && <Navbar />}                
                <SettingsProvider>
                    <ThemeUpdater />
                    {children}
                </SettingsProvider>
                <Analytics />
            </body>
        </html>
    );
}
