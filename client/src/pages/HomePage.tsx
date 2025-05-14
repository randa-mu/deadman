import {Button} from "@/components/ui/button.tsx"
import {NavLink} from "react-router-dom"

export const HomePage = () =>
    <div className="flex flex-row items-center justify-around w-full h-full p-4">
            <Button>
                <NavLink to="/encrypt">I want to protect my secrets</NavLink>
            </Button>
            <p>Select your goal</p>
            <Button>
                <NavLink to="/decrypt">I've been entrusted with a secret</NavLink>
            </Button>
    </div>