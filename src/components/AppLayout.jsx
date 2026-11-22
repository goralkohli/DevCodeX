import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CommandPalette from './CommandPalette'

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-gray-100 font-sans">
      <Navbar onOpenPalette={() => setOpen(true)} />
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  )
}
