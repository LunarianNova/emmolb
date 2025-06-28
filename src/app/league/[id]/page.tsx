// src/app/league/[id]/page.tsx

import LeaguePage from "@/components/LeaguePage";

interface PageProps {
  params: { id: string };
}

export default function LeagueServer({ params }: PageProps) {
  return <LeaguePage id={params.id} />;
}
