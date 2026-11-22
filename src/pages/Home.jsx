export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
        <span className="text-gray-400">Dev</span>
        <span className="text-primary">Code</span>
        <span className="text-gray-400">x</span>
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-md">
        Interactive developer recall &amp; learning hub.
      </p>
      <div className="mt-8">
        <button
          type="button"
          disabled
          className="px-5 py-2.5 rounded-lg bg-surface-raised border border-surface-overlay text-gray-500 font-medium text-sm cursor-not-allowed select-none"
        >
          Coming Soon
        </button>
      </div>
    </div>
  )
}
