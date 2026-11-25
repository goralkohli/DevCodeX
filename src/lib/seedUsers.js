/**
 * Generates 10,000 realistic user records for the DBMS indexing lesson.
 * Includes target user with id: 8472 and email: 'target_user@example.com'.
 */
export function generateUsers() {
  const users = []
  for (let i = 1; i <= 10000; i++) {
    if (i === 8472) {
      users.push({
        id: 8472,
        name: 'Target User',
        email: 'target_user@example.com',
      })
    } else {
      users.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
      })
    }
  }
  return users
}
