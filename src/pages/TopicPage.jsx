import { Link, useParams, useSearchParams } from 'react-router-dom'
import { tracks } from '../data/tracks'
import NotFoundPage from './NotFoundPage'

const VALID_TABS = ['concept', 'sandbox', 'audit']

export default function TopicPage() {
  const { trackId, topicId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const track = tracks[trackId]
  const topic = track?.topics?.[topicId]

  if (!track || !topic) {
    return <NotFoundPage />
  }

  const tabParam = searchParams.get('tab')
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'concept'

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab })
  }

  return (
    <div className="py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400">
        <Link to="/tracks" className="hover:text-white transition-colors">
          Tracks
        </Link>
        <span>/</span>
        <span>{track.title}</span>
        <span>/</span>
        <span className="text-gray-100 font-medium">{topic.title}</span>
      </nav>

      {/* Tabs */}
      <div className="border-b border-surface-overlay overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          <button
            type="button"
            onClick={() => handleTabChange('concept')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'concept'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Concept
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('sandbox')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'sandbox'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Interactive Sandbox
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('audit')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'audit'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Code Audit
          </button>
        </div>
      </div>

      {/* Tab Content Placeholders */}
      {activeTab === 'concept' && (
        <div className="p-6 bg-surface-raised border border-surface-overlay rounded-lg space-y-3">
          <h2 className="text-xl font-bold text-gray-100">Concept Digest</h2>
          <p className="text-sm text-gray-400">
            Plain-English explanation will appear here.
          </p>
        </div>
      )}

      {activeTab === 'sandbox' && (
        <div className="p-6 bg-surface-raised border border-surface-overlay rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[350px]">
            <div className="p-4 rounded border border-dashed border-surface-overlay bg-surface-base flex items-center justify-center min-h-[160px]">
              <span className="text-sm text-gray-500 font-mono">Code Editor</span>
            </div>
            <div className="p-4 rounded border border-dashed border-surface-overlay bg-surface-base flex items-center justify-center min-h-[160px]">
              <span className="text-sm text-gray-500 font-mono">Canvas Preview</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="p-6 bg-surface-raised border border-surface-overlay rounded-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Code Audit</h2>
          <div className="space-y-3">
            <div className="p-3 bg-surface-base rounded border border-surface-overlay text-sm text-gray-500">
              Memory Trace
            </div>
            <div className="p-3 bg-surface-base rounded border border-surface-overlay text-sm text-gray-500">
              Complexity Analysis
            </div>
            <div className="p-3 bg-surface-base rounded border border-surface-overlay text-sm text-gray-500">
              Common Pitfalls
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
