import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
const targetFile = path.join(auditDir, 'radial-coordinates.json')
const seedFile = path.join(rootDir, 'scripts', 'seeds', 'radial-coordinates.seed.json')

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true })
}

const apiKey = process.env.DEEPSEEK_API_KEY?.trim()

if (!apiKey) {
  if (fs.existsSync(targetFile)) {
    console.log('[INFO] No DEEPSEEK_API_KEY set. Keeping existing audit JSON.')
    process.exit(0)
  } else {
    if (!fs.existsSync(seedFile)) {
      console.error('[ERROR] Neither target file nor seed file exists!')
      process.exit(1)
    }
    fs.copyFileSync(seedFile, targetFile)
    console.log('[WARN] No DEEPSEEK_API_KEY set and no existing audit JSON. Writing committed seed.')
    process.exit(0)
  }
}

// When apiKey is present, call DeepSeek API
async function generateAudit() {
  console.log('[INFO] DEEPSEEK_API_KEY detected. Requesting audit from DeepSeek...')

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
Topic Title: Radial Coordinate Math
Topic ID: radial-coordinates
Target Canvas code:
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 300;
const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 100);
gradient.addColorStop(0, '#6366F1');
gradient.addColorStop(1, '#0F1115');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 300, 300);`

  try {
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

    // Ensure metadata
    parsed.topicId = parsed.topicId || 'radial-coordinates'
    parsed.topicTitle = parsed.topicTitle || 'Radial Coordinate Math'
    parsed.generatedAt = new Date().toISOString()
    parsed.engine = 'deepseek-chat'

    fs.writeFileSync(targetFile, JSON.stringify(parsed, null, 2) + '\n', 'utf8')
    console.log('[INFO] Successfully generated and updated /src/data/audits/radial-coordinates.json via DeepSeek.')
    process.exit(0)
  } catch (err) {
    console.error(`[ERROR] Validation or request failed: ${err.message}`)
    console.error('[INFO] Existing audit JSON was left untouched.')
    process.exit(1)
  }
}

generateAudit()
