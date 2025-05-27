import {KeysharesFile, PartialSignature} from "shared"
import {useEffect, useState} from "react"
import {aggregateGroupSignature} from "shamir-secret-sharing-bn254"
import {deserializeCiphertext, IBE} from "identity-based-encryption-bn254"

type DecryptedMessageProps = {
    keyshare: KeysharesFile
    partials: Array<PartialSignature>,
}

const ibe = new IBE()

export const DecryptedMessage = ({partials, keyshare}: DecryptedMessageProps) => {
    const [plaintext, setPlaintext] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        setErrorMessage("")
        if (!partials || partials.length < keyshare.threshold) {
            return
        }

        try {
            const mappedPartials = partials
                .slice()
                .sort(p => p.shareIndex)
                .map((p) => ({
                    index: BigInt(p.shareIndex),
                    signature: Uint8Array.fromHex(p.signature)
                }))
            const groupSignature = aggregateGroupSignature(mappedPartials)
            const ciphertext = deserializeCiphertext(keyshare.ciphertext)
            const decrypted = ibe.decrypt(ciphertext, groupSignature)
            setPlaintext(new TextDecoder().decode(decrypted))
        } catch (err) {
            console.error("error decrypting ciphertext", err)
            setErrorMessage("error decrypting ciphertext")
        }

    }, [partials, keyshare])

    const sigsRemaining = keyshare.threshold - (partials?.length ?? 0)

    if (errorMessage) {
        return <div className="text-destructive">{errorMessage}</div>
    }

    if (!plaintext) {
        return (
            <div>
                <p>🔒 Message is still locked - <strong>{sigsRemaining}</strong> partial signatures remaining</p>
            </div>
        )
    }

    return (
        <div>Decrypted message: {plaintext}</div>
    )
}