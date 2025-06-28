import TeamPage from "@/components/TeamPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
  const {id} = await params;
  return <TeamPage id={id} />;
}
