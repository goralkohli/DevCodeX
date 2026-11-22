import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-100">
        404 — Not Found
      </h1>
      <p className="mt-3 text-sm text-gray-400">
        The requested page or topic could not be found.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="text-primary hover:underline text-sm font-medium"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
