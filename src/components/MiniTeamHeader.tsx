import Link from "next/link";

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

export default function MiniTeamHeader({team, index}: { team: any, index?: number }) {
    return (
        <Link href={`/team/${team._id}`} className='block'>
            <div className='flex justify-between items-center p-2 rounded cursor-pointer transition h-12' style={{background: `#${team.Color}`, color: getContrastTextColor(team.Color)}}>
                <div className='flex items-center gap-3 overflow-hidden min-w-0'>
                    {index ? <span className='w-5 text-right font-mono text-sm opacity-70 flex-shrink-0'>{index}.</span> : ''}
                    <span className='w-6 text-xl text-center flex-shrink-0'>{team.Emoji}</span>
                    <span className="flex-1 font-semibold text-left truncate min-w-0">{team.Location} {team.Name}</span>
                </div>
                <span className='text-sm font-semibold opacity-80 flex-shrink-0'>
                    {team.Record["Regular Season"].Wins} - {team.Record["Regular Season"].Losses}
                    <span className="ml-1">
                        ({team.Record["Regular Season"].RunDifferential > 0 ? '+' : ''}{team.Record["Regular Season"].RunDifferential})
                    </span>
                </span>
            </div>
        </Link>
    );
}