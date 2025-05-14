import {ReactNode} from "react"
import {SecretKeyShare} from "shamir-secret-sharing-bn254"
import {Button} from "@/components/ui/button.tsx"
import {downloadFile} from "@/lib/utils.ts"

type DownloadCiphertextsProps = {
    id: string
    ciphertext: Uint8Array,
    conditions: Uint8Array,
    shares: Array<SecretKeyShare>
}

export const DownloadShares = (props: DownloadCiphertextsProps) => {
    const {id, ciphertext, conditions, shares} = props
    return (
        <div className="flex flex-col space-y-4">
            <p>Download each of the keyshares below and send them to a person you trust to report honestly
                if your conditions for decryption are met.<br/>
                Be careful to give each share to <strong>only</strong> one person. Leaking multiple shares to a single
                person could allow them to compromise you.</p>
            <div className="flex flex-col space-y-2 flex-1 items-start">
                {shares.map(share =>
                    <div>
                        <DownloadButton
                            id={id}
                            ciphertext={ciphertext}
                            conditions={conditions}
                            share={share}
                        >
                            Download share {share.index}
                        </DownloadButton>
                    </div>
                )}
            </div>
        </div>
    )
}

type DownloadButtonProps = {
    id: string,
    ciphertext: Uint8Array,
    conditions: Uint8Array,
    share: SecretKeyShare,
    children: ReactNode | ReactNode[],
}

function DownloadButton({id, ciphertext, conditions, share, children}: DownloadButtonProps) {
    const fileContents = {
        id,
        share: {
            index: share.index.toString(16),
            key: share.share.toString(16)
        },
        ciphertext: ciphertext.toHex(),
        conditions: conditions.toHex(),
    }
    const fileJson = JSON.stringify(fileContents)
    return <Button onClick={() => downloadFile(fileJson, `share-${share.index}.json`)}>{children}</Button>
}