import LeaguePage from "@/components/LeaguePage";

export default function LeagueServer({ params }: { params: { id: string } }) {
  return <LeaguePage id={params.id} />;
}
