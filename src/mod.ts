import { Class, Db, env, MongoClient, ObjectId } from "./deps.ts"

type ID = ObjectId | string

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

class Document {
  _id?: ObjectId
}

class DocumentRepo<D extends Document = Document> {
  db?: Db

  constructor(private model: Class<D>) {}

  private get collection() {
    const db = this.db
    if (!db) throw new Error("Repo db not set")
    return db.collection(this.model.name)
  }

  async save(doc: D) {
    doc._id = doc._id ?? new ObjectId()
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    )
    return doc._id.toString()
  }

  async get(id: ID) {
    const doc = await this.tryGet(id)
    if (!doc) throw new Error(`No document (id: ${id})`)
    return doc
  }

  async tryGet(id: ID) {
    const _id = new ObjectId(id)
    const doc = await this.collection.findOne({ _id })
    return doc as D | null
  }

  async delete(doc: D) {
    if (!doc._id) throw new Error(`No document id (doc: ${doc})`)
    await this.deleteById(doc._id)
  }

  async deleteById(id: ID) {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async tryFind(filter: Partial<D>) {
    const doc = await this.collection.findOne(filter)
    return doc as D | null
  }

  async findAll(filter: Partial<D> = {}) {
    return await this.collection.find(filter).toArray() as D[]
  }

  async find(filter: Partial<D> = {}) {
    const doc = await this.tryFind(filter)
    const _msg = `Document not found (filter: ${JSON.stringify(filter)})`
    if (!doc) throw new Error(_msg)
    return doc
  }
}

export { connectClient, createClient, Document, DocumentRepo }
