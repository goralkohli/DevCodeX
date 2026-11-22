import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-gray-100 font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
