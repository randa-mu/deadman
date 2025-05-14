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
        <div className="flex flex-row">
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