import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { SURVIVAL_RECIPES } from '../data/referenceData'

export default function ReferencePage() {
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [copiedId, setCopiedId] = useState(null)

  // Track expanded state for each recipe card; default to all expanded for instant reading
  const [expandedCards, setExpandedCards] = useState(() => {
    return new Set(SURVIVAL_RECIPES.map((r) => r.id))
  })

  // Data-driven category pills: unique categories in order of appearance + 'All'
  const categories = useMemo(() => {
    const unique = []
    for (const r of SURVIVAL_RECIPES) {
      if (r.category && !unique.includes(r.category)) {
        unique.push(r.category)
      }
    }
    return ['All', ...unique]
  }, [])

  // Filter recipes based on active pill
  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'All') return SURVIVAL_RECIPES
    return SURVIVAL_RECIPES.filter((r) => r.category === selectedCategory)
  }, [selectedCategory])

  // Handle hash navigation & smooth scrolling on mount / hash change
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    if (!id) return

    const targetRecipe = SURVIVAL_RECIPES.find((r) => r.id === id)
    if (targetRecipe) {
      // If target is in a different category than current filter, reset to All
      if (selectedCategory !== 'All' && selectedCategory !== targetRecipe.category) {
        setSelectedCategory('All')
      }
      // Ensure the target card is expanded so it can be scrolled to
      setExpandedCards((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }

    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [location.hash, selectedCategory])

  const toggleCard = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCopy = (id, snippet) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet)
      setCopiedId(id)
      setTimeout(() => {
        setCopiedId(null)
      }, 1500)
    }
  }

  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <span>🛠️</span>
          <span>Everyday Survival Toolbelt</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          10 Essential Developer Recipes
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
          The practical commands, mental models, and debugging techniques developers actually use every week.
        </p>
      </div>

      {/* Category Filter Pills (Data-Driven) */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-raised text-gray-400 border-surface-overlay hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* Recipe Cards List */}
      <div className="space-y-6">
        {filteredRecipes.map((recipe) => {
          const isExpanded = expandedCards.has(recipe.id)
          const isCopied = copiedId === recipe.id

          return (
            <div
              key={recipe.id}
              id={recipe.id}
              className="scroll-mt-24 rounded-xl bg-surface-raised border border-surface-overlay overflow-hidden shadow-sm transition-colors hover:border-gray-600/70"
            >
              {/* Card Header (Toggleable) */}
              <div
                onClick={() => toggleCard(recipe.id)}
                className="p-5 flex items-center justify-between cursor-pointer select-none border-b border-surface-overlay bg-surface-raised hover:bg-surface-overlay/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 pr-4">
                  <span className="shrink-0 w-fit px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                    {recipe.category}
                  </span>
                  <h2 className="text-base font-bold text-gray-100 truncate sm:whitespace-normal">
                    {recipe.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="hidden sm:inline text-xs font-mono">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  <span className="text-gray-400 transition-transform duration-200">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Card Body (when expanded) */}
              {isExpanded && (
                <div className="p-5 space-y-5 bg-surface-raised/50">
                  {/* Problem Callout */}
                  <div className="p-3.5 rounded-lg bg-surface-base border border-surface-overlay text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-gray-200 mr-1.5">Problem:</span>
                    {recipe.problem}
                  </div>

                  {/* Solution Box: Code Snippet + Copy Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                      <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-300">
                        Solution Snippet
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(recipe.id, recipe.snippet)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-surface-base border border-surface-overlay text-gray-300 hover:text-white hover:border-gray-500 transition-colors shadow-sm"
                      >
                        <span>{isCopied ? '✓' : '📋'}</span>
                        <span>{isCopied ? 'Copied!' : 'Copy Snippet'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-lg bg-surface-base border border-surface-overlay text-xs text-gray-200 font-mono overflow-x-auto whitespace-pre leading-relaxed">
                      <code>{recipe.snippet}</code>
                    </pre>
                  </div>

                  {/* Why This Happens Footer */}
                  <div className="p-3.5 rounded-lg bg-surface-raised border border-surface-overlay text-sm text-gray-300 leading-relaxed">
                    <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>Why This Works / Mental Model</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {recipe.why}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
