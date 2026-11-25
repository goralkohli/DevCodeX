import { generateUsers } from './seedUsers.js'

let dbInstance = null
let initPromise = null

/**
 * Initializes sql.js in-memory database seeded with 10,000 user records.
 * Uses dynamic import so sql.js is never bundled in the main chunk.
 */
export async function initDb() {
  if (dbInstance) return dbInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    // Dynamic import to keep sql.js in a separate lazy chunk
    const initSqlJsModule = await import('sql.js')
    const initSqlJs = initSqlJsModule.default || initSqlJsModule

    const SQL = await initSqlJs({
      locateFile: (file) => {
        if (typeof window === 'undefined') {
          return `./public/${file}`
        }
        return `/${file}`
      },
    })

    const db = new SQL.Database()

    // Create table schema
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT
      );
    `)

    // Seed 10,000 rows in a single fast transaction
    db.run('BEGIN TRANSACTION;')
    const stmt = db.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?);')
    const users = generateUsers()
    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      stmt.run([u.id, u.name, u.email])
    }
    stmt.free()
    db.run('COMMIT;')

    dbInstance = db
    return dbInstance
  })()

  return initPromise
}

/**
 * Executes a student's SQL query and determines row scan count via EXPLAIN QUERY PLAN.
 *
 * @param {object} db - SQLite database instance
 * @param {string} sql - SQL string to execute
 * @returns {Promise<{ result: Array, rowsScanned: number, timeMs: number, error: string | null }>}
 */
export async function runQuery(db, sql) {
  if (!db) {
    return { result: [], rowsScanned: 0, timeMs: 0, error: 'Database not initialized' }
  }

  const trimmed = sql.trim()
  if (!trimmed) {
    return { result: [], rowsScanned: 0, timeMs: 0, error: 'Query is empty' }
  }

  try {
    // Split into individual statements
    const statements = trimmed
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    let rowsScanned = 10000
    let selectStmt = null

    // 1. Reset any user-created indexes so execution matches current editor code
    try {
      db.run('DROP INDEX IF EXISTS idx_users_email;')
    } catch (_) {}

    // 2. Execute any DDL statements first (e.g. CREATE INDEX) so the query planner can see indexes
    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('SELECT')) {
        selectStmt = stmt
      } else {
        db.run(stmt + ';')
      }
    }

    // Default to the first statement if no explicit SELECT found
    if (!selectStmt && statements.length > 0) {
      selectStmt = statements[statements.length - 1]
    }

    // 3. Query plan inspection for rowsScanned
    if (selectStmt) {
      try {
        const plan = db.exec(`EXPLAIN QUERY PLAN ${selectStmt};`)
        const planDetail = JSON.stringify(plan)
        if (planDetail.includes('SEARCH') && planDetail.includes('INDEX')) {
          rowsScanned = 1
        } else if (planDetail.includes('SCAN')) {
          rowsScanned = 10000
        } else {
          rowsScanned = 10000
        }
      } catch (planErr) {
        console.warn('Explain plan error:', planErr.message)
      }
    }

    // 4. Timed execution of the query
    const startTime = performance.now()
    const execResults = db.exec(selectStmt || trimmed)
    const endTime = performance.now()
    const timeMs = Math.max(0.1, Number((endTime - startTime).toFixed(2)))

    // Normalize result structure
    let formattedResult = []
    if (execResults && execResults.length > 0) {
      const last = execResults[execResults.length - 1]
      formattedResult = last.values.map((row) => {
        const obj = {}
        last.columns.forEach((col, idx) => {
          obj[col] = row[idx]
        })
        return obj
      })
    }

    return {
      result: formattedResult,
      rowsScanned,
      timeMs,
      error: null,
    }
  } catch (err) {
    return {
      result: [],
      rowsScanned: 0,
      timeMs: 0,
      error: err.message || String(err),
    }
  }
}
