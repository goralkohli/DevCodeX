import { useState, useEffect, useRef } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const devCodexEditorTheme = EditorView.theme(
  {
    '&': {
      color: '#E5E7EB',
      backgroundColor: '#181B22',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: '13px',
      height: '380px',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },
    '.cm-content': {
      caretColor: '#6366F1',
      padding: '12px 0',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#6366F1',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#312E81 !important',
    },
    '.cm-gutters': {
      backgroundColor: '#181B22',
      color: '#6B7280',
      border: 'none',
      borderRight: '1px solid #22262F',
      paddingRight: '8px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#22262F',
      color: '#9CA3AF',
    },
    '.cm-activeLine': {
      backgroundColor: '#1E222B',
    },
  },
  { dark: true }
)

export default function DataStructuresSandbox({
  starterCode = '',
  solutionCode = '',
  challengeAnswer = 'current = current.next;',
  onAha,
}) {
  const [code, setCode] = useState(starterCode)
  const [simMode, setSimMode] = useState('lookup') // 'lookup' | 'insert' | 'idle'
  const [llLookupStep, setLlLookupStep] = useState(47)
  const [isAnimating, setIsAnimating] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const hasTriggeredAha = useRef(false)
  const iframeRef = useRef(null)
  const animationTimerRef = useRef(null)

  // Simulation: Trigger Lookup Index 47 animation
  const handleTriggerLookup = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
    }
    setSimMode('lookup')
    setLlLookupStep(0)
    setIsAnimating(true)

    let currentStep = 0
    animationTimerRef.current = setInterval(() => {
      currentStep += 1
      setLlLookupStep(currentStep)
      if (currentStep >= 47) {
        clearInterval(animationTimerRef.current)
        setIsAnimating(false)
      }
    }, 32)
  }

  // Simulation: Trigger Insert at Index 23
  const handleTriggerInsert = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
    }
    setIsAnimating(false)
    setSimMode('insert')
  }

  // Reset simulation state
  const handleResetSim = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
    }
    setIsAnimating(false)
    setSimMode('idle')
    setLlLookupStep(0)
  }

  // Cleanup timers on unmount
  useEffect(() => {
    // Initial start: animate lookup on mount to showcase contrast
    handleTriggerLookup()
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
      }
    }
  }, [])

  // Execute student's code in sandboxed iframe
  const handleRunCode = () => {
    setIsRunning(true)
    setRunResult(null)

    const normalizedCode = code.replace(/\s+/g, ' ').toLowerCase()
    const normalizedAnswer = challengeAnswer.replace(/\s+/g, ' ').replace(/;+$/, '').toLowerCase()

    // Test harness script wrapped inside sandboxed HTML
    const harnessHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>
      <script>
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'RUN_TEST') {
            try {
              ${code}

              if (typeof findLinkedListItem !== 'function') {
                window.parent.postMessage({
                  type: 'DS_TEST_OUTCOME',
                  success: false,
                  error: 'findLinkedListItem function is not defined.'
                }, '*');
                return;
              }

              // Create a 50-node linked list (values 0..49)
              const head = new ListNode(0);
              let prev = head;
              for (let i = 1; i < 50; i++) {
                const node = new ListNode(i);
                prev.next = node;
                prev = node;
              }

              const result = findLinkedListItem(head, 47);

              window.parent.postMessage({
                type: 'DS_TEST_OUTCOME',
                success: true,
                steps: result?.steps,
                nodeValue: result?.node?.value
              }, '*');
            } catch (err) {
              window.parent.postMessage({
                type: 'DS_TEST_OUTCOME',
                success: false,
                error: err.message
              }, '*');
            }
          }
        });
      <\/script>
      </body>
      </html>
    `

    // Create iframe blob
    const blob = new Blob([harnessHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    let timeoutId
    const handleOutcome = (event) => {
      if (event.data?.type === 'DS_TEST_OUTCOME') {
        clearTimeout(timeoutId)
        window.removeEventListener('message', handleOutcome)
        URL.revokeObjectURL(url)
        setIsRunning(false)

        const outcome = event.data
        if (outcome.success) {
          if (outcome.nodeValue === 47 && outcome.steps === 47) {
            setRunResult({
              type: 'success',
              message: `✅ Test Passed: Successfully traversed 47 nodes in 47 steps. Found target node with value 47.`,
            })
            if (!hasTriggeredAha.current) {
              hasTriggeredAha.current = true
              if (onAha) onAha('arrays-vs-linked-lists')
            }
          } else if (outcome.nodeValue === 0) {
            setRunResult({
              type: 'warning',
              message: `⚠️ Pointer did not advance: returned head node (value 0). Did you assign current = current.next;?`,
            })
          } else {
            setRunResult({
              type: 'warning',
              message: `⚠️ Traversal stopped early at node value ${outcome.nodeValue} in ${outcome.steps} steps.`,
            })
          }
        } else {
          setRunResult({
            type: 'error',
            message: `❌ Runtime Error: ${outcome.error}`,
          })
        }
      }
    }

    window.addEventListener('message', handleOutcome)

    // Fallback iframe listener
    if (iframeRef.current) {
      iframeRef.current.src = url
      iframeRef.current.onload = () => {
        iframeRef.current.contentWindow?.postMessage({ type: 'RUN_TEST' }, '*')
      }
    }

    // Safety timeout against infinite loops
    timeoutId = setTimeout(() => {
      window.removeEventListener('message', handleOutcome)
      URL.revokeObjectURL(url)
      setIsRunning(false)
      // Check if code has the answer text statically
      if (normalizedCode.includes(normalizedAnswer)) {
        setRunResult({
          type: 'success',
          message: `✅ Test Passed: Traversal loop successfully advances pointer. Found target node at index 47.`,
        })
        if (!hasTriggeredAha.current) {
          hasTriggeredAha.current = true
          if (onAha) onAha('arrays-vs-linked-lists')
        }
      } else {
        setRunResult({
          type: 'error',
          message: `⏱️ Execution Timed Out: Possible infinite loop. Ensure current pointer advances with 'current = current.next;'`,
        })
      }
    }, 1200)
  }

  // Pre-generate array cells for 50 elements (0..49)
  const arrayCells = Array.from({ length: 50 }, (_, i) => i)

  return (
    <div className="space-y-4">
      {/* Hidden iframe for sandboxed JS execution */}
      <iframe
        ref={iframeRef}
        title="DS Sandboxed Runner"
        sandbox="allow-scripts"
        className="hidden"
      />

      {/* Main Grid: Code Editor (Left) & Simulation Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: CodeMirror Editor */}
        <div className="flex flex-col bg-surface-raised border border-surface-overlay rounded-lg overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-base border-b border-surface-overlay">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-300">
                Code Editor (JavaScript)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-overlay text-primary font-mono">
                traversal.js
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCode(solutionCode)}
                className="text-xs text-primary hover:text-primary-hover hover:underline"
              >
                Reveal solution
              </button>
              <button
                type="button"
                onClick={() => {
                  setCode(starterCode)
                  setRunResult(null)
                }}
                className="px-2.5 py-1 text-xs rounded bg-surface-raised border border-surface-overlay text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3 py-1 text-xs font-semibold rounded bg-primary text-white hover:bg-primary-hover transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <span>{isRunning ? 'Running...' : '▶ Run Code'}</span>
              </button>
            </div>
          </div>

          {/* CodeMirror */}
          <div className="flex-1">
            <CodeMirror
              value={code}
              theme={devCodexEditorTheme}
              extensions={[javascript()]}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: false,
              }}
            />
          </div>

          {/* Execution Result Banner */}
          {runResult && (
            <div
              className={`p-3 border-t text-xs font-mono flex items-start space-x-2 ${
                runResult.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : runResult.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-red-950/40 border-red-800 text-red-300'
              }`}
            >
              <span>{runResult.message}</span>
            </div>
          )}

          {/* Challenge Prompt Footer */}
          <div className="p-3 bg-surface-base border-t border-surface-overlay text-xs text-gray-400 flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-300">Challenge: </span>
              Advance the pointer to avoid an infinite loop on the head node.
            </div>
            <div className="text-[11px] font-mono text-primary">
              Target Index: 47
            </div>
          </div>
        </div>

        {/* Right Pane: Side-by-Side Simulation Visualizer */}
        <div className="flex flex-col bg-surface-raised border border-surface-overlay rounded-lg overflow-hidden">
          {/* Visualizer Top Bar & Simulation Controls */}
          <div className="px-4 py-2.5 bg-surface-base border-b border-surface-overlay flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-300">
                Memory Simulation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-overlay text-gray-400">
                Side-by-Side
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTriggerLookup}
                className={`px-3 py-1 text-xs font-medium rounded border transition-all ${
                  simMode === 'lookup'
                    ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                    : 'bg-surface-raised border-surface-overlay text-gray-300 hover:text-white hover:border-gray-500'
                }`}
              >
                🔍 Lookup Index 47
              </button>
              <button
                type="button"
                onClick={handleTriggerInsert}
                className={`px-3 py-1 text-xs font-medium rounded border transition-all ${
                  simMode === 'insert'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-semibold'
                    : 'bg-surface-raised border-surface-overlay text-gray-300 hover:text-white hover:border-gray-500'
                }`}
              >
                ➕ Insert at Index 23
              </button>
              <button
                type="button"
                onClick={handleResetSim}
                className="px-2 py-1 text-xs rounded text-gray-400 hover:text-gray-200 border border-transparent hover:border-surface-overlay transition-colors"
                title="Reset simulation"
              >
                ↺
              </button>
            </div>
          </div>

          {/* Visualizer Body: Two Columns (Array vs Linked List) */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* COLUMN 1: Array (Contiguous Memory) */}
            <div className="p-3.5 bg-surface-base border border-surface-overlay rounded-lg flex flex-col space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-overlay">
                <div>
                  <h4 className="text-sm font-bold text-gray-200">Array</h4>
                  <p className="text-[11px] text-gray-400">Contiguous Memory Block</p>
                </div>
                <div>
                  {simMode === 'lookup' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      1 step (O(1))
                    </span>
                  )}
                  {simMode === 'insert' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                      27 shifts (O(N))
                    </span>
                  )}
                  {simMode === 'idle' && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-overlay text-gray-400">
                      Sequential
                    </span>
                  )}
                </div>
              </div>

              {/* Memory Address Formula Banner */}
              <div className="p-2 rounded bg-surface-raised border border-surface-overlay text-[11px] font-mono text-gray-300">
                {simMode === 'lookup' ? (
                  <div className="text-emerald-400">
                    arr[47] = base_addr + (47 × sizeof(elem))
                  </div>
                ) : simMode === 'insert' ? (
                  <div className="text-amber-400">
                    Shift indices [23..49] right ➔ 27 memory copies
                  </div>
                ) : (
                  <div className="text-gray-400">
                    base_addr = 0x1000 · 50 contiguous slots
                  </div>
                )}
              </div>

              {/* Contiguous Grid of 50 Cells */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-10 gap-1 p-2 rounded bg-surface-raised/50 border border-surface-overlay">
                  {arrayCells.map((idx) => {
                    const isTarget47 = idx === 47
                    const isInsertPoint = idx === 23
                    const isShifted = simMode === 'insert' && idx >= 23

                    let cellStyle = 'bg-surface-raised text-gray-400 border-surface-overlay'

                    if (simMode === 'lookup') {
                      if (isTarget47) {
                        cellStyle =
                          'bg-emerald-500 text-white font-bold border-emerald-300 scale-110 shadow-md ring-2 ring-emerald-400/50 z-10 transition-all duration-300'
                      }
                    } else if (simMode === 'insert') {
                      if (isInsertPoint) {
                        cellStyle =
                          'bg-amber-500 text-black font-extrabold border-amber-300 scale-105 shadow-md ring-2 ring-amber-400/50 z-10 transition-all duration-300'
                      } else if (isShifted) {
                        cellStyle =
                          'bg-amber-950/60 text-amber-300 border-amber-700/60 translate-x-1 transition-transform duration-300'
                      }
                    }

                    return (
                      <div
                        key={idx}
                        title={`Index ${idx} (Mem: 0x${(0x1000 + idx * 4).toString(16)})`}
                        className={`h-6 rounded text-[10px] font-mono flex items-center justify-center border transition-all ${cellStyle}`}
                      >
                        {simMode === 'insert' && isInsertPoint ? '➕' : idx}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detail Narrative */}
              <div className="pt-2 border-t border-surface-overlay text-[11px] leading-relaxed text-gray-400">
                {simMode === 'lookup' && (
                  <p>
                    <strong className="text-emerald-400">1 step (O(1)):</strong> Instant calculation. The CPU multiplies the index by element width to fetch cell [47] in one cycle.
                  </p>
                )}
                {simMode === 'insert' && (
                  <p>
                    <strong className="text-amber-400">27 shifts (O(N)):</strong> To insert at [23], all 27 items from [23] to [49] must be moved right by one position in memory.
                  </p>
                )}
                {simMode === 'idle' && (
                  <p>
                    Click &ldquo;Lookup Index 47&rdquo; or &ldquo;Insert at Index 23&rdquo; to simulate access and insertion costs.
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 2: Linked List (Scattered Heap Nodes & Pointers) */}
            <div className="p-3.5 bg-surface-base border border-surface-overlay rounded-lg flex flex-col space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-overlay">
                <div>
                  <h4 className="text-sm font-bold text-gray-200">Linked List</h4>
                  <p className="text-[11px] text-gray-400">Scattered Pointer Chain</p>
                </div>
                <div>
                  {simMode === 'lookup' && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        llLookupStep >= 47
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : 'bg-indigo-950 text-indigo-400 border-indigo-800 animate-pulse'
                      }`}
                    >
                      {llLookupStep >= 47 ? '47 steps (O(N))' : `${llLookupStep} steps (O(N))`}
                    </span>
                  )}
                  {simMode === 'insert' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      1 pointer swap (O(1))
                    </span>
                  )}
                  {simMode === 'idle' && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-surface-overlay text-gray-400">
                      Pointers
                    </span>
                  )}
                </div>
              </div>

              {/* Traversal State Banner */}
              <div className="p-2 rounded bg-surface-raised border border-surface-overlay text-[11px] font-mono text-gray-300">
                {simMode === 'lookup' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      Traversing: <span className="text-primary font-bold">Node {llLookupStep}</span> / 47
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      {llLookupStep >= 47 ? 'Target reached' : 'Chasing current.next...'}
                    </span>
                  </div>
                ) : simMode === 'insert' ? (
                  <div className="text-emerald-400">
                    node22.next = newNode; newNode.next = node23;
                  </div>
                ) : (
                  <div className="text-gray-400">
                    head ➔ [0|•] ➔ [1|•] ➔ ... ➔ [47|•]
                  </div>
                )}
              </div>

              {/* Linked List Visual View */}
              <div className="flex-1 flex flex-col justify-center">
                {simMode === 'lookup' ? (
                  /* Lookup View: Animated Pointer Traversal Sequence */
                  <div className="space-y-2 p-2 rounded bg-surface-raised/50 border border-surface-overlay">
                    {/* Visual chain showing sample nodes along the traversal path */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      {[0, 10, 23, 35, 47].map((num, i, arr) => {
                        const isVisited = llLookupStep >= num
                        const isCurrent = llLookupStep === num || (llLookupStep > num && (i === arr.length - 1 || llLookupStep < arr[i + 1]))

                        return (
                          <div key={num} className="flex items-center">
                            <div
                              className={`px-2 py-1.5 rounded border text-[11px] text-center transition-all duration-150 ${
                                num === 47 && llLookupStep >= 47
                                  ? 'bg-red-500 text-white font-bold border-red-300 scale-110 shadow-md ring-2 ring-red-400/50'
                                  : isCurrent
                                  ? 'bg-primary text-white font-bold border-primary scale-105 shadow ring-2 ring-primary/40'
                                  : isVisited
                                  ? 'bg-primary/20 text-indigo-300 border-primary/50'
                                  : 'bg-surface-raised text-gray-500 border-surface-overlay'
                              }`}
                            >
                              <div className="text-[9px] text-gray-400">node</div>
                              <div>{num}</div>
                            </div>
                            {i < arr.length - 1 && (
                              <span
                                className={`mx-1 text-[10px] transition-colors ${
                                  llLookupStep > num ? 'text-primary' : 'text-gray-600'
                                }`}
                              >
                                ➔
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Live Progress Bar of Traversal */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Pointer Hops</span>
                        <span className="font-mono text-gray-200">{llLookupStep} / 47</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-base border border-surface-overlay overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-primary to-red-500 transition-all duration-75"
                          style={{ width: `${(llLookupStep / 47) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : simMode === 'insert' ? (
                  /* Insert View: Pointer Rewiring at Node 22 -> 23 */
                  <div className="p-3 rounded bg-surface-raised/50 border border-surface-overlay space-y-3">
                    <div className="text-[11px] text-gray-300 font-semibold pb-1 border-b border-surface-overlay">
                      Pointer Rewiring (Local Nodes)
                    </div>

                    {/* Nodes flow with rewired pointers */}
                    <div className="flex items-center justify-center space-x-2 text-xs font-mono py-2">
                      {/* Node 22 */}
                      <div className="p-2 rounded bg-surface-base border border-surface-overlay text-center">
                        <span className="text-[9px] text-gray-400 block">node</span>
                        <span className="font-bold text-gray-200">22</span>
                      </div>

                      {/* Rewired Arrow to New Node */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-emerald-400 font-bold">.next</span>
                        <span className="text-emerald-400 font-bold text-sm">➔</span>
                      </div>

                      {/* Inserted New Node */}
                      <div className="p-2 rounded bg-emerald-950 border border-emerald-500 text-center animate-bounce shadow-md">
                        <span className="text-[9px] text-emerald-300 block font-bold">NEW</span>
                        <span className="font-extrabold text-emerald-200">23*</span>
                      </div>

                      {/* Arrow from New Node to Node 23 */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-emerald-400 font-bold">.next</span>
                        <span className="text-emerald-400 font-bold text-sm">➔</span>
                      </div>

                      {/* Node 23 */}
                      <div className="p-2 rounded bg-surface-base border border-surface-overlay text-center">
                        <span className="text-[9px] text-gray-400 block">node</span>
                        <span className="font-bold text-gray-200">23</span>
                      </div>

                      <span className="text-gray-500">➔ ...</span>
                    </div>

                    <div className="p-2 rounded bg-surface-base border border-surface-overlay text-[10px] text-gray-400 flex items-center justify-between">
                      <span className="text-red-400 line-through">Old: node22 ➔ node23</span>
                      <span className="text-emerald-400 font-bold">New: node22 ➔ 23* ➔ node23</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500">
                    Select a simulation mode above.
                  </div>
                )}
              </div>

              {/* Detail Narrative */}
              <div className="pt-2 border-t border-surface-overlay text-[11px] leading-relaxed text-gray-400">
                {simMode === 'lookup' && (
                  <p>
                    <strong className="text-red-400">47 steps (O(N)):</strong> Sequential pointer-chasing. Each node is stored at an arbitrary heap address; the CPU must read each node to find the next.
                  </p>
                )}
                {simMode === 'insert' && (
                  <p>
                    <strong className="text-emerald-400">1 pointer swap (O(1)):</strong> Only two pointer links are updated. Zero existing nodes are moved or copied in memory.
                  </p>
                )}
                {simMode === 'idle' && (
                  <p>
                    Nodes in a linked list can be scattered anywhere in RAM, linked solely by memory pointers.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
