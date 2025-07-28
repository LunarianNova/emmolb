import GLGamesPage from "@/components/GLGamesPage";

export default async function GLGamesServerPage() {
    const timeRes = await fetch(`http://localhost:3000/nextapi/time`, {
        next: { revalidate: 0 },
    });
    const time = await timeRes.json();
    const day = time.season_day % 2 == 1 ? time.season_day : Number(time.season_day) - 1;
    const season = time.season_number;

    return (<GLGamesPage season={Number(season)} initialDay={Number(day)} />);
}