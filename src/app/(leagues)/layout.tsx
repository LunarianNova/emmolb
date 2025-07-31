export default function LeagueLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-24 max-w-2xl mx-auto">
                {children}
            </div>
        </main>
    );
}
