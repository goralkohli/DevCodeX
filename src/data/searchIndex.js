import { tracks } from './tracks.js'
import radialAudit from './audits/radial-coordinates.json' with { type: 'json' }

const auditsByTopic = {
  'radial-coordinates': radialAudit,
}

const truncate = (str, maxLen = 60) => {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str
}

export function buildSearchIndex() {
  const items = []

  for (const [trackId, track] of Object.entries(tracks)) {
    for (const [topicId, topic] of Object.entries(track.topics || {})) {
      // 1. Topic Concept item
      items.push({
        id: `${trackId}-${topicId}-concept`,
        category: 'Topics',
        title: topic.title,
        subtitle: track.title,
        keywords: [topicId, trackId, 'concept', 'digest', topic.title.toLowerCase()],
        path: `/tracks/${trackId}/${topicId}?tab=concept`,
      })

      // 2. Sandbox item (if topic has lesson)
      if (topic.lesson?.concept?.heading) {
        items.push({
          id: `${trackId}-${topicId}-sandbox`,
          category: 'Sandboxes',
          title: `Interactive Sandbox: ${topic.lesson.concept.heading}`,
          subtitle: topic.title,
          keywords: ['sandbox', 'editor', 'live', topicId, 'canvas', 'interactive'],
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
                'devicepixelratio',
                'blur',
                'negative',
                'radius',
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
            title: 'Senior Insight: Interview Tip',
            subtitle: truncate(audit.seniorInterviewTip),
            keywords: ['senior', 'insight', 'interview', 'production'],
            path: `/tracks/${trackId}/${topicId}?tab=audit#senior-insight`,
          })
        }
      }
    }
  }

  return items
}

export const searchIndex = buildSearchIndex()
