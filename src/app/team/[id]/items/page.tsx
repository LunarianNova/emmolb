import TeamItemsPage from "@/components/TeamItemsPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
    const {id} = await params;
    return <TeamItemsPage id={id} />;
}
