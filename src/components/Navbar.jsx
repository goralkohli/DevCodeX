export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface-raised border-b border-surface-overlay">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-xl font-bold tracking-tight select-none">
            <span className="text-gray-400">Dev</span>
            <span className="text-primary">Code</span>
            <span className="text-gray-400">x</span>
          </a>
        </div>
        <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Tracks</a>
          <a href="#" className="hover:text-white transition-colors">Sandbox</a>
          <a href="#" className="hover:text-white transition-colors">Code Clinic</a>
        </nav>
      </div>
    </header>
  )
}
