import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts"
import { createClient, Document } from "./src/mod.ts"

class Doc1 extends Document {
  constructor(public a = 1) {
    super()
  }
}

await createClient([Doc1])

Deno.test("1", async () => {
  let doc1 = new Doc1()
  const id = await doc1.save()
  assertEquals(typeof id, "string")
  doc1.a = 2
  await doc1.save()
  doc1 = await Doc1.get(id)
  assertEquals(doc1.a, 2)
  await doc1.delete()
  await Doc1.get(id).then(() => {
    throw new Error("Expected function to throw")
  }, () => {})
})