import CustomLeagueSubleaguePage from "@/components/CustomLeagueSubleaguePage";

interface PageProps {
    params: Promise<{ name: string }>;
}

export default async function CustomLeagueSubleagueServerPage({ params }: PageProps) {
    let { name } = await params;
    name = name.replace(/%20/g, ' ');

    const res = await fetch('http://localhost:3000/nextapi/db/get-league', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            league_name: name,
        }),
    });
    if (!res.ok) throw new Error('Failed to fetch league!');
    const { league } = await res.json()

    return (<CustomLeagueSubleaguePage league={league} />);
}