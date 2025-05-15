import {useEffect, useState} from "react"
import {FilePicker} from "@/components/ui/FilePicker"
import {decodeKeysharesFile, KeysharesFile} from "shared"

export const DecryptionPage = () => {
    const [file, setFile] = useState<File>()
    const [keyshare, setKeyshare] = useState<KeysharesFile>()
    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        if (!file) {
            setIsError(false)
            return setKeyshare(undefined)
        }

        file.text()
            .then(utf8 => decodeKeysharesFile(utf8))
            .then(share => {
                setIsError(false)
                setKeyshare(share)
            })
            .catch(err => {
                console.error(err)
                return setIsError(true)
            })
    }, [file])
    return (
        <div className="spacing-y-4">
            <FilePicker
                label={"Choose a keyshares file to upload"}
                file={file}
                onFileChange={setFile}
            />

            {!!keyshare && <p>id is {keyshare.id}</p>}
            {isError && <p className="font-destructive">Invalid keyshare file</p>}
        </div>
    )
}
