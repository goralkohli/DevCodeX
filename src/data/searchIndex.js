import { tracks } from './tracks.js'
import { SURVIVAL_RECIPES } from './referenceData.js'
import radialAudit from './audits/radial-coordinates.json' with { type: 'json' }
import starAudit from './audits/parametric-star.json' with { type: 'json' }
import transformsAudit from './audits/coordinate-transforms.json' with { type: 'json' }
import bezierAudit from './audits/bezier-curves.json' with { type: 'json' }
import strokeAudit from './audits/stroke-animation.json' with { type: 'json' }

const auditsByTopic = {
  'radial-coordinates': radialAudit,
  'parametric-star': starAudit,
  'coordinate-transforms': transformsAudit,
  'bezier-curves': bezierAudit,
  'stroke-animation': strokeAudit,
}

const truncate = (str, maxLen = 60) => {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str
}

export function buildSearchIndex() {
  const items = []

  for (const [trackId, track] of Object.entries(tracks)) {
    for (const [topicId, topic] of Object.entries(track.topics || {})) {
      const topicTags = topic.tags || topic.lesson?.tags || []

      // 1. Topic Concept item
      items.push({
        id: `${trackId}-${topicId}-concept`,
        category: 'Topics',
        title: topic.title,
        subtitle: track.title,
        keywords: [
          topicId,
          trackId,
          'concept',
          'digest',
          topic.title.toLowerCase(),
          ...topicTags.map((t) => t.toLowerCase()),
        ],
        path: `/tracks/${trackId}/${topicId}?tab=concept`,
      })

      // 2. Sandbox item (if topic has lesson)
      if (topic.lesson?.concept?.heading) {
        items.push({
          id: `${trackId}-${topicId}-sandbox`,
          category: 'Sandboxes',
          title: `Interactive Sandbox: ${topic.lesson.concept.heading}`,
          subtitle: topic.title,
          keywords: [
            'sandbox',
            'editor',
            'live',
            topicId,
            'canvas',
            'interactive',
            topic.title.toLowerCase(),
            ...topicTags.map((t) => t.toLowerCase()),
          ],
          path: `/tracks/${trackId}/${topicId}?tab=sandbox`,
        })
      }

      // 3. Audit items (if audit exists for topic)
      const audit = auditsByTopic[topicId]
      if (audit) {
        // Execution Steps
        if (Array.isArray(audit.executionTrace)) {
          for (const step of audit.executionTrace) {
            items.push({
              id: `${trackId}-${topicId}-step-${step.step}`,
              category: 'Execution Steps',
              title: `Step ${step.step}: ${step.action}`,
              subtitle: truncate(step.memoryDetail),
              keywords: [
                step.action.toLowerCase(),
                step.codeLine.toLowerCase(),
                'trace',
                'execution',
                `step ${step.step}`,
                topicId,
              ],
              path: `/tracks/${trackId}/${topicId}?tab=audit#step-${step.step}`,
            })
          }
        }

        // Pitfalls
        if (Array.isArray(audit.pitfalls)) {
          for (const pitfall of audit.pitfalls) {
            items.push({
              id: `${trackId}-${topicId}-pitfall-${pitfall.id}`,
              category: 'Pitfalls',
              title: `Pitfall: ${pitfall.title}`,
              subtitle: truncate(pitfall.description),
              keywords: [
                pitfall.title.toLowerCase(),
                pitfall.severity.toLowerCase(),
                'pitfall',
                'antipattern',
                pitfall.id.toLowerCase(),
                pitfall.id.replace(/-/g, '').toLowerCase(),
                topicId,
                topicId.replace(/-/g, '').toLowerCase(),
                ...(pitfall.id.split('-')),
              ],
              path: `/tracks/${trackId}/${topicId}?tab=audit#pitfall-${pitfall.id}`,
            })
          }
        }

        // Senior Interview Insight
        if (audit.seniorInterviewTip) {
          items.push({
            id: `${trackId}-${topicId}-insight`,
            category: 'Interview Insights',
            title: `Senior Insight: ${topic.title}`,
            subtitle: truncate(audit.seniorInterviewTip),
            keywords: ['senior', 'insight', 'interview', 'production', topicId, topic.title.toLowerCase()],
            path: `/tracks/${trackId}/${topicId}?tab=audit#senior-insight`,
          })
        }
      }
    }
  }

  // 4. Survival Recipes
  for (const recipe of SURVIVAL_RECIPES) {
    items.push({
      id: `recipe-${recipe.id}`,
      category: 'Survival Recipes',
      title: recipe.title,
      subtitle: truncate(recipe.problem, 60),
      keywords: [
        recipe.id,
        recipe.category.toLowerCase(),
        ...recipe.id.split('-'),
        ...recipe.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
        'recipe',
        'survival',
        'toolbelt',
      ],
      path: `/reference#${recipe.id}`,
    })
  }

  return items
}

export const searchIndex = buildSearchIndex()
