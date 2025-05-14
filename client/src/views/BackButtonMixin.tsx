import {ComponentType, FC} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button.tsx"
import {ArrowLeft} from "lucide-react"

export function BackButtonMixin(Component: ComponentType): FC<unknown> {
    const Wrapped: FC<unknown> = () => {
        const navigate = useNavigate()
        const location = useLocation()
        const backTarget = location.state?.from?.pathname ?? -1;
        return (
            <div className="flex flex-col p-2">
                <div className="flex items-start">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(backTarget)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back
                    </Button>
                </div>
                <div>
                    <Component/>
                </div>
            </div>
        )
    }
    return Wrapped
}
