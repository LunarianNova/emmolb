function getLuminance(hex: string): number {
  const c = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((ch) =>
    ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastTextColor(bgHex: string): 'black' | 'white' {
  const luminance = getLuminance(bgHex);
  return luminance > 0.179 ? 'black' : 'white';
}

export default function LeagueHeader(league: any) {
    league = league.league;
    return (
        <div className='relative w-full h-28 px-6 py-4 border-2 rounded-2xl shadow-xl overflow-hidden mb-4 flex items-center' style={{background: `#${league.Color}`, color: getContrastTextColor(league.Color)}}>
            <span className="text-7xl flex-shrink-0">
                {league.Emoji}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                <span className="text-2xl font-bold tracking-wide leading-tight text-center">
                    {league.Name} League
                </span>
                <span>
                    {league.LeagueType} League
                </span>
            </div>
        </div>
    );
}