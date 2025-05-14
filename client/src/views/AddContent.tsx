import {useCallback, useState} from "react"
import {Textarea} from "@/components/ui/textarea.tsx"
import {Button} from "@/components/ui/button.tsx"

type AddContentProps = {
    onContentAdded: (bytes: Uint8Array) => void
}

const encoder = new TextEncoder()
export const AddContent = (props: AddContentProps) => {
    const {onContentAdded} = props
    const [text, setText] = useState("")

    const onSubmit = useCallback(() => {
        onContentAdded(encoder.encode(text))
    }, [text, onContentAdded])

    return (
        <div className="space-y-2">
            <p>Enter text value you wish to be decrypted should your dead man's switch activate.</p>
            <Textarea value={text} onChange={e => setText(e.target.value)}/>
            <Button onClick={onSubmit} disabled={!text}>Add content</Button>
        </div>
    )
}