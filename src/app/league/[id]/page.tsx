import LeaguePage from "@/components/LeaguePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeagueServer({ params }: PageProps) {
  const {id} = await params;
  return <LeaguePage id={id} />;
}
