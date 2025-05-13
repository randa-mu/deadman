import {useState} from "react"
import randamu from "./assets/randamu_logo.svg"
import type {ApiResponse} from "shared"
import {Button} from "@/components/ui/button.tsx"
import "./App.css"
import {Card, CardContent} from "@/components/ui/card.tsx"

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
    const [data, setData] = useState<ApiResponse | undefined>()

    async function sendRequest() {
        try {
            const req = await fetch(`${SERVER_URL}/hello`)
            const res: ApiResponse = await req.json()
            setData(res)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className="flex justify-center">
                <a href="https://randa.mu" target="_blank">
                    <img src={randamu} className="logo" alt="randamu logo"/>
                </a>
            </div>
            <h1>bhvrandamu-shadcn</h1>
            <h2>Bun + Hono + Vite + React + shadcn</h2>
            <p>A typesafe fullstack monorepo</p>
            <Card>
                <CardContent>
                    <div className="flex justify-center space-x-2">
                        <Button onClick={sendRequest}>
                            Call API
                        </Button>
                        <Button className="text-white">
                            <a className="text-white" target="_blank" href="https://bhvr.dev">Docs</a>
                        </Button>
                    </div>
                    {data && (
                        <pre className="response">
                            <code>
                                Message: {data.message} <br/>
                                Success: {data.success.toString()}
                            </code>
                        </pre>
                    )}

                </CardContent>

            </Card>
        </>
    )
}

export default App
