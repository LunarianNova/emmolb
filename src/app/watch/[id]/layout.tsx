import LeagueScoreboard from "@/components/LeagueScoreboard";
import { Navbar } from "@/components/Navbar";

export default function WatchLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
    return <>
        <Navbar />
        <div className='mt-24'>
            <LeagueScoreboard />
        </div>
        {children}
    </>;
}