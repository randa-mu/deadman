import {Hono} from "hono"
import {cors} from "hono/cors"
import {v4} from "uuid"

const app = new Hono()
const state = new Map<string, string>()

app.use(cors())

app.get("/health", (c) => c.text("OK", 200))

app.get("/ciphertext/:id", async (c) => {
    const id = c.req.param("id")
    const ciphertext = state.get(id)
    if (!ciphertext) {
        return c.text("not found", 404)
    }
    return c.json({id, ciphertext}, 200)
})

app.post("/upload", async (c) => {
    const id = v4()
    const {ciphertext} = await c.req.json()
    if (!ciphertext) {
        return c.text("bad request", 400)
    }
    console.log(`stored ciphertext with id ${id}`)
    state.set(id, ciphertext)
    return c.json({ id }, 201)
})

export default app
