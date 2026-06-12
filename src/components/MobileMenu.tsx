'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

interface Props {
  links: Array<{ label: string; href: string }>
}

/** Mobile hamburger that slides a panel in from the right.
 *  The overlay is portalled to <body> so it escapes the header's
 *  backdrop-filter containing block (otherwise fixed/h-full collapse to the
 *  header height and the panel background only covers the top strip). */
export default function MobileMenu({ links }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Slide-out panel from the right (explicitly opaque) */}
      <aside
        style={{ backgroundColor: '#ffffff' }}
        className={`fixed right-0 top-0 z-[70] h-full w-72 max-w-[80%] transform bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <span className="font-semibold text-gray-700">Meny</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Stäng meny"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-3 text-gray-700 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Öppna meny"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {mounted && createPortal(overlay, document.body)}
    </div>
  )
}
