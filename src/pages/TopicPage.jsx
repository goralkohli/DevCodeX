import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { tracks } from '../data/tracks'
import NotFoundPage from './NotFoundPage'
import CodeSandbox from '../components/CodeSandbox'
import radialAudit from '../data/audits/radial-coordinates.json'

const VALID_TABS = ['concept', 'sandbox', 'audit']

const auditsByTopic = {
  'radial-coordinates': radialAudit,
}

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
  const audit = auditsByTopic[topicId]

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

      {/* Concept Tab */}
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

      {/* Sandbox Tab */}
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
              onLineHover={setIsEditorHovered}
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

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {!audit ? (
            <div className="p-8 text-center bg-surface-raised border border-surface-overlay rounded-lg text-sm text-gray-400">
              Audit content currently being indexed by DeepSeek.
            </div>
          ) : (
            <>
              {/* Header with Complexity Badges */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-overlay">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Code Audit &amp; Systems Trace</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Automated build-time analysis generated via DeepSeek
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    title={audit.complexity.explanation}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface-base border border-surface-overlay text-primary cursor-help"
                  >
                    Time {audit.complexity.time}
                  </span>
                  <span
                    title={audit.complexity.explanation}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface-base border border-surface-overlay text-primary cursor-help"
                  >
                    Space {audit.complexity.space}
                  </span>
                </div>
              </div>

              {/* Execution Trace */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-100">Execution Trace</h3>
                <ol className="space-y-3">
                  {audit.executionTrace.map((item) => (
                    <li
                      key={item.step}
                      className="p-4 rounded-lg bg-surface-raised border border-surface-overlay space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          Step {item.step}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-base border border-surface-overlay text-primary">
                          {item.action}
                        </span>
                      </div>
                      <pre className="p-2.5 rounded bg-surface-base border border-surface-overlay text-xs font-mono text-gray-200 overflow-x-auto">
                        <code>{item.codeLine}</code>
                      </pre>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {item.memoryDetail}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Production Pitfalls */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-100">Production Pitfalls</h3>
                <div className="space-y-4">
                  {audit.pitfalls.map((pitfall) => {
                    const severityStyles = {
                      high: 'bg-red-500/10 text-red-400 border border-red-500/30',
                      medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                      low: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
                    }[pitfall.severity] || 'bg-slate-500/10 text-slate-400 border border-slate-500/30'

                    return (
                      <div
                        key={pitfall.id}
                        className="p-5 rounded-lg bg-surface-raised border border-surface-overlay space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base font-semibold text-gray-100">
                            {pitfall.title}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${severityStyles}`}>
                            {pitfall.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {pitfall.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-red-400">❌ Bad</span>
                            <pre className="p-3 rounded bg-surface-base border-l-2 border-red-500 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre">
                              <code>{pitfall.badSnippet}</code>
                            </pre>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-green-400">✅ Good</span>
                            <pre className="p-3 rounded bg-surface-base border-l-2 border-green-500 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre">
                              <code>{pitfall.goodSnippet}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Senior Engineering Insight Callout */}
              <div className="border-l-4 border-primary bg-surface-raised p-4 rounded-r-lg space-y-1">
                <h4 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
                  <span>💡</span> Senior Engineering Insight
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {audit.seniorInterviewTip}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
