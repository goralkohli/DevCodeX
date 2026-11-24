import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
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

const CodeSandbox = forwardRef(function CodeSandbox(
  {
    files = {},
    template = 'vanilla',
    editable = true,
    challengeBlankId,
    onRevealSolution,
    hoveredLineRange,
    onPreviewRendered,
    previewOverlay,
    challengePrompt,
    solutionCode,
    showRadiiToggle = true,
    isOverlayVisible = false,
    onToggleOverlay,
    onEditorHoverChange,
    onLineHover,
  },
  ref
) {
  const initialCode = typeof files['/index.js'] === 'string'
    ? files['/index.js']
    : files['/index.js']?.code || ''

  const [code, setCode] = useState(initialCode)
  const [blobUrl, setBlobUrl] = useState('')
  const [isRendered, setIsRendered] = useState(false)
  const iframeRef = useRef(null)

  // Sync if initialCode actually changes to a different string
  const prevInitialRef = useRef(initialCode)
  useEffect(() => {
    if (prevInitialRef.current !== initialCode) {
      prevInitialRef.current = initialCode
      setCode(initialCode)
    }
  }, [initialCode])

  useImperativeHandle(ref, () => ({
    isRendered,
    getCode: () => code,
    setCode: (newCode) => setCode(newCode),
  }))

  // Listen for preview-rendered message from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'preview-rendered') {
        setIsRendered(true)
        if (onPreviewRendered) {
          onPreviewRendered(event.data)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onPreviewRendered])

  // Build Blob URL whenever code changes
  useEffect(() => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: #0F1115;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #preview {
      display: block;
      background: #0F1115;
      border: 1px solid #22262F;
      border-radius: 6px;
      width: 300px;
      height: 300px;
    }
    #error-overlay {
      display: none;
      position: absolute;
      inset: 16px;
      background: rgba(24, 27, 34, 0.96);
      border: 1px solid #EF4444;
      border-radius: 6px;
      padding: 16px;
      color: #F87171;
      font-size: 13px;
      font-family: monospace;
      overflow: auto;
      white-space: pre-wrap;
      z-index: 10;
    }
  </style>
</head>
<body>
  <canvas id="preview" width="300" height="300"></canvas>
  <div id="error-overlay"></div>
  <script>
    // Alias 'canvas' to 'preview' so starter codes using either ID resolve cleanly
    var _origGetElementById = document.getElementById.bind(document);
    document.getElementById = function(id) {
      if (id === 'canvas' || id === 'preview') {
        return _origGetElementById('preview') || _origGetElementById('canvas');
      }
      return _origGetElementById(id);
    };

    /**
     * POSTMESSAGE CONTRACT FOR ANIMATION-PROGRESS
     * -------------------------------------------------------------
     * Message shape: { type: 'animation-progress', offset: number, totalLength: number }
     * Throttle: posts on every 2nd animation frame (~30fps at 60Hz display refresh)
     * Hook point: wrapped around CanvasRenderingContext2D.prototype.stroke
     * Lifecycle: dispatched from iframe to window.parent; host unsubscribes on unmount
     */
    var frameCount = 0;
    var origStroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function() {
      var res = origStroke.apply(this, arguments);
      if (typeof this.lineDashOffset === 'number' && window.parent) {
        frameCount++;
        if (frameCount % 2 === 0) {
          var dash = this.getLineDash ? this.getLineDash() : [];
          var total = (dash && dash[0]) ? dash[0] : 500;
          window.parent.postMessage({
            type: 'animation-progress',
            offset: this.lineDashOffset,
            totalLength: total
          }, '*');
        }
      }
      return res;
    };

    function showError(err) {
      var overlay = document.getElementById('error-overlay');
      if (overlay) {
        overlay.style.display = 'block';
        overlay.textContent = 'Preview Error:\\n' + (err.stack || err.message || err);
      }
    }
    window.addEventListener('error', function(e) {
      showError(e.error || e.message);
    });
  </script>
  <script>
    try {
      ${code}

      var c = document.getElementById('preview');
      if (c && window.parent) {
        window.parent.postMessage({
          type: 'preview-rendered',
          canvasWidth: c.width || 300,
          canvasHeight: c.height || 300
        }, '*');
      }
    } catch (err) {
      showError(err);
    }
  </script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [code])

  // CodeMirror extensions including line hover detection
  const extensions = useMemo(() => {
    const exts = [javascript({ jsx: true }), devCodexEditorTheme]
    if (onLineHover || onEditorHoverChange) {
      exts.push(
        EditorView.domEventHandlers({
          mouseover(event, view) {
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
            if (pos !== null) {
              const line = view.state.doc.lineAt(pos)
              const [start = 10, end = 15] = hoveredLineRange || [10, 15]
              if (line.number >= start && line.number <= end) {
                if (onLineHover) onLineHover(true)
              } else {
                if (onLineHover) onLineHover(false)
              }
            }
          },
          mouseleave() {
            if (onLineHover) onLineHover(false)
          },
        })
      )
    }
    return exts
  }, [hoveredLineRange, onLineHover, onEditorHoverChange])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Pane: Code Editor */}
        <div className="flex flex-col space-y-3">
          {challengePrompt && (
            <div className="px-4 py-2.5 rounded-lg bg-surface-raised border border-surface-overlay text-sm text-gray-200 font-medium">
              🎯 Challenge: {challengePrompt}
            </div>
          )}

          <div
            className="rounded-lg border border-surface-overlay overflow-hidden shadow-sm bg-surface-raised"
            onMouseEnter={() => onEditorHoverChange && onEditorHoverChange(true)}
            onMouseLeave={() => onEditorHoverChange && onEditorHoverChange(false)}
          >
            <CodeMirror
              value={code}
              height="380px"
              editable={editable}
              extensions={extensions}
              onChange={(value) => setCode(value)}
              theme="dark"
            />
          </div>

          {solutionCode && (
            <details className="group rounded-lg bg-surface-raised border border-surface-overlay overflow-hidden text-sm">
              <summary
                className="px-4 py-2.5 font-medium text-gray-400 hover:text-gray-200 cursor-pointer select-none transition-colors"
                onClick={() => onRevealSolution && onRevealSolution()}
              >
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

        {/* Right Pane: Iframe Preview */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between min-h-[38px] px-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Canvas Preview
            </span>
            {showRadiiToggle && (
              <button
                type="button"
                onClick={onToggleOverlay}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                  isOverlayVisible
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-raised text-gray-400 border-surface-overlay hover:text-gray-200'
                }`}
              >
                {isOverlayVisible ? 'Hide guide' : 'Show guide'}
              </button>
            )}
          </div>

          <div className="relative rounded-lg border border-surface-overlay overflow-hidden shadow-sm bg-surface-raised flex items-center justify-center h-[380px]">
            {blobUrl && (
              <iframe
                ref={iframeRef}
                src={blobUrl}
                title="Canvas Sandbox Preview"
                className="w-full h-full border-0 bg-surface-base"
                sandbox="allow-scripts allow-same-origin"
              />
            )}

            {/* Glass-box overlay */}
            {isOverlayVisible && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {previewOverlay || (
                  <svg
                    viewBox="0 0 300 300"
                    className="w-[300px] h-[300px] pointer-events-none"
                  >
                    {/* Inner radius r0 = 0 (point) */}
                    <circle
                      cx="150"
                      cy="150"
                      r="3"
                      className="stroke-primary fill-primary"
                      strokeWidth="1"
                    />
                    <text
                      x="156"
                      y="146"
                      className="fill-primary text-[10px] font-mono font-medium"
                    >
                      r₀ = 0
                    </text>

                    {/* Outer radius r1 = 100 */}
                    <circle
                      cx="150"
                      cy="150"
                      r="100"
                      className="stroke-primary fill-primary/10"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="155"
                      y="46"
                      className="fill-primary text-[10px] font-mono font-medium"
                    >
                      r₁ = 100
                    </text>
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default CodeSandbox
