import {useEffect, useState} from "react"
import {FilePicker} from "@/components/ui/FilePicker"
import {decodeKeysharesFile, KeysharesFile} from "shared"
import {SigningAndDecryption} from "@/views/SigningAndDecryption.tsx"


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
        <div className="m-4 space-y-4">
            <FilePicker
                label={"Choose a keyshares file to upload"}
                file={file}
                onFileChange={setFile}
            />
            {isError && <p className="font-destructive">Invalid keyshare file</p>}

            {!!keyshare && <SigningAndDecryption keyshare={keyshare}/>}
        </div>
    )
}
