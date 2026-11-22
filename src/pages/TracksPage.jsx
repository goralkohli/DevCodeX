import { Link } from 'react-router-dom'
import { tracks } from '../data/tracks'

export default function TracksPage() {
  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100">Tracks</h1>
        <p className="mt-2 text-sm text-gray-400">
          Curated learning tracks designed for targeted recall and deep mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(tracks).map((track) => (
          <div
            key={track.id}
            className="p-6 bg-surface-raised border border-surface-overlay rounded-lg space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-100">{track.title}</h2>
            <ul className="space-y-2">
              {Object.entries(track.topics).map(([topicId, topic]) => (
                <li key={topicId}>
                  <Link
                    to={`/tracks/${track.id}/${topicId}`}
                    className="inline-flex items-center text-primary hover:underline font-medium text-sm"
                  >
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
