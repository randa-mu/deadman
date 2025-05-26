import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {App} from "@/App.tsx"
import "./index.css"

// polyfill for `Uint8Array.toHex()` because fuck chrome
declare global {
    interface Uint8Array {
        /**
         * Convert this byte array to a lowercase hex string
         */
        toHex(): string
    }
}

if (!Uint8Array.prototype.toHex) {
    Uint8Array.prototype.toHex = function(): string {
        let hex = ""
        for (const byte of this) {
            hex += byte.toString(16).padStart(2, "0")
        }
        return hex
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>,
)
