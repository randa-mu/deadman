import {ReactNode} from "react"
import {LoaderCircle} from "lucide-react"

type LoadingSpinnerProps = {
    isLoading?: boolean
    children?: ReactNode | ReactNode[]
}
export const LoadingSpinner = (props: LoadingSpinnerProps) => {
    if (props.isLoading) {
        return <div className="w-full flex justify-center"><LoaderCircle className="animate-spin"/></div>
    }
    return props.children
}