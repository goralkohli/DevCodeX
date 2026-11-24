import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { tracks } from '../data/tracks.js'
import NotFoundPage from './NotFoundPage'
import CodeSandbox from '../components/CodeSandbox'
import GlassBoxOverlay from '../components/GlassBoxOverlay'
import radialAudit from '../data/audits/radial-coordinates.json'
import starAudit from '../data/audits/parametric-star.json'
import transformsAudit from '../data/audits/coordinate-transforms.json'
import bezierAudit from '../data/audits/bezier-curves.json'
import strokeAudit from '../data/audits/stroke-animation.json'

const VALID_TABS = ['concept', 'sandbox', 'audit']

const auditsByTopic = {
  'radial-coordinates': radialAudit,
  'parametric-star': starAudit,
  'coordinate-transforms': transformsAudit,
  'bezier-curves': bezierAudit,
  'stroke-animation': strokeAudit,
}

export default function TopicPage() {
  const { trackId, topicId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [showOverlay, setShowOverlay] = useState(false)
  const [isEditorHovered, setIsEditorHovered] = useState(false)
  const [previewDimensions, setPreviewDimensions] = useState({ width: 300, height: 300 })
  const [isPaperMode, setIsPaperMode] = useState(false)
  const [copiedRecipe, setCopiedRecipe] = useState(false)
  const [ahaToast, setAhaToast] = useState(null)
  const [liveState, setLiveState] = useState({ offset: 500, totalLength: 500, progress: 0 })
  const codeSandboxRef = useRef(null)

  const track = tracks[trackId]
  const topic = track?.topics?.[topicId]
  const lesson = topic?.lesson
  const audit = auditsByTopic[topicId]

  const tabParam = searchParams.get('tab')
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'concept'

  // Reset per-sandbox volatile state on topic change
  useEffect(() => {
    setIsPaperMode(false)
    setShowOverlay(false)
    setIsEditorHovered(false)
    setLiveState({ offset: 500, totalLength: 500, progress: 0 })
  }, [topicId])

  // Handle hash scrolling on mount, tab change, and hash change
  useEffect(() => {
    if (!window.location.hash) return
    const id = window.location.hash.slice(1)
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [searchParams, location.hash, activeTab])

  // PostMessage listener for animation-progress from iframe (Lesson 5)
  useEffect(() => {
    const handleProgressMessage = (event) => {
      if (event.data && event.data.type === 'animation-progress') {
        const { offset, totalLength } = event.data
        const progress = totalLength > 0 ? Math.max(0, Math.min(1, (totalLength - offset) / totalLength)) : 0
        setLiveState({ offset, totalLength, progress })
      }
    }
    window.addEventListener('message', handleProgressMessage)
    return () => window.removeEventListener('message', handleProgressMessage)
  }, [])

  if (!track || !topic) {
    return <NotFoundPage />
  }

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab })
  }

  const handlePreviewRendered = (data) => {
    setPreviewDimensions({
      width: data.canvasWidth || 300,
      height: data.canvasHeight || 300,
    })

    if (!lesson || !lesson.challengeAnswer) return

    // Completion detection per Part F
    const currentCode = codeSandboxRef.current?.getCode?.() || ''
    const normStudent = currentCode.trim().replace(/\s+/g, ' ').replace(/;+\s*$/, '').toLowerCase()
    const normAnswer = lesson.challengeAnswer.trim().replace(/\s+/g, ' ').replace(/;+\s*$/, '').toLowerCase()

    if (normAnswer && normStudent.includes(normAnswer)) {
      try {
        const storedList = localStorage.getItem('devcodex.completedChallenges')
        const completed = storedList ? JSON.parse(storedList) : []
        if (Array.isArray(completed) && !completed.includes(topicId)) {
          const nextCompleted = [...completed, topicId]
          const storedCount = parseInt(localStorage.getItem('devcodex.ahaCount') || '0', 10) || 0
          const nextCount = storedCount + 1

          localStorage.setItem('devcodex.completedChallenges', JSON.stringify(nextCompleted))
          localStorage.setItem('devcodex.ahaCount', String(nextCount))

          window.dispatchEvent(
            new CustomEvent('devcodex:aha-moment', {
              detail: { count: nextCount, lessonId: topicId },
            })
          )

          setAhaToast('Aha! You unlocked this concept.')
          setTimeout(() => setAhaToast(null), 2000)
        }
      } catch (err) {
        console.error('Error updating Aha counter:', err)
      }
    }
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
        <div className="space-y-6">
          {/* Production Recipe Card */}
          {lesson?.solutionRecipe && (
            <div className="bg-surface-raised border border-surface-overlay rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-surface-overlay mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                    Production Recipe
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-base border border-surface-overlay text-gray-400">
                    Clean Implementation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(lesson.solutionRecipe.code)
                      setCopiedRecipe(true)
                      setTimeout(() => setCopiedRecipe(false), 1500)
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium rounded bg-surface-base border border-surface-overlay text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                >
                  {copiedRecipe ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto p-3 rounded bg-surface-base border border-surface-overlay mb-3">
                <code>{lesson.solutionRecipe.code}</code>
              </pre>
              {lesson.solutionRecipe.compatNote && (
                <p className="text-xs text-gray-400 italic">
                  ℹ️ {lesson.solutionRecipe.compatNote}
                </p>
              )}
            </div>
          )}

          {/* Concept Explanation Card */}
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
        </div>
      )}

      {/* Sandbox Tab */}
      {activeTab === 'sandbox' && (
        <div className="space-y-4">
          {lesson ? (
            <div className="space-y-4">
              {/* Controls Bar: Paper Mode Toggle & Status */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setIsPaperMode((prev) => !prev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                    isPaperMode
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-raised text-gray-300 border-surface-overlay hover:text-white hover:border-gray-500'
                  }`}
                >
                  <span>📝 Paper Mode</span>
                  {isPaperMode && <span className="text-[10px] bg-white/20 px-1 rounded">Active</span>}
                </button>

                {ahaToast && (
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 animate-pulse">
                    ✨ {ahaToast}
                  </div>
                )}
              </div>

              {/* Paper Mode Screen */}
              {isPaperMode ? (
                <div className="p-8 rounded-lg bg-surface-raised border border-surface-overlay text-center space-y-4 max-w-xl mx-auto my-6 shadow-sm">
                  <div className="text-3xl">📝</div>
                  <h3 className="text-lg font-bold text-gray-100">Physical Scratchpad / Paper Mode</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Challenge: Write the single missing line on a physical piece of paper or think it through, then click &apos;Ready to Compare&apos; to verify in code.
                  </p>
                  <div className="p-3 rounded bg-surface-base border border-surface-overlay text-xs font-mono text-primary text-left">
                    🎯 {lesson.challenge?.prompt}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Restores editor & preview without modifying code or counting towards Aha Counter
                      setIsPaperMode(false)
                    }}
                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-md"
                  >
                    Ready to Compare
                  </button>
                </div>
              ) : (
                <>
                  <CodeSandbox
                    ref={codeSandboxRef}
                    key={topicId}
                    files={{ '/index.js': lesson.starterCode }}
                    template="vanilla"
                    editable={true}
                    challengeBlankId={topicId}
                    onRevealSolution={() => {}}
                    hoveredLineRange={lesson.challenge?.blankLineRange}
                    challengePrompt={lesson.challenge?.prompt}
                    solutionCode={lesson.solutionCode}
                    isOverlayVisible={showOverlay || isEditorHovered}
                    onToggleOverlay={() => setShowOverlay((prev) => !prev)}
                    onEditorHoverChange={setIsEditorHovered}
                    onLineHover={setIsEditorHovered}
                    onPreviewRendered={handlePreviewRendered}
                    previewOverlay={
                      <GlassBoxOverlay
                        type={lesson.overlay?.type || 'radial'}
                        params={lesson.overlay?.params}
                        liveState={liveState}
                        visible={showOverlay || isEditorHovered}
                      />
                    }
                  />

                  {/* Tweak Levers Panel */}
                  {Array.isArray(lesson.tweaks) && lesson.tweaks.length > 0 && (
                    <div className="p-4 rounded-lg bg-surface-raised border border-surface-overlay space-y-3">
                      <div className="flex items-center space-x-2 pb-2 border-b border-surface-overlay">
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                          Tweak Levers
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-base text-gray-400 border border-surface-overlay">
                          Live Adjustments
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {lesson.tweaks.map((tweak, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded bg-surface-base border border-surface-overlay space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-200">{tweak.label}</span>
                              <span className="px-1.5 py-0.5 rounded bg-surface-overlay text-[10px] font-mono text-primary font-semibold">
                                L{tweak.line}
                              </span>
                            </div>
                            <div className="font-mono text-indigo-400 text-[11px]">{tweak.variable}</div>
                            <p className="text-gray-400 text-[11px] leading-relaxed">{tweak.hint}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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

              {/* Execution Trace Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Execution Trace &amp; Memory Allocation
                </h3>
                <div className="space-y-3">
                  {audit.executionTrace?.map((step) => (
                    <div
                      key={step.step}
                      id={`step-${step.step}`}
                      className="p-4 bg-surface-raised border border-surface-overlay rounded-lg flex items-start space-x-4 scroll-mt-24 transition-colors hover:border-gray-600"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary text-primary flex items-center justify-center text-xs font-bold font-mono">
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-200">
                            {step.action}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-indigo-300 bg-surface-base px-2.5 py-1.5 rounded border border-surface-overlay overflow-x-auto">
                          {step.codeLine}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {step.memoryDetail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls Section */}
              <div className="space-y-4 pt-4 border-t border-surface-overlay">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Production Pitfalls &amp; System Traps
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {audit.pitfalls?.map((pitfall) => (
                    <div
                      key={pitfall.id}
                      id={`pitfall-${pitfall.id}`}
                      className="p-5 bg-surface-raised border border-surface-overlay rounded-lg space-y-3 scroll-mt-24 transition-colors hover:border-gray-600"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-gray-100 flex items-center space-x-2">
                          <span>{pitfall.title}</span>
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            pitfall.severity === 'high'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}
                        >
                          {pitfall.severity} severity
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {pitfall.description}
                      </p>

                      {/* Snippet Comparison Diffs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                            Anti-Pattern (Bad)
                          </div>
                          <pre className="p-3 bg-surface-base border border-red-500/30 rounded text-[11px] font-mono text-red-300 overflow-x-auto whitespace-pre">
                            <code>{pitfall.badSnippet}</code>
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            Engineered Fix (Good)
                          </div>
                          <pre className="p-3 bg-surface-base border border-emerald-500/30 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                            <code>{pitfall.goodSnippet}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senior Engineer Interview Tip */}
              {audit.seniorInterviewTip && (
                <div
                  id="senior-insight"
                  className="p-5 bg-surface-raised border-l-4 border-l-primary border-t border-r border-b border-surface-overlay rounded-r-lg space-y-2 scroll-mt-24 transition-colors hover:border-gray-600"
                >
                  <div className="flex items-center space-x-2 text-primary font-bold text-sm">
                    <span>💡</span>
                    <span>Senior Engineer Interview Tip</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    &ldquo;{audit.seniorInterviewTip}&rdquo;
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
