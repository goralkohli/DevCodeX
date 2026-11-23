import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tracks } from '../src/data/tracks.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Check for .env file in root directory without external dependencies
const envPath = path.join(rootDir, '.env')
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/)
      if (match) {
        const key = match[1]
        let val = match[2] || ''
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  } catch (err) {
    console.warn('[WARN] Could not parse .env file:', err.message)
  }
}

const auditDir = path.join(rootDir, 'src', 'data', 'audits')
const seedsDir = path.join(rootDir, 'scripts', 'seeds')

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true })
}

const apiKey = process.env.DEEPSEEK_API_KEY?.trim()

// Parse CLI argument if provided (e.g. npm run generate:audit -- radial-coordinates)
const rawArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
const cliTopic = rawArgs[0]

// Gather topics with lessons from tracks.js
const targetTopics = []
for (const [trackId, track] of Object.entries(tracks)) {
  for (const [topicId, topic] of Object.entries(track.topics || {})) {
    if (topic.lesson) {
      if (!cliTopic || cliTopic === topicId) {
        targetTopics.push({
          trackId,
          topicId,
          title: topic.title,
          starterCode: topic.lesson.starterCode,
        })
      }
    }
  }
}

if (cliTopic && targetTopics.length === 0) {
  console.error(`[ERROR] Topic "${cliTopic}" with a lesson not found in tracks.js`)
  process.exit(1)
}

async function callDeepSeek(topic) {
  const systemPrompt = `You are an expert systems and web graphics engineer. Generate a structured audit JSON for a developer education topic according to the requested schema.
Return pure JSON matching the contract with keys:
- topicId: string
- topicTitle: string
- generatedAt: ISO timestamp
- engine: "deepseek-chat"
- complexity: { time: string, space: string, explanation: string }
- executionTrace: array of at least 3 objects { step: number, codeLine: string, action: string, memoryDetail: string }
- pitfalls: array of at least 2 objects { id: string, title: string, severity: "high" | "medium" | "low", description: string, badSnippet: string, goodSnippet: string }
- seniorInterviewTip: string`

  const userPrompt = `Generate a comprehensive audit for the following topic:
Topic Title: ${topic.title}
Topic ID: ${topic.topicId}
Target Canvas code:
${topic.starterCode}`

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API responded with status ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('API response did not contain content in choices[0].message')
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (parseErr) {
    throw new Error(`Failed to parse response content as JSON: ${parseErr.message}`)
  }

  // Validate schema keys
  const requiredKeys = ['complexity', 'executionTrace', 'pitfalls', 'seniorInterviewTip']
  for (const key of requiredKeys) {
    if (!parsed[key]) {
      throw new Error(`Generated audit missing required top-level key: "${key}"`)
    }
  }

  if (!Array.isArray(parsed.executionTrace) || parsed.executionTrace.length < 3) {
    throw new Error('Generated executionTrace must be an array with at least 3 steps')
  }

  if (!Array.isArray(parsed.pitfalls) || parsed.pitfalls.length < 2) {
    throw new Error('Generated pitfalls must be an array with at least 2 items')
  }

  parsed.topicId = topic.topicId
  parsed.topicTitle = topic.title
  parsed.generatedAt = new Date().toISOString()
  parsed.engine = 'deepseek-chat'

  return parsed
}

async function run() {
  let hasFailure = false

  for (const topic of targetTopics) {
    const targetFile = path.join(auditDir, `${topic.topicId}.json`)
    const seedFile = path.join(seedsDir, `${topic.topicId}.seed.json`)

    if (!apiKey) {
      if (fs.existsSync(targetFile)) {
        console.log(`[INFO] No key. Keeping existing ${topic.topicId} audit.`)
      } else if (fs.existsSync(seedFile)) {
        fs.copyFileSync(seedFile, targetFile)
        console.log(`[WARN] No key and no existing audit. Writing committed seed for ${topic.topicId}.`)
      } else {
        console.log(`[ERROR] No key, no existing audit, no seed for ${topic.topicId}.`)
        hasFailure = true
      }
      continue
    }

    try {
      console.log(`[INFO] Requesting DeepSeek audit for "${topic.topicId}"...`)
      const auditData = await callDeepSeek(topic)
      fs.writeFileSync(targetFile, JSON.stringify(auditData, null, 2) + '\n', 'utf8')
      console.log(`[INFO] Successfully generated and updated /src/data/audits/${topic.topicId}.json via DeepSeek.`)
    } catch (err) {
      console.error(`[ERROR] Generation failed for ${topic.topicId}: ${err.message}`)
      console.error(`[INFO] Existing file for ${topic.topicId} left untouched.`)
      hasFailure = true
    }
  }

  process.exit(hasFailure ? 1 : 0)
}

run()
