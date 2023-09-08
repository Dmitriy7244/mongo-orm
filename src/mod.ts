import { env, MongoClient } from "./deps.ts"
import { Document, DocumentRepo } from "./documentRepo/mod.ts"

function createClient(repos: DocumentRepo[], url?: string) {
  const client = new MongoClient(url ?? env.get("MONGO_URL"))
  const db = client.db()
  repos.forEach((r) => (r.db = db))
  return client
}

async function connectClient(repos: DocumentRepo[], url?: string) {
  const client = createClient(repos, url)
  await client.connect()
  return client
}

export { connectClient, createClient, Document, DocumentRepo }
