import {ReactNode} from "react"
import {SecretKeyShare} from "shamir-secret-sharing-bn254"
import {Button} from "@/components/ui/button.tsx"
import {downloadFile} from "@/lib/utils.ts"
import {encodeKeysharesFile, KeysharesFile} from "shared"

type DownloadCiphertextsProps = {
    id: string
    ciphertext: Uint8Array,
    conditions: Uint8Array,
    threshold: number
    shares: Array<SecretKeyShare>
}

export const DownloadShares = (props: DownloadCiphertextsProps) => {
    const {id, ciphertext, conditions, shares, threshold} = props
    return (
        <div className="flex flex-col space-y-4">
            <p>Download each of the keyshares below and send them to a person you trust to report honestly
                if your conditions for decryption are met.<br/>
                Be careful to give each share to <strong>only</strong> one person. Leaking multiple shares to a single
                person could allow them to compromise you.</p>
            <div className="flex flex-col space-y-2 flex-1 items-start">
                {shares.map(share =>
                    <div key={share.index}>
                        <DownloadButton
                            id={id}
                            ciphertext={ciphertext}
                            conditions={conditions}
                            share={share}
                            threshold={threshold}
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
    threshold: number
    ciphertext: Uint8Array,
    conditions: Uint8Array,
    share: SecretKeyShare,
    children: ReactNode | ReactNode[],
}

function DownloadButton({id, ciphertext, conditions, share, threshold, children}: DownloadButtonProps) {
    const file: KeysharesFile = {id, ciphertext, conditions, share, threshold }
    const fileJson = encodeKeysharesFile(file)
    return <Button onClick={() => downloadFile(fileJson, `share-${share.index}.json`)}>{children}</Button>
}
