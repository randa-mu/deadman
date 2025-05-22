import {useCallback, useState} from "react"
import {PublicKey, PublicKeyShare} from "shamir-secret-sharing-bn254"
import {LoaderPinwheel} from "lucide-react"
import {Button} from "@/components/ui/button.tsx"
import {uploadCiphertext} from "shared"

type UploadCiphertextProps = {
    content: Uint8Array,
    conditions: Uint8Array,
    publicKey: PublicKey,
    publicKeyShares: Array<PublicKeyShare>
    threshold: number
    onUploaded: (id: string, ciphertext: Uint8Array) => void
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

export const UploadCiphertext = (props: UploadCiphertextProps) => {
    const {conditions, publicKey, publicKeyShares, threshold, onUploaded} = props
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const encryptAndUpload = useCallback(() => {
        setErrorMessage("")
        // fake encryption for now
        const ciphertext = new TextEncoder().encode("deadbeefdeadbeefdeadbeef")
        const requestBody = {
            threshold,
            conditions: conditions.toHex(),
            ciphertext: ciphertext.toHex(),
            publicKey: publicKey.pk.toHex(),
            publicKeyShares: publicKeyShares.map(it => it.pk.toHex()),
        }

        setIsLoading(true)

        uploadCiphertext(SERVER_URL, requestBody)
            .then(response => onUploaded(response.id, ciphertext))
            .catch(err => setErrorMessage(`error uploading ciphertext: ${err}`))
            .finally(() => setIsLoading(false))

    }, [conditions, publicKey, publicKeyShares, threshold, onUploaded])

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