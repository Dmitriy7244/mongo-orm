import { Class, Db, env, MongoClient, ObjectId } from "./deps.ts"

async function createClient(models: (typeof Document)[], url?: string) {
  const client = new MongoClient(url ?? env.get("MONGO_URL"))
  await client.connect()
  const db = client.db()
  models.forEach((c) => c.db = db)
  return client
}

class Document {
  _id?: ObjectId
  static db?: Db

  constructor(..._args: any[]) {}

  static async get<T extends Document>(
    this: Class<T>,
    id: ObjectId | string,
  ): Promise<T> {
    const self = this as unknown as typeof Document
    const _id = new ObjectId(id)
    const doc = await self.collection.findOne({ _id })
    if (!doc) throw new Error(`No document (id: ${id})`)
    Object.setPrototypeOf(doc, this.prototype)
    return doc as T
  }

  async save() {
    this._id = this._id ?? new ObjectId()
    await this.collection.updateOne(
      { _id: this._id },
      { $set: this },
      { upsert: true },
    )
    return this._id.toString()
  }

  async delete() {
    await this.collection.deleteOne({ _id: this._id })
  }

  private get collection() {
    const db = (this.constructor as typeof Document).db
    if (!db) throw new Error("Class db not set")
    return db.collection(this.constructor.name)
  }

  private static get collection() {
    const db = this.db
    if (!db) throw new Error("Class db not set")
    return db.collection(this.name)
  }
}

export { createClient, Document }
