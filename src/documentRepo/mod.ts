import { ObjectId } from "../deps.ts"
import { Document } from "./layer0.ts"
import { DocumentRepo2, Filter } from "./layer1.ts"

type ID = ObjectId | string

class DocumentNotFound extends Error {
  constructor(filter: object) {
    super(`Document not found (filter: ${JSON.stringify(filter)})`)
  }
}

class DocumentRepo<D extends Document = Document> extends DocumentRepo2<D> {
  async find(filter: Filter<D> = {}) {
    const doc = await this.tryFind(filter)
    if (!doc) throw new DocumentNotFound(filter)
    return doc
  }

  tryGet(id: ID) {
    const _id = new ObjectId(id)
    return this.tryFind({ _id })
  }

  get(id: ID) {
    const _id = new ObjectId(id)
    return this.find({ _id })
  }

  async delete(doc: D) {
    const _msg = `No document id (doc: ${doc})`
    if (!doc._id) throw new Error(_msg)
    await this.deleteById(doc._id)
  }

  async deleteById(id: ID) {
    const filter = { _id: new ObjectId(id) }
    await this.deleteBy(filter)
  }

  // TODO: optimize
  async tryFindLast(filter: Filter<D> = {}) {
    const docs = await this.findAll(filter)
    if (!docs) return
    const doc = docs[docs.length - 1]
    return doc
  }

  async findLast(filter: Filter<D> = {}) {
    const doc = await this.tryFindLast(filter)
    if (!doc) throw new DocumentNotFound(filter)
    return doc
  }
}

export { Document, DocumentRepo }
