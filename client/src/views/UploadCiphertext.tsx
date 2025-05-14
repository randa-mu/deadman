import {useCallback, useState} from "react"
import {PublicKey} from "shamir-secret-sharing-bn254"
import {Button} from "@/components/ui/button.tsx"
import {LoaderPinwheel} from "lucide-react"
import type {UploadCiphertextApiResponse} from "shared"

type UploadCiphertextProps = {
    content: Uint8Array,
    conditions: Uint8Array,
    publicKey: PublicKey,
    onUploaded: (id: string, ciphertext: Uint8Array) => void
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

export const UploadCiphertext = (props: UploadCiphertextProps) => {
    const {content, conditions, publicKey, onUploaded} = props
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const encryptAndUpload = useCallback(() => {
        setErrorMessage("")
        // fake encryption for now
        const ciphertext = new TextEncoder().encode("deadbeefdeadbeefdeadbeef")

        setIsLoading(true)
        fetch(`${SERVER_URL}/upload`, {
            method: "POST",
            body: JSON.stringify({ciphertext, publicKey}),
        })
            .then(res => {
                if (res.status !== 201) {
                    throw new Error(res.statusText)
                }
                return res.json() as unknown as UploadCiphertextApiResponse
            })
            .then(response => onUploaded(response.id, ciphertext))
            .catch(err => setErrorMessage(`error uploading ciphertext: ${err}`))
            .finally(() => setIsLoading(false))


    }, [content, conditions, publicKey, onUploaded])

    return (
        <div className="space-y-2">
            <Button
                disabled={isLoading}
                onClick={encryptAndUpload}
            >
                Encrypt and upload
            </Button>
            {isLoading && <LoaderPinwheel/>}
            {errorMessage && <p>Error: {errorMessage}</p>}
        </div>
    )
}