import { Class, Db, ObjectId } from "../deps.ts"

class Document {
  _id?: ObjectId
}

class DocumentRepo1<D extends Document = Document> {
  db?: Db

  constructor(private model: Class<D>) {}

  protected get collection() {
    const db = this.db
    if (!db) throw new Error("Repo db not set")
    return db.collection(this.model.name)
  }

  protected hydrateDocument = (doc: Document) => {
    Object.setPrototypeOf(doc, this.model.prototype)
  }
}

export { Document, DocumentRepo1 }
