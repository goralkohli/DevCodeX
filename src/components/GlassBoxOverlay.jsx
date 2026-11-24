import React from 'react'

/**
 * Unified GlassBoxOverlay component
 * Provides visual geometric guides superimposed directly over the 300x300 Canvas preview.
 *
 * @param {'radial' | 'axes' | 'bezier-handles' | 'progress-vector'} type
 * @param {object} params Coordinates, radii, control points, or dimensions
 * @param {object} [liveState] Dynamic runtime state from postMessage (e.g. offset, progress)
 * @param {boolean} visible Controlled visibility toggle
 */
export default function GlassBoxOverlay({ type, params = {}, liveState, visible }) {
  if (!visible) return null

  const width = params.width || 300
  const height = params.height || 300

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-[300px] h-[300px] pointer-events-none"
    >
      <defs>
        {/* Arrowhead marker for X axis */}
        <marker
          id="marker-arrow-x"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" className="fill-primary" />
        </marker>

        {/* Arrowhead marker for Y axis */}
        <marker
          id="marker-arrow-y"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" className="fill-indigo-400" />
        </marker>
      </defs>

      {/* 1. RADIAL OVERLAY */}
      {type === 'radial' && (
        <g>
          {params.r0 === 0 ? (
            <>
              <circle
                cx={params.cx ?? 150}
                cy={params.cy ?? 150}
                r="3"
                className="stroke-primary fill-primary"
                strokeWidth="1"
              />
              {params.labels !== false && (
                <text
                  x={(params.cx ?? 150) + 6}
                  y={(params.cy ?? 150) - 4}
                  className="fill-primary text-[10px] font-mono font-medium"
                >
                  {params.innerLabel || `r₀ = 0`}
                </text>
              )}
            </>
          ) : (
            <>
              <circle
                cx={params.cx ?? 150}
                cy={params.cy ?? 150}
                r={params.r0}
                className="stroke-primary fill-primary/10"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {params.labels !== false && (
                <text
                  x={(params.cx ?? 150) + 5}
                  y={(params.cy ?? 150) - params.r0 - 5}
                  className="fill-primary text-[10px] font-mono font-medium"
                >
                  {params.innerLabel || `r₀ = ${params.r0}`}
                </text>
              )}
            </>
          )}

          <circle
            cx={params.cx ?? 150}
            cy={params.cy ?? 150}
            r={params.r1 ?? 100}
            className="stroke-primary fill-primary/10"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {params.labels !== false && (
            <text
              x={(params.cx ?? 150) + 5}
              y={(params.cy ?? 150) - (params.r1 ?? 100) - 4}
              className="fill-primary text-[10px] font-mono font-medium"
            >
              {params.outerLabel || (params.r0 === 0 ? `r₁ = ${params.r1 ?? 100}` : `r₁ = ${params.r1 ?? 100}`)}
            </text>
          )}
        </g>
      )}

      {/* 2. AXES OVERLAY */}
      {type === 'axes' && (() => {
        const cx = params.cx ?? 150
        const cy = params.cy ?? 150
        const length = params.length ?? 100
        const angleDeg = params.angleDeg ?? 45
        const radX = (angleDeg * Math.PI) / 180
        const radY = ((angleDeg + 90) * Math.PI) / 180

        const tipXx = cx + length * Math.cos(radX)
        const tipXy = cy + length * Math.sin(radX)

        const tipYx = cx + length * Math.cos(radY)
        const tipYy = cy + length * Math.sin(radY)

        // Rotation sweep arc from 0 deg to angleDeg
        const arcRadius = 40
        const arcEndX = cx + arcRadius * Math.cos(radX)
        const arcEndY = cy + arcRadius * Math.sin(radX)
        const arcMidRad = radX / 2
        const arcMidX = cx + (arcRadius + 14) * Math.cos(arcMidRad)
        const arcMidY = cy + (arcRadius + 14) * Math.sin(arcMidRad)

        return (
          <g>
            {/* Origin indicator */}
            <circle cx={cx} cy={cy} r="3" className="fill-primary" />
            <text
              x={cx - 32}
              y={cy + 16}
              className="fill-gray-400 text-[10px] font-mono"
            >
              (0,0) local
            </text>

            {/* Reference baseline along original X-axis (0 deg) */}
            <line
              x1={cx}
              y1={cy}
              x2={cx + 60}
              y2={cy}
              className="stroke-gray-500"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Sweep arc */}
            <path
              d={`M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}`}
              fill="none"
              className="stroke-primary"
              strokeWidth="1.5"
            />
            <text
              x={arcMidX}
              y={arcMidY}
              className="fill-primary text-[10px] font-mono font-bold"
            >
              {angleDeg}°
            </text>

            {/* Rotated X Axis */}
            <line
              x1={cx}
              y1={cy}
              x2={tipXx}
              y2={tipXy}
              className="stroke-primary"
              strokeWidth="2"
              markerEnd="url(#marker-arrow-x)"
            />
            <text
              x={tipXx + 8}
              y={tipXy + 4}
              className="fill-primary text-[11px] font-mono font-bold"
            >
              X
            </text>

            {/* Rotated Y Axis */}
            <line
              x1={cx}
              y1={cy}
              x2={tipYx}
              y2={tipYy}
              className="stroke-indigo-400"
              strokeWidth="2"
              markerEnd="url(#marker-arrow-y)"
            />
            <text
              x={tipYx + 6}
              y={tipYy + 10}
              className="fill-indigo-400 text-[11px] font-mono font-bold"
            >
              Y
            </text>
          </g>
        )
      })()}

      {/* 3. BEZIER HANDLES OVERLAY */}
      {type === 'bezier-handles' && (() => {
        const { startX = 50, startY = 180, cp1X = 100, cp1Y = 110, cp2X = 200, cp2Y = 110, endX = 250, endY = 180 } = params
        return (
          <g>
            {/* Tangent guide bars */}
            <line
              x1={startX}
              y1={startY}
              x2={cp1X}
              y2={cp1Y}
              className="stroke-primary/70"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <line
              x1={endX}
              y1={endY}
              x2={cp2X}
              y2={cp2Y}
              className="stroke-primary/70"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Endpoint handles */}
            <circle cx={startX} cy={startY} r="3.5" className="fill-gray-300" />
            <text x={startX - 18} y={startY + 4} className="fill-gray-400 text-[10px] font-mono">
              P₀
            </text>

            <circle cx={endX} cy={endY} r="3.5" className="fill-gray-300" />
            <text x={endX + 6} y={endY + 4} className="fill-gray-400 text-[10px] font-mono">
              P₁
            </text>

            {/* Control Point 1 */}
            <circle
              cx={cp1X}
              cy={cp1Y}
              r="4.5"
              className="fill-primary stroke-surface-base"
              strokeWidth="1.5"
            />
            <text
              x={cp1X - 8}
              y={cp1Y - 8}
              className="fill-primary text-[11px] font-mono font-bold"
            >
              CP₁
            </text>

            {/* Control Point 2 */}
            <circle
              cx={cp2X}
              cy={cp2Y}
              r="4.5"
              className="fill-primary stroke-surface-base"
              strokeWidth="1.5"
            />
            <text
              x={cp2X - 8}
              y={cp2Y - 8}
              className="fill-primary text-[11px] font-mono font-bold"
            >
              CP₂
            </text>
          </g>
        )
      })()}

      {/* 4. PROGRESS VECTOR OVERLAY */}
      {type === 'progress-vector' && (() => {
        const total = liveState?.totalLength ?? params.pathLength ?? 500
        const offset = liveState?.offset ?? total
        // progress: 0 when offset === totalLength, 1 when offset === 0
        const rawProgress = total > 0 ? (total - offset) / total : 0
        const progress = Math.max(0, Math.min(1, rawProgress))

        // Lesson 5 draws a circle at (150, 150) with radius 75
        const cx = 150
        const cy = 150
        const r = 75
        const angle = progress * Math.PI * 2
        const chevronX = cx + r * Math.cos(angle)
        const chevronY = cy + r * Math.sin(angle)
        const tangentDeg = (angle * 180) / Math.PI + 90

        // Progress bar positioning at the bottom
        const barMargin = 16
        const barY = height - 26
        const barWidth = width - barMargin * 2
        const filledWidth = Math.max(4, barWidth * progress)

        return (
          <g>
            {/* Directional chevron near the active stroke front */}
            {progress > 0 && progress < 1 && (
              <g transform={`translate(${chevronX}, ${chevronY}) rotate(${tangentDeg})`}>
                <polygon
                  points="-5,-6 6,0 -5,6 -2,0"
                  className="fill-primary stroke-surface-base"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Horizontal progress bar at the bottom */}
            <rect
              x={barMargin}
              y={barY}
              width={barWidth}
              height="8"
              rx="4"
              className="fill-surface-overlay/80 stroke-surface-overlay"
              strokeWidth="1"
            />
            <rect
              x={barMargin}
              y={barY}
              width={filledWidth}
              height="8"
              rx="4"
              className="fill-primary"
            />
            <text
              x={width / 2}
              y={barY - 4}
              textAnchor="middle"
              className="fill-primary text-[10px] font-mono font-bold"
            >
              Stroke Progress: {Math.round(progress * 100)}%
            </text>
          </g>
        )
      })()}
    </svg>
  )
}
