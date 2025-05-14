import {Label} from "@/components/ui/label.tsx"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Button} from "@/components/ui/button.tsx"
import {useCallback, useState} from "react"

type ChooseConditionsProps = {
    onConditionsUpdated: (conditions: Uint8Array) => void
}

const encoder = new TextEncoder()
export const ChooseConditions = (props: ChooseConditionsProps) => {
    const {onConditionsUpdated} = props
    const [conditions, setConditions] = useState("death")

    const onSubmit = useCallback(() => {
        onConditionsUpdated(encoder.encode(conditions))
    }, [onConditionsUpdated, conditions])


    return (
        <RadioGroup
            className="space-y-2"
            value={conditions}
            onValueChange={setConditions}
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="death" id="r1"/>
                <Label htmlFor="r1">Death</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="imprisonment" id="r2"/>
                <Label htmlFor="r2">Imprisonment</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="incapacitation" id="r3"/>
                <Label htmlFor="r3">Incapacitation</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="disappearance" id="r3"/>
                <Label htmlFor="r3">Disappearance</Label>
            </div>
            <div>
                <Button onClick={onSubmit}>Set Conditions</Button>
            </div>
        </RadioGroup>
    )
}