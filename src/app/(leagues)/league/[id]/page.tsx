import LeaguePage from "@/components/leagues/LesserLeaguePage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const {id} = await params;
    return <LeaguePage id={id} />;
}
