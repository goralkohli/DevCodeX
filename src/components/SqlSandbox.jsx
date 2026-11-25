import { useState, useEffect, useMemo } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'

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

export default function SqlSandbox({
  starterCode = '',
  solutionCode = '',
  challengeAnswer = '',
  onAha,
}) {
  const [code, setCode] = useState(starterCode)
  const [db, setDb] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [rowsScanned, setRowsScanned] = useState(null)
  const [timeMs, setTimeMs] = useState(null)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [hasRun, setHasRun] = useState(false)

  // Lazy-load sqlEngine only when SqlSandbox mounts
  useEffect(() => {
    let isMounted = true
    const loadSql = async () => {
      setIsLoading(true)
      try {
        const { initDb } = await import('../lib/sqlEngine.js')
        const database = await initDb()
        if (isMounted) {
          setDb(database)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(`Engine load error: ${err.message}`)
          setIsLoading(false)
        }
      }
    }
    loadSql()
    return () => {
      isMounted = false
    }
  }, [])

  // Execute query handler
  const handleRunQuery = async () => {
    if (!db) return
    setIsExecuting(true)
    setError(null)

    try {
      const { runQuery } = await import('../lib/sqlEngine.js')
      const outcome = await runQuery(db, code)

      setHasRun(true)
      if (outcome.error) {
        setError(outcome.error)
        setRowsScanned(0)
        setTimeMs(0)
        setResults([])
      } else {
        setRowsScanned(outcome.rowsScanned)
        setTimeMs(outcome.timeMs)
        setResults(outcome.result)
        setError(null)

        // Check if student solution satisfies the challenge
        if (challengeAnswer) {
          const normCode = code.trim().replace(/\s+/g, ' ').replace(/;+\s*$/, '').toLowerCase()
          const normAns = challengeAnswer.trim().replace(/\s+/g, ' ').replace(/;+\s*$/, '').toLowerCase()
          if (normCode.includes(normAns) && onAha) {
            onAha()
          }
        }
      }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setIsExecuting(false)
    }
  }

  const extensions = useMemo(() => [sql(), devCodexEditorTheme], [])

  return (
    <div className="w-full space-y-4">
      {isLoading ? (
        <div className="p-12 text-center bg-surface-raised border border-surface-overlay rounded-xl space-y-3">
          <div className="inline-block animate-spin text-2xl text-primary">⚙️</div>
          <p className="text-sm font-medium text-gray-200">
            Initializing WebAssembly SQL engine &amp; seeding 10,000 rows...
          </p>
          <p className="text-xs text-gray-500">
            Dynamically loaded via sql.js (zero main bundle bloat).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Pane: Code Editor & Controls */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1 min-h-[38px]">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                SQL Query Editor
              </span>
              <button
                type="button"
                onClick={handleRunQuery}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                <span>{isExecuting ? '⏳ Running...' : '▶ Run Query'}</span>
              </button>
            </div>

            <div className="rounded-lg border border-surface-overlay overflow-hidden shadow-sm bg-surface-raised">
              <CodeMirror
                value={code}
                height="380px"
                extensions={extensions}
                onChange={(val) => setCode(val)}
                theme="dark"
              />
            </div>

            {solutionCode && (
              <details className="group rounded-lg bg-surface-raised border border-surface-overlay overflow-hidden text-sm">
                <summary className="px-4 py-2.5 font-medium text-gray-400 hover:text-gray-200 cursor-pointer select-none transition-colors">
                  Reveal solution
                </summary>
                <div className="p-4 pt-1 border-t border-surface-overlay bg-surface-base">
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto p-3 rounded bg-surface-raised border border-surface-overlay">
                    <code>{solutionCode}</code>
                  </pre>
                </div>
              </details>
            )}
          </div>

          {/* Right Pane: Row-Scan Visualizer (DOM-based, NOT canvas) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between min-h-[38px] px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Row-Scan Visualizer
              </span>
              {hasRun && (
                <span className="text-xs font-mono text-gray-400">
                  {rowsScanned === 1 ? '⚡ Index Seek' : '🐢 Full Table Scan'}
                </span>
              )}
            </div>

            <div className="rounded-lg border border-surface-overlay bg-surface-raised p-6 flex flex-col justify-between h-[380px] overflow-y-auto space-y-4">
              {error ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span>⚠️ SQL Error:</span>
                  </div>
                  <p>{error}</p>
                </div>
              ) : !hasRun ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-gray-400">
                  <div className="text-4xl">📊</div>
                  <h4 className="text-sm font-semibold text-gray-200">
                    Ready to Profile Query
                  </h4>
                  <p className="text-xs max-w-xs leading-relaxed text-gray-400">
                    Click <span className="text-primary font-medium">&quot;Run Query&quot;</span> to execute your SQL against the 10,000-row table and view scan statistics.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Primary Scan Metric */}
                  <div className="space-y-1">
                    <div className="text-xs uppercase font-medium text-gray-400 tracking-wider">
                      Database Scan Cost
                    </div>
                    <div className="flex items-baseline gap-3">
                      <div
                        className={`text-4xl sm:text-5xl font-extrabold font-mono transition-colors ${
                          rowsScanned === 1 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {rowsScanned?.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-gray-400">
                        {rowsScanned === 1 ? 'Row Scanned (Indexed)' : 'Rows Scanned (Full Scan)'}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart Visualizing Scan Count */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                      <span>0 rows</span>
                      <span>Target: 1 row</span>
                      <span>10,000 rows</span>
                    </div>
                    <div className="w-full h-4 bg-surface-base border border-surface-overlay rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rowsScanned === 1
                            ? 'bg-emerald-500 w-[1%]'
                            : 'bg-red-500 w-full animate-pulse'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-overlay">
                    <div className="p-3 rounded bg-surface-base border border-surface-overlay">
                      <div className="text-[11px] text-gray-400 font-medium">Execution Time</div>
                      <div className="text-base font-bold font-mono text-gray-200">
                        {timeMs} ms
                      </div>
                    </div>
                    <div className="p-3 rounded bg-surface-base border border-surface-overlay">
                      <div className="text-[11px] text-gray-400 font-medium">Plan Strategy</div>
                      <div
                        className={`text-base font-bold font-mono ${
                          rowsScanned === 1 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {rowsScanned === 1 ? 'B-Tree Index' : 'Seq Scan'}
                      </div>
                    </div>
                  </div>

                  {/* Query Result Row Preview */}
                  {results && results.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-surface-overlay">
                      <div className="text-xs uppercase font-medium text-gray-400 tracking-wider">
                        Retrieved Record ({results.length})
                      </div>
                      <div className="p-2.5 rounded bg-surface-base border border-surface-overlay font-mono text-xs text-indigo-300 overflow-x-auto">
                        <div className="flex gap-4">
                          <span><strong className="text-gray-400">id:</strong> {results[0].id}</span>
                          <span><strong className="text-gray-400">name:</strong> {results[0].name}</span>
                          <span><strong className="text-gray-400">email:</strong> {results[0].email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
