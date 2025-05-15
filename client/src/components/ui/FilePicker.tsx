import {ChangeEvent, DragEvent, useRef, useState} from "react"
import {CloudUploadIcon, XIcon} from "lucide-react"
import {cn} from "@/lib/utils.ts"
import {Button} from "@/components/ui/button.tsx"

export type FilePickerProps = {
    label: string
    file: File | undefined
    onFileChange: (file: File | undefined) => void
}

export const FilePicker = (props: FilePickerProps) => {
    const { label, file, onFileChange } = props
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const createDragHandler = (entering: boolean) => {
        return (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(entering)
        }
    }

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length === 0) return
        onFileChange(files[0])
    }

    const onFilePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files == null || files.length === 0) return
        onFileChange(files[0])
    }

    const divClassName = "flex flex-col items-center p-4 space-y-4 border-2 border-dotted rounded-2xl transition-colors duration-200 ease-in-out"
    return (
        <div
            className={cn(divClassName, isDragOver ? "bg-accent font-white" : "")}
            onDragEnter={createDragHandler(true)}
            onDragOver={createDragHandler(true)}
            onDragExit={createDragHandler(false)}
            onDragLeave={createDragHandler(false)}
            onDrop={handleDrop}
        >
            <CloudUploadIcon/>
            <p>{label}</p>
            <input
                ref={inputRef}
                className="hidden"
                type={"file"}
                onChange={onFilePickerChange}
            />
            <Button onClick={() => inputRef.current?.click()}>Browse files</Button>
            {!!file &&
                <div
                    className="flex flex-row spacing-x-2 cursor-pointer"
                    onClick={() => onFileChange(undefined)}
                >
                    <XIcon  />
                    <p>{file.name}</p>
                </div>
            }
        </div>
    )
}
