import { createClient, Document } from "../src/_mod.ts"
import { assertEquals, assertRejects } from "./deps.ts"

class Doc1 extends Document {
  constructor(public a = 1) {
    super()
  }
}

await createClient([Doc1])

function test(name: string, func: () => any) {
  Deno.test(name, { sanitizeOps: false, sanitizeResources: false }, func)
}

test("1", async () => {
  let doc1 = new Doc1()
  const id = await doc1.save()
  assertEquals(typeof id, "string")
  doc1.a = 2
  await doc1.save()
  doc1 = await Doc1.get(id)
  assertEquals(doc1.a, 2)
  await doc1.delete()
  await doc1.save()
  await Doc1.delete(doc1._id!)
  await assertRejects(() => Doc1.get(id))
  // doc1 = await Doc1.find({ a: 1 })
})
