import { Navbar } from "@/components/Navbar";
import TeamSelector from "@/components/TeamSelector";

export default function FavoriteTeamsPage() {
    return (
        <main className="mt-16">
                <Navbar />
                <TeamSelector />
        </main>
    );
}
