import { getContrastTextColor } from '@/helpers/Colors';

type Team = {
  id?: string;
  name: string;
  emoji: string;
  color: string;
  record?: string;
};

type Props = {
  homeTeam: Team;
  awayTeam: Team;
  label?: string;
};

export default function MockGameHeader({ homeTeam, awayTeam, label }: Props) {
  return (
    <div
      className="rounded-xl shadow-lg overflow-visible border-2 border-theme-accent"
      style={{
        background: `linear-gradient(60deg, #${awayTeam.color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${homeTeam.color} 64%)`,
      }}
    >
      <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3">
        {/* Away Team */}
        <div className="flex flex-col items-center text-center" style={{ color: getContrastTextColor(awayTeam.color) }}>
            <div className="text-xl">{awayTeam.emoji}</div>
            <div className="text-sm font-semibold">{awayTeam.name}</div>
            <div className="text-xs opacity-70">{awayTeam.record}</div>
        </div>

        {/* Label */}
        <div className="text-white text-sm font-bold text-center">{label || 'Upcoming'}</div>

        {/* Home Team */}
        <div className="flex flex-col items-center text-center" style={{ color: getContrastTextColor(homeTeam.color) }}>
            <div className="text-xl">{homeTeam.emoji}</div>
            <div className="text-sm font-semibold">{homeTeam.name}</div>
            <div className="text-xs opacity-70">{homeTeam.record}</div>
        </div>
      </div>
    </div>
  );
}
