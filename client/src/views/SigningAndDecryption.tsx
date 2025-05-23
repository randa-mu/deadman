import {useCallback, useEffect, useState} from "react"
import {fetchPartials, KeysharesFile, PartialSignature, uploadPartialSignature} from "shared"
import {createPublicKeyShare} from "shamir-secret-sharing-bn254"
import {ConditionEvaluation} from "@/views/ConditionEvaluation.tsx"
import {EllipsisedText} from "@/components/ui/EllipsisedText.tsx"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx"
import {IBE} from "identity-based-encryption-bn254"
import { DecryptedMessage } from "./DecryptedMessage"

type SigningAndDecryptionProps = {
    keyshare: KeysharesFile,
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
const REFRESH_INTERVAL_MS = 10_000
const ibe = new IBE()

export const SigningAndDecryption = ({keyshare}: SigningAndDecryptionProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [isNetworkError, setIsNetworkError] = useState<boolean>(false)
    const [uploadComplete, setUploadComplete] = useState(false)
    const [partials, setPartials] = useState<Array<PartialSignature>>()

    const uploadPartialAction = useCallback(() => {
        if (!keyshare) {
            return
        }

        const identity = ibe.createIdentity(keyshare.conditions)
        const partialSignature = ibe.createDecryptionKey(IBE.parseSecretKey(keyshare.share.share), identity)
        const requestBody = {
            shareIndex: Number(keyshare.share.index),
            partialSignature: partialSignature.bytes.toHex(),
            publicKey: createPublicKeyShare(keyshare.share).pk.toHex()
        }
        uploadPartialSignature(SERVER_URL, keyshare.id, requestBody)
            .then(() => setUploadComplete(true))
            .catch(err => {
                console.error(err)
                setIsNetworkError(true)
            })

    }, [keyshare])

    const reloadPartialsAction = useCallback(() => {
        setIsLoading(true)
        fetchPartials(SERVER_URL, keyshare.id)
            .then(setPartials)
            // we reset the upload state now the use can see the partials in the table
            .then(() => setUploadComplete(false))
            .catch(err => {
                console.error(err)
                setIsNetworkError(true)
            })
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
        const id = setInterval(reloadPartialsAction, REFRESH_INTERVAL_MS)
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
            </LoadingSpinner>
            <DecryptedMessage
                partials={partials ?? []}
                keyshare={keyshare}
            />
        </>
    )
}

type SignatureTableProps = {
    partials: Array<PartialSignature>,
}

const SignatureTable = ({partials}: SignatureTableProps) =>
    <div className="grid grid-cols-3 text-start p-4">
        <div><strong>Index</strong></div>
        <div className="col-span-2"><strong>Public Key</strong></div>
        {!partials || partials.length === 0
            ? <div className="col-span-3">No partials yet</div>
            : partials.slice().sort(p => p.shareIndex).map((partial: PartialSignature) =>
                <>
                    <div key={`pk${partial.shareIndex}`}>
                        <strong>{partial.shareIndex}</strong>
                    </div>
                    <div key={`sig${partial.shareIndex}`} className="col-span-2">
                        <EllipsisedText text={partial.publicKey}/>
                    </div>
                </>
            )
        }
    </div>

