import {useCallback} from "react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx"

type EllipsisedTextProps = {
    text?: string
    maxLength?: number
}
export const EllipsisedText = (props: EllipsisedTextProps) => {
    const text = props.text || ""
    const length = props.maxLength ?? 30
    const shortText = text.length > length ? `${text.slice(0, length)}...` : text

    const copyText = useCallback(() => {
        navigator.clipboard.writeText(text)
    }, [text])

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    onClick={copyText}
                    className="cursor-pointer"
                >
                    {shortText}
                </TooltipTrigger>
                <TooltipContent>click to copy</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
