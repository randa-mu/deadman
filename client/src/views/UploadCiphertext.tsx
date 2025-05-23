import {useCallback, useState} from "react"
import {PublicKey, PublicKeyShare} from "shamir-secret-sharing-bn254"
import {Button} from "@/components/ui/button.tsx"
import {uploadCiphertext} from "shared"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx"
import {IBE, serializeCiphertext} from "identity-based-encryption-bn254"

type UploadCiphertextProps = {
    content: Uint8Array,
    conditions: Uint8Array,
    publicKey: PublicKey,
    publicKeyShares: Array<PublicKeyShare>
    threshold: number
    onUploaded: (id: string, ciphertext: Uint8Array) => void
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
const ibe = new IBE()

export const UploadCiphertext = (props: UploadCiphertextProps) => {
    const {content, conditions, publicKey, publicKeyShares, threshold, onUploaded} = props
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const encryptAndUpload = useCallback(() => {
        setErrorMessage("")
        const identity = ibe.createIdentity(conditions)
        const ciphertext = ibe.encrypt(content, identity, IBE.parsePublicKey(publicKey.pk))
        const ciphertextBytes = serializeCiphertext(ciphertext)
        const requestBody = {
            threshold,
            conditions: conditions.toHex(),
            ciphertext: ciphertextBytes.toHex(),
            publicKey: publicKey.pk.toHex(),
            publicKeyShares: publicKeyShares.map(it => it.pk.toHex()),
        }

        setIsLoading(true)

        uploadCiphertext(SERVER_URL, requestBody)
            .then(response => onUploaded(response.id, ciphertextBytes))
            .catch(err => setErrorMessage(`error uploading ciphertext: ${err}`))
            .finally(() => setIsLoading(false))

    }, [content, conditions, publicKey, publicKeyShares, threshold, onUploaded])

    return (
        <div className="space-y-2">
            <Button
                disabled={isLoading}
                onClick={encryptAndUpload}
            >
                Encrypt and upload
            </Button>
            <LoadingSpinner isLoading={isLoading} />
            {errorMessage && <p>Error: {errorMessage}</p>}
        </div>
    )
}
