import {Hono} from "hono"
import {cors} from "hono/cors"
import {ZodError} from "zod"
import {verifyPartial} from "shamir-secret-sharing-bn254"
import {DeadmanDatabase} from "@server/db"
import {parseCiphertext, parsePartialSignature} from "@server/mappers"
import {IBE} from "identity-based-encryption-bn254"

const db = new DeadmanDatabase()
const ibe = new IBE()
const app = new Hono()
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

    try {
        const id = db.insertCiphertext(ciphertext)
        console.log(`stored ciphertext with id ${id}`)
        return c.json({id}, 201)
    } catch (err) {
        return c.text("internal server error", 500)
    }
})

app.post("/partial/:id", async (c, next) => {
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

    const publicKey = IBE.parsePublicKey(result.publicKey)
    if (!ibe.isValidDecryptionKey(publicKey, { bytes: result.signature }, ciphertext.conditions)) {
        return c.text("invalid partial signature", 400)
    }

    try {
        db.insertPartialSignature(result)
        return c.newResponse(null, 204)
    } catch (err) {
        return c.text("internal server error", 500)
    }
})

app.get("/partial/:id", async (c) => {
    const ciphertextId = c.req.param("id")

    if (!ciphertextId || ciphertextId.trim().length === 0) {
        return c.text("invalid ciphertext ID", 400)
    }
    const ciphertext = db.getCiphertext(ciphertextId)
    if (!ciphertext) {
        return c.text("no such ciphertext", 404)
    }

    try {
        const partials = db.getPartialsForCiphertext(ciphertextId)
            .filter(it => it.signature != null)
            .map(it => ({
                shareIndex: Number(it.shareIndex),
                signature: it.signature.toHex(),
                publicKey: it.publicKey.toHex()
            }))

        return c.json({partials}, 200)
    } catch (err) {
        return c.text("internal server error", 500)
    }
})

export default app
