import {Hono} from "hono"
import {cors} from "hono/cors"
import {v4} from "uuid"
import {z, ZodError} from "zod"
import {verifyPartial} from "shamir-secret-sharing-bn254"
import {type CiphertextInsertion, DeadmanDatabase, type PartialSignatureInsertion} from "@server/db"
import {UploadCiphertextSchema, UploadPartialSignatureSchema} from "@shared/api"
import {parseCiphertext, parsePartialSignature} from "@server/mappers"

const app = new Hono()
const db = new DeadmanDatabase()

app.use(cors())

app.get("/health", (c) => c.text("OK", 200))

app.get("/ciphertext/:id", async (c) => {
    const id = c.req.param("id")
    const ciphertext = db.getCiphertext(id)
    if (!ciphertext) {
        return c.text("not found", 404)
    }
    return c.json({id, ciphertext}, 200)
})

app.post("/ciphertext", async (c) => {
    const ciphertext = parseCiphertext(await c.req.json())
    if (ciphertext instanceof ZodError) {
        console.error(ciphertext)
        return c.text("bad request", 400)
    }

    const id = v4()
    try {
        db.insertCiphertext(ciphertext)
        console.log(`stored ciphertext with id ${id}`)
        return c.json({id}, 201)
    } catch (err) {
        return c.text("internal server error", 500)
    }
})

app.post("/partial/:id", async (c) => {
    const ciphertextId = c.req.param("id")
    if (!ciphertextId || ciphertextId.trim().length === 0) {
        return c.text("invalid ciphertext ID", 400)
    }
    const ciphertext = db.getCiphertext(ciphertextId)
    if (!ciphertext) {
        return c.text("no such ciphertext", 404)
    }

    const result = parsePartialSignature(ciphertextId, await c.req.json())
    if (result instanceof ZodError) {
        console.error(result)
        return c.text("bad request", 400)
    }
    if (!verifyPartial(result.publicKey, ciphertext.conditions, result.signature)) {
        return c.text("invalid partial signature", 400)
    }

    try {
        db.insertPartialSignature(result)
        return c.status(204)
    } catch (err) {
        return c.text("internal server error", 500)
    }
})

export default app
