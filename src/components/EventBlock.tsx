interface EventBlockProps {
  emoji?: string;
  title?: string;
  color?: string,
  children: React.ReactNode;
}


export function EventBlock({ emoji, title, color, children }: EventBlockProps) {
  const bgColor = color ?? '#1e2a36';
  return (
    <div className="relative mt-4">
      {(emoji || title) && (
        <div className="absolute -top-3 left-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-[#fef4e5] bg-[#0f1a2b] border border-[#1e2a36] shadow-md">
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </div>
      )}
      <div className="rounded-md pt-6 p-3 text-sm whitespace-pre-line space-y-1" style={{backgroundColor: bgColor}}>
        {children}
      </div>
    </div>
  );
}
