import React, { useEffect } from "react";
import PitchZone from "./PitchZone";

function useHighlightEventOnHash() {
  useEffect(() => {
    function highlight() {
      if (!window.location.hash) return;
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.classList.add("highlighted-event");

        // Remove highlight class after 2 seconds
        setTimeout(() => {
          el.classList.remove("highlighted-event");
        }, 2000);
      }
    }

    highlight();

    // Optional: listen for future hash changes
    window.addEventListener("hashchange", highlight);

    return () => {
      window.removeEventListener("hashchange", highlight);
    };
  }, []);
}

interface EventBlockProps {
  emoji?: string;
  title?: string;
  color?: string,
  messages: EventMessage[];
}

type EventMessage = {
  index: number;
  message: string;
  pitchSpeed?: string | null;
  pitchZone?: string | null;
}

export function EventBlock({ emoji, title, color, messages }: EventBlockProps) {
  useHighlightEventOnHash();
  const bgColor = color ?? '#1e2a36';
  return (
    <div className="relative mt-6">
      {(emoji || title) && (
        <div className="absolute -top-3 left-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-[#fef4e5] bg-[#0f1a2b] border border-[#1e2a36] shadow-md">
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </div>
      )}
      <div className="rounded-md pt-6 p-3 mt-4 bg-[#1e2a36]" style={{backgroundColor: bgColor}}>
        {messages.map(({index, message, pitchSpeed, pitchZone}, i) => (
          <div key={i} className="flex justify-between items-start gap-2">
            <div id={`event-${index}`} className="flex-1 text-left leading-[1.3] [&>*]:inline [&>*]:whitespace-normal" style={{ scrollMarginTop: '15rem' }} dangerouslySetInnerHTML={{__html: message}} />
            {(pitchSpeed && pitchZone) ? (
              <div className="flex items-center gap-1 ml-2 text-[10px] opacity-80 w-fit shrink-0">
                <span>
                  {pitchSpeed}
                </span>
                <PitchZone zone={Number(pitchZone)} />
                <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}#event-${index}`;
                  navigator.clipboard.writeText(url);
                  (window as any).showCopiedPopup?.();
                }}
                className="cursor-pointer no-underline">
                  🔗
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-2 text-[10px] opacity-80 w-fit shrink-0">
                <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}#event-${index}`;
                  navigator.clipboard.writeText(url);
                  (window as any).showCopiedPopup?.();
                }}
                className="cursor-pointer no-underline">
                  🔗
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
