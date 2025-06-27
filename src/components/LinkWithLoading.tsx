'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Loading from './Loading';

export function LinkWithLoading({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  return (
    <>
      {!loading ? (<a href={href} onClick={handleClick} className="cursor-pointer">
        {children}
      </a>) : 
      (<Loading />)}
    </>
  );
}
