import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function Navbar({ onOpenPalette }) {
  const location = useLocation()
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl+K')
  const [ahaCount, setAhaCount] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('devcodex.ahaCount')
      return stored ? parseInt(stored, 10) || 0 : 0
    }
    return 0
  })
  const [isGlowing, setIsGlowing] = useState(false)

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      (/Mac|iPhone|iPod|iPad/i.test(navigator.platform || '') ||
        /Mac/i.test(navigator.userAgent || ''))
    setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K')
  }, [])

  useEffect(() => {
    const handleAha = (e) => {
      if (e?.detail?.count !== undefined) {
        setAhaCount(e.detail.count)
        setIsGlowing(true)
        const timer = setTimeout(() => setIsGlowing(false), 1500)
        return () => clearTimeout(timer)
      }
    }
    window.addEventListener('devcodex:aha-moment', handleAha)
    return () => window.removeEventListener('devcodex:aha-moment', handleAha)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-surface-raised border-b border-surface-overlay">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold tracking-tight select-none">
            <span className="text-gray-400">Dev</span>
            <span className="text-primary">Code</span>
            <span className="text-gray-400">x</span>
          </Link>

          <div className="relative flex items-center">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
                isGlowing
                  ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              ⚡ <span id="aha-count">{ahaCount}</span> Aha Moments
            </span>
            {isGlowing && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
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
