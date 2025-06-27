'use client'

import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Close dropdowns on outside click
  const navRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dropdown toggle handler
  function toggleDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c111b] text-white font-sans shadow-lg">
      <div ref={navRef} className="relative overflow-visible max-w-7xl mx-auto">
        {/* Background logo */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
          <div className="relative w-24 h-24 opacity-20">
            <img
              src="/logo.svg"
              alt="Star Emoji"
              className="w-full h-full object-contain"
              draggable={false}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 120 30"
                className="w-full h-full opacity-80 select-none"
                aria-hidden="true"
              >
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fontSize="26"
                  fill="#ffffff"
                  stroke="#1c2a3a"
                  strokeWidth="8"
                  paintOrder="stroke"
                >
                  EMMOLB
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="flex justify-between items-center px-4 py-3 sm:hidden relative z-10">
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              // Close icon
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop / large screen menu */}
        <div
          className={`sm:flex sm:justify-center sm:gap-[10.5rem] py-5 z-10 ${
            mobileMenuOpen ? 'block' : 'hidden'
          } sm:block`}
        >
          {/* Home */}
          <Link
            href="/"
            className="text-lg font-bold tracking-wide px-3 py-2 hover:underline hover:underline-offset-4"
          >
            Home
          </Link>

          {/* Leagues dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('leagues')}
              className="text-lg font-bold tracking-wide cursor-pointer px-3 py-2"
              aria-expanded={openDropdown === 'leagues'}
              aria-haspopup="true"
            >
              Leagues
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-44 bg-[#202c3d] border border-[#2e3c50] rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'leagues'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                Greater League
              </button>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                Lesser League
              </button>
            </div>
          </div>

          {/* Info dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('info')}
              className="text-lg font-bold tracking-wide cursor-pointer px-3 py-2"
              aria-expanded={openDropdown === 'info'}
              aria-haspopup="true"
            >
              Info
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-44 bg-[#202c3d] border border-[#2e3c50] rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'info'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                What is MMOLB?
              </button>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                Election History
              </button>
              <Link
                href="https://www.patreon.com/MMOLB"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer"
              >
                Support us on Patreon
              </Link>
              <Link
                href="https://discord.gg/cr3tRG2xqq"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer"
              >
                Official Discord
              </Link>
              <Link
                href="https://reddit.com/r/MMOLB"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer"
              >
                Official Reddit
              </Link>
            </div>
          </div>

          {/* Account dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('account')}
              className="text-lg font-bold tracking-wide cursor-pointer px-3 py-2"
              aria-expanded={openDropdown === 'account'}
              aria-haspopup="true"
            >
              Account
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-52 bg-[#202c3d] border border-[#2e3c50] rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'account'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                ~~ My Profile
              </button>
              <Link href="/teams">
                <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                  Favorite Teams
                </button>
              </Link>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                ~~ Sign Out
              </button>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                ~~ Privacy Policy
              </button>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-[#2a3a4a] transition cursor-pointer">
                ~~ Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
