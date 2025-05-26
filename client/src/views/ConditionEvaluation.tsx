import {KeysharesFile} from "shared"
import {useEffect, useState} from "react"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Button} from "@/components/ui/button.tsx"

type ConditionEvaluationProps = {
    share: KeysharesFile
    onConditionMet: () => void
}

export const ConditionEvaluation = (props: ConditionEvaluationProps) => {
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
