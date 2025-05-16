import {Route, Routes} from "react-router-dom"
import EncryptionPage from "@/pages/EncryptionPage.tsx"
import {DecryptionPage} from "@/pages/DecryptionPage.tsx"
import {NotFoundPage} from "@/pages/NotFoundPage.tsx"
import {HomePage} from "@/pages/HomePage.tsx"
import {BackButtonMixin} from "@/views/BackButtonMixin.tsx"
import RandamuLogo from "./assets/randamu_logo.svg"

export const App = () => {
    return (
        <div className="flex flex-col max-w-4xl h-screen mx-auto my-auto p-4">
            <h1 className="text-4xl font-bold p-4">deadman 💀</h1>
            <p>Create a ciphertext that your most trusted confidants can decrypt should you die or be compromised</p>
            <div className="w-full flex-1 overflow-auto min-h-0 mx-auto my-auto">
                <Routes>
                    <Route path="/" Component={HomePage}/>
                    <Route path="/encrypt" Component={BackButtonMixin(EncryptionPage)}/>
                    <Route path="/decrypt" Component={BackButtonMixin(DecryptionPage)}/>
                    <Route path="*" Component={BackButtonMixin(NotFoundPage)}/>
                </Routes>
            </div>
            <div className="absolute bottom-0 right-0 flex flex-row items-center space-x-2 p-2">
                <p>Built for your privacy by <a href="https://randa.mu">Randamu</a></p>
                <img className="h-10 w-10" src={RandamuLogo} alt={"randamu logo"}/>
            </div>
        </div>
    )
}