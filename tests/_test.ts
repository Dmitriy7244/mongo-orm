import { createClient, Document, DocumentRepo } from "../src/mod.ts"

class Doc1 extends Document {
  constructor(public a = 1) {
    super()
  }
}

const doc1Repo = new DocumentRepo(Doc1)

createClient([doc1Repo])

function test(name: string, func: () => any) {
  Deno.test(name, { sanitizeOps: false, sanitizeResources: false }, func)
}

test("1", async () => {
  const doc1 = new Doc1()
  const id = await doc1Repo.save(doc1)
  await doc1Repo.get(id)
  console.log(await doc1Repo.tryFind({ a: 3 }))
  console.log(await doc1Repo.find({ a: 2 }))
  console.log(await doc1Repo.findAll())
  console.log(await doc1Repo.findAll({ a: 2 }))
})
