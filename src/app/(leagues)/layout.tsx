export default function LeagueLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
    return (
        <main className="mt-16">
            <div className="bg-theme-background text-theme-text font-sans p-4 pt-20 mx-auto">
                {children}
            </div>
        </main>
    );
}
