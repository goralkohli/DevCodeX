import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { tracks } from '../data/tracks'
import NotFoundPage from './NotFoundPage'
import CodeSandbox from '../components/CodeSandbox'

const VALID_TABS = ['concept', 'sandbox', 'audit']

export default function TopicPage() {
  const { trackId, topicId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showOverlay, setShowOverlay] = useState(false)
  const [isEditorHovered, setIsEditorHovered] = useState(false)
  const [previewDimensions, setPreviewDimensions] = useState({ width: 300, height: 300 })

  const track = tracks[trackId]
  const topic = track?.topics?.[topicId]

  if (!track || !topic) {
    return <NotFoundPage />
  }

  const lesson = topic.lesson

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

      {/* Tab Content */}
      {activeTab === 'concept' && (
        <div className="p-6 bg-surface-raised border border-surface-overlay rounded-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-100">
            {lesson?.concept?.heading || 'Concept Digest'}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            {lesson?.concept?.body || 'Plain-English explanation will appear here.'}
          </p>
          {lesson?.concept?.analogy && (
            <div className="p-4 rounded-md bg-surface-base border border-surface-overlay text-sm text-gray-400 italic">
              💡 {lesson.concept.analogy}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sandbox' && (
        <div className="space-y-4">
          {lesson ? (
            <CodeSandbox
              files={{ '/index.js': lesson.starterCode }}
              template="vanilla"
              editable={true}
              challengeBlankId="radius"
              onRevealSolution={() => {}}
              hoveredLineRange={lesson.challenge?.blankLineRange}
              challengePrompt={lesson.challenge?.prompt}
              solutionCode={lesson.solutionCode}
              isOverlayVisible={showOverlay || isEditorHovered}
              onToggleOverlay={() => setShowOverlay((prev) => !prev)}
              onEditorHoverChange={setIsEditorHovered}
              onPreviewRendered={(data) => {
                setPreviewDimensions({
                  width: data.canvasWidth || 300,
                  height: data.canvasHeight || 300,
                })
              }}
            />
          ) : (
            <div className="p-6 bg-surface-raised border border-surface-overlay rounded-lg text-sm text-gray-400">
              No sandbox lesson configured for this topic.
            </div>
          )}
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
