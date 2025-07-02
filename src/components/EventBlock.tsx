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
  color?: string;
  titleColor?: string;
  messages: EventMessage[];
  onClick?: () => void;
}

type EventMessage = {
  index: number;
  message: string;
  pitchSpeed?: string | null;
  pitchZone?: string | null;
}

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

export function EventBlock({ emoji, title, color, titleColor, messages, onClick }: EventBlockProps) {
  useHighlightEventOnHash();
  const bgColor = color ?? '--bg-theme-primary';
  return (
    <div className="relative mt-6">
      {(emoji || title) && (
        <div className={`absolute -top-3 left-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary border border-theme-accent shadow-md ${onClick?'cursor-pointer':''}`} onClick={onClick} style={{background: titleColor ? `#${titleColor}` : 'var(--theme-secondary)', color: titleColor ? getContrastTextColor(titleColor) : 'var(--theme-text)'}}>
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </div>
      )}
      <div className={`rounded-md pt-6 p-3 mt-4 bg-theme-primary ${color}`}>
        <div className="text-sm whitespace-pre-line space-y-1">
          {messages.map(({index, message, pitchSpeed, pitchZone}, i) => (
            <div key={i} className="flex justify-between items-start gap-2">
              <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}#event-${index}`;
                    navigator.clipboard.writeText(url);
                    (window as any).showCopiedPopup?.();
                  }}
                  className="cursor-pointer no-underline">
                    🔗
              </button>
              <div id={`event-${index}`} className="flex-1 text-left leading-[1.3] [&>*]:inline [&>*]:whitespace-normal" style={{ scrollMarginTop: '15rem' }} dangerouslySetInnerHTML={{__html: message}} />
              {(pitchSpeed && pitchZone) ? (
                <div className="flex items-center gap-1 ml-2 text-[10px] opacity-80 w-fit shrink-0">
                  <span>
                    {pitchSpeed}
                  </span>
                  <PitchZone zone={Number(pitchZone)} />
                </div>
              ) : ('')}
            </div>
        ))}
        </div>
      </div>
    </div>
  );
}
