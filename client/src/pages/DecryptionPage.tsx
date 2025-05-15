import {useCallback, useEffect, useState} from "react"
import {FilePicker} from "@/components/ui/FilePicker"
import {decodeKeysharesFile, KeysharesFile} from "shared"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Button} from "@/components/ui/button.tsx"
import {signPartial} from "shamir-secret-sharing-bn254"

export const DecryptionPage = () => {
    const [file, setFile] = useState<File>()
    const [keyshare, setKeyshare] = useState<KeysharesFile>()
    const [isError, setIsError] = useState<boolean>(false)
    const [signature, setSignature] = useState<string>()

    useEffect(() => {
        if (!file) {
            setIsError(false)
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
        const partialSig = signPartial(keyshare.share, keyshare.conditions)
        setSignature(partialSig.toHex())
    }, [keyshare])
    return (
        <div className="m-4">
            <FilePicker
                label={"Choose a keyshares file to upload"}
                file={file}
                onFileChange={setFile}
            />

            {isError && <p className="font-destructive">Invalid keyshare file</p>}
            {!!keyshare && <ConditionEvaluation share={keyshare} onConditionMet={onConditionsMet}/>}
            {!!signature && <p>partial signature created: <pre>0x{signature}</pre></p>}
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
