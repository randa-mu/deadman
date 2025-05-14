import {randomUUIDv7} from "bun"
import {Hono} from "hono"
import {cors} from "hono/cors"
import {GetCiphertextPath, UploadCiphertextPath} from "shared/dist"

const app = new Hono()
const state = new Map<string, string>()

app.use(cors())

app.get(GetCiphertextPath, async (c) => {
    const id = c.req.param("id")
    const ciphertext = state.get(id)
    if (!ciphertext) {
        return c.status(404)
    }
    return c.json({id, ciphertext})
})

app.post(UploadCiphertextPath, async (c) => {
    const id = randomUUIDv7()
    const {ciphertext} = await c.req.json()
    if (!ciphertext) {
        return c.status(400)
    }
    console.log(`stored ciphertext with id ${id}`)
    state.set(id, ciphertext)
    return c.json({ id }, 201)
})

export default app
