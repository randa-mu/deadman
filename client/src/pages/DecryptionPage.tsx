import {useCallback, useEffect, useState} from "react"
import {createPublicKeyShare, signPartial} from "shamir-secret-sharing-bn254"
import {FilePicker} from "@/components/ui/FilePicker"
import {decodeKeysharesFile, fetchPartials, KeysharesFile, PartialSignature, uploadPartialSignature} from "shared"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Button} from "@/components/ui/button.tsx"

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

export const DecryptionPage = () => {
    const [file, setFile] = useState<File>()
    const [keyshare, setKeyshare] = useState<KeysharesFile>()
    const [isError, setIsError] = useState<boolean>(false)
    const [isNetworkError, setIsNetworkError] = useState<boolean>(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [partials, setPartials] = useState<Array<PartialSignature>>()

    useEffect(() => {
        if (!file) {
            setIsError(false)
            setUploadSuccess(false)
            return setKeyshare(undefined)
        }

        file.text()
            .then(utf8 => decodeKeysharesFile(utf8))
            .then(share => {
                setIsError(false)
                setKeyshare(share)
            })
            .catch(err => {
                console.error(err)
                return setIsError(true)
            })
    }, [file])

    const onConditionsMet = useCallback(() => {
        if (!keyshare) {
            return
        }
        const partialSignature = signPartial(keyshare.share, keyshare.conditions)
        const requestBody = {
            partialSignature: partialSignature.toHex(),
            publicKey: createPublicKeyShare(keyshare.share).pk.toHex()
        }
        uploadPartialSignature(SERVER_URL, keyshare.id, requestBody)
            .then(() => setUploadSuccess(true))
            .catch(setIsNetworkError)

    }, [keyshare])

    useEffect(() => {
        if (!keyshare) {
            return
        }

        const id = setInterval(() => {
            fetchPartials(SERVER_URL, keyshare.id)
                .then(partials => {
                    console.log(partials)
                    setPartials(partials)
                })
                .catch(setIsNetworkError)
        }, 5000)

        return () => clearInterval(id)
    }, [keyshare])

    return (
        <div className="m-4 space-y-4">
            <FilePicker
                label={"Choose a keyshares file to upload"}
                file={file}
                onFileChange={setFile}
            />

            {isError && <p className="font-destructive">Invalid keyshare file</p>}
            {isNetworkError && <p className="font-destructive">There was an error uploading your partial signature</p>}
            {!!keyshare && <ConditionEvaluation share={keyshare} onConditionMet={onConditionsMet}/>}
            {uploadSuccess && <p>partial signature uploaded successfully</p>}
            <div className="grid grid-cols-2">
                {!partials || partials.length === 0 && <div>No partials yet</div>}
                {!!partials && partials.map((partial: PartialSignature, index: number) =>
                    <div>
                        <div key={`pk${index}`}>{partial.publicKey}</div>
                        <div key={`sig${index}`}>{partial.signature}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

type ConditionEvaluationProps = {
    share: KeysharesFile
    onConditionMet: () => void
}
const ConditionEvaluation = (props: ConditionEvaluationProps) => {
    const {share, onConditionMet} = props
    const [condition, setCondition] = useState<string>()
    const [conditionMet, setConditionMet] = useState(false)

    useEffect(() => {
        setCondition(new TextDecoder().decode(share.conditions))
    }, [share])

    const onRadioUpdate = (value: string) => {
        if (value === "yes") {
            setConditionMet(true)
        } else {
            setConditionMet(false)
        }
    }

    return (
        <div className="p-4">
            <RadioGroup
                className="p-4 cursor-pointer"
                value={conditionMet ? "yes" : "no"}
                onValueChange={onRadioUpdate}
            >
                <p>Has your trustee's condition of "<strong>{condition}</strong>" been met?</p>
                <div className="flex flex-row space-x-4 justify-center">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes"/>
                        <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no"/>
                        <Label htmlFor="no">No</Label>
                    </div>
                </div>
            </RadioGroup>
            <Button
                disabled={!conditionMet}
                onClick={onConditionMet}
            >
                Trigger deadman's switch
            </Button>
        </div>
    )
}
