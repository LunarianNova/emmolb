import LivePage from '@/components/AnimatedGame';

export default async function LiveGamePage({ params }: { params: { id: string } }) {
    return <LivePage id={params.id} />;
}
