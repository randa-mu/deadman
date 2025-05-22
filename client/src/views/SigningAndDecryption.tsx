import {useCallback, useEffect, useState} from "react"
import {fetchPartials, KeysharesFile, PartialSignature, uploadPartialSignature} from "shared"
import {createPublicKeyShare, signPartial} from "shamir-secret-sharing-bn254"
import {ConditionEvaluation} from "@/views/ConditionEvaluation.tsx"
import {EllipsisedText} from "@/components/ui/EllipsisedText.tsx"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx"

type SigningAndDecryptionProps = {
    keyshare: KeysharesFile,
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

export const SigningAndDecryption = ({keyshare}: SigningAndDecryptionProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [isNetworkError, setIsNetworkError] = useState<boolean>(false)
    const [uploadComplete, setUploadComplete] = useState(false)
    const [partials, setPartials] = useState<Array<PartialSignature>>()

    const uploadPartialAction = useCallback(() => {
        if (!keyshare) {
            return
        }
        const partialSignature = signPartial(keyshare.share, keyshare.conditions)
        const requestBody = {
            partialSignature: partialSignature.toHex(),
            publicKey: createPublicKeyShare(keyshare.share).pk.toHex()
        }
        uploadPartialSignature(SERVER_URL, keyshare.id, requestBody)
            .then(() => setUploadComplete(true))
            .catch(setIsNetworkError)

    }, [keyshare])

    const reloadPartialsAction = useCallback(() => {
        setIsLoading(true)
        fetchPartials(SERVER_URL, keyshare.id)
            .then(setPartials)
            // we reset the upload state now the use can see th partials in the table
            .then(() => setUploadComplete(false))
            .catch(setIsNetworkError)
            .finally(() => setIsLoading(false))
    }, [keyshare])

    // if we upload our partials, trigger a reload
    useEffect(() => {
        if (uploadComplete) {
            reloadPartialsAction()
        }
    }, [uploadComplete, reloadPartialsAction])

    // periodically refresh the partials to check for new one
    useEffect(() => {
        const id = setInterval(reloadPartialsAction, 5000)
        return () => clearInterval(id)
    }, [reloadPartialsAction])

    return (
        <>
            <ConditionEvaluation
                share={keyshare}
                onConditionMet={uploadPartialAction}
            />
            {isNetworkError && <p className="font-destructive">There was an error uploading your partial signature</p>}
            {uploadComplete && <p>partial signature uploaded successfully</p>}
            <LoadingSpinner isLoading={isLoading}>
                <SignatureTable
                    partials={partials ?? []}
                />
                <DecryptedMessage
                    partials={partials ?? []}
                    threshold={keyshare.threshold}
                />
            </LoadingSpinner>
        </>
    )
}

type SignatureTableProps = {
    partials: Array<PartialSignature>,
}

const SignatureTable = ({partials}: SignatureTableProps) =>
    <div className="grid grid-cols-2">
        <div><strong>Index</strong></div>
        <div><strong>Public Key</strong></div>
        {!partials || partials.length === 0
            ? <div className="col-span-2">No partials yet</div>
            : partials.map((partial: PartialSignature, index: number) =>
                <>
                    <div key={`pk${index}`}><strong>{index}</strong></div>
                    <div key={`sig${index}`}><EllipsisedText text={partial.publicKey}/></div>
                </>
            )
        }
    </div>

type DecryptedMessageProps = {
    partials: Array<PartialSignature>,
    threshold: number,
}
const DecryptedMessage = ({partials, threshold}: DecryptedMessageProps) => {
    if (!partials || threshold === 0 || partials.length < threshold) {
        return <div>🔒 Message is still locked</div>
    }
    return (
        <div>Decrypted message: Hello world</div>
    )
}
