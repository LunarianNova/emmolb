export function SeasonSchedule({feed}: { feed: any }) {
    const season = feed[feed.length - 1].season;
    return (
        <div>
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))]">
                {feed.map((event: any, index: number) => {
                    if (event.season === season)
                        return (
                            <div key={index} className="relative rounded-md p-1 text-xs min-h-[100px] flex flex-col items-center justify-center cursor-pointer hover:opacity-80">
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold">{event.day}</div>
                                <div className="absolute top-1 right-1 text-xs"></div>
                            </div>
                        );
                })}
            </div>
        </div>
    );
}