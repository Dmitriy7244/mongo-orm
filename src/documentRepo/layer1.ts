import { ObjectId } from "../deps.ts"
import { Document, DocumentRepo1 } from "./layer0.ts"

type Filter<D extends Document> = Partial<D> | { _id: ObjectId }

class DocumentRepo2<D extends Document = Document> extends DocumentRepo1<D> {
  async tryFind(filter: Filter<D> = {}) {
    const doc = await this.collection.findOne(filter)
    if (!doc) return
    this.hydrateDocument(doc)
    return doc as D
  }

  async findAll(filter: Filter<D> = {}) {
    const docs = await this.collection.find(filter).toArray()
    docs.forEach(this.hydrateDocument)
    return docs as D[]
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

  async deleteBy(filter: Filter<D> = {}) {
    await this.collection.deleteOne(filter)
  }
}

export { DocumentRepo2, type Filter }
