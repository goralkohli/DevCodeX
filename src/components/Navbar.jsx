import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function Navbar({ onOpenPalette }) {
  const location = useLocation()
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+K')

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      (/Mac|iPhone|iPod|iPad/i.test(navigator.platform || '') ||
        /Mac/i.test(navigator.userAgent || ''))
    setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K')
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-surface-raised border-b border-surface-overlay">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold tracking-tight select-none">
            <span className="text-gray-400">Dev</span>
            <span className="text-primary">Code</span>
            <span className="text-gray-400">x</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-base border border-surface-overlay text-gray-400 hover:text-gray-200 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <span>Quick Recall...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-raised border border-surface-overlay rounded text-gray-400">
              {shortcutLabel}
            </kbd>
          </button>

          <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold transition-colors'
                  : 'text-gray-300 hover:text-white transition-colors'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/tracks"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold transition-colors'
                  : 'text-gray-300 hover:text-white transition-colors'
              }
            >
              Tracks
            </NavLink>
            <NavLink
              to="/tracks/canvas/radial-coordinates?tab=sandbox"
              className={() => {
                const isSandboxActive =
                  location.pathname === '/tracks/canvas/radial-coordinates' &&
                  location.search.includes('tab=sandbox')
                return isSandboxActive
                  ? 'text-primary font-semibold transition-colors'
                  : 'text-gray-300 hover:text-white transition-colors'
              }}
            >
              Sandbox
            </NavLink>
            <NavLink
              to="/clinic"
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold transition-colors'
                  : 'text-gray-300 hover:text-white transition-colors'
              }
            >
              Code Clinic
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
