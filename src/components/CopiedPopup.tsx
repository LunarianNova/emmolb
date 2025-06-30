import React, { useEffect, useState } from 'react';

export function CopiedPopup() {
  const [visible, setVisible] = useState(false);

  // Function to show popup for 1.5 seconds
  const show = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 1500);
  };

  // Expose the show function to outside via window (or better, via context)
  useEffect(() => {
    (window as any).showCopiedPopup = show;
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary bg-theme-primary border  shadow-md select-none"
      style={{ userSelect: 'none', top: '6rem'}}
    >
      Copied!
    </div>
  );
}
