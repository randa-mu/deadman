import {useState} from "react"
import {createPublicKeyShare, PublicKey, PublicKeyShare, SecretKeyShare} from "shamir-secret-sharing-bn254"
import {Accordion, AccordionContent, AccordionTrigger, AccordionItem} from "@/components/ui/accordion.tsx"
import {CreateShares} from "@/views/CreateShares.tsx"
import {AddContent} from "@/views/AddContent.tsx"
import {ChooseConditions} from "@/views/ChooseConditions.tsx"
import {DownloadShares} from "@/views/DownloadShares.tsx"
import {UploadCiphertext} from "@/views/UploadCiphertext.tsx"


function EncryptionPage() {
    const [accordionIndex, setAccordionIndex] = useState("item-1")
    const [content, setContent] = useState<Uint8Array>()
    const [publicKey, setPublicKey] = useState<PublicKey>()
    const [threshold, setThreshold] = useState<number>()
    const [shares, setShares] = useState<Array<SecretKeyShare>>()
    const [publicKeyShares, setPublicKeyShares] = useState<Array<PublicKeyShare>>()
    const [conditions, setConditions] = useState<Uint8Array>()
    const [encryption, setEncryption] = useState<[string, Uint8Array]>()

    const onContentAdded = (content: Uint8Array) => {
        setContent(content)
        setAccordionIndex("item-2")
    }

    const onSharesAdded = (pk: PublicKey, shares: Array<SecretKeyShare>, threshold: number) => {
        setPublicKey(pk)
        setShares(shares)
        setPublicKeyShares(shares.map(it => createPublicKeyShare(it)))
        setThreshold(threshold)
        setAccordionIndex("item-3")
    }

    const onConditionsAdded = (conditions: Uint8Array) => {
        setConditions(conditions)
        setAccordionIndex("item-4")
    }

    const onCiphertextEncrypted = (id: string, ciphertext: Uint8Array) => {
        setEncryption([id, ciphertext])
        setAccordionIndex("item-5")
    }

    return (
        <Accordion
            className="w-full text-start"
            type="single"
            defaultValue="item-1"
            value={accordionIndex}
            onValueChange={setAccordionIndex}
            collapsible
        >
            <AccordionItem value="item-1">
                <AccordionTrigger className="cursor-pointer text-xl">Add your content</AccordionTrigger>
                <AccordionContent>
                    <AddContent onContentAdded={onContentAdded}/>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
                <AccordionTrigger className="cursor-pointer text-xl">Create your shares</AccordionTrigger>
                <AccordionContent>
                    <CreateShares onNewShares={onSharesAdded}/>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
                <AccordionTrigger className="cursor-pointer text-xl">Set your conditions</AccordionTrigger>
                <AccordionContent>
                    <ChooseConditions onConditionsUpdated={onConditionsAdded}/>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
                <AccordionTrigger className="cursor-pointer text-xl">Store your ciphertext</AccordionTrigger>
                <AccordionContent>
                    {!shares || !conditions || !publicKey || !publicKeyShares || !threshold || !content
                        ? <p>You must finish the other steps first</p>
                        : <UploadCiphertext
                            content={content}
                            threshold={threshold}
                            conditions={conditions}
                            publicKey={publicKey}
                            publicKeyShares={publicKeyShares}
                            onUploaded={onCiphertextEncrypted}
                        />
                    }
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
                <AccordionTrigger className="cursor-pointer text-xl">Download your keyshares</AccordionTrigger>
                <AccordionContent>
                    {!shares || !conditions || !encryption || !threshold
                        ? <p>You must finish the other steps first</p>
                        : <DownloadShares
                            conditions={conditions}
                            shares={shares}
                            id={encryption[0]}
                            ciphertext={encryption[1]}
                            threshold={threshold}
                        />
                    }
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default EncryptionPage
