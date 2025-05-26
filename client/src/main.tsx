import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {App} from "@/App.tsx"
import "./index.css"

// polyfill for `Uint8Array.toHex()` because fuck chrome
if (!Uint8Array.prototype.toHex) {
    Uint8Array.prototype.toHex = function(): string {
        let hex = ""
        for (const byte of this) {
            hex += byte.toString(16).padStart(2, "0")
        }
        return hex
    }
}

if (!Uint8Array.fromHex) {
    Uint8Array.fromHex = function(hex: string): Uint8Array {
        const clean = hex.startsWith('0x') ? hex.slice(2) : hex
        if (clean.length % 2) {
            throw new Error('Invalid hex string length')
        }

        const len = clean.length / 2
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            const byte = clean.slice(i * 2, i * 2 + 2)
            const parsed = Number.parseInt(byte, 16)
            if (Number.isNaN(parsed)) {
                throw new Error(`Invalid hex byte: "${byte}"`)
            }
            bytes[i] = parsed
        }
        return bytes
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>,
)
