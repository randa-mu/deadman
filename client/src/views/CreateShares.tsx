import {createPrivateKey, createPublicKey, PublicKey, SecretKeyShare, split} from "shamir-secret-sharing-bn254"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useCallback} from "react"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Button} from "@/components/ui/button.tsx"

type CreateSharesProps = {
    onNewShares: (publicKey: PublicKey, shares: Array<SecretKeyShare>) => void
}

const createSharesSchema = z.object({
    count: z.number().min(2),
    threshold: z.number().min(2),
})

export function CreateShares(props: CreateSharesProps) {
    const form = useForm<z.infer<typeof createSharesSchema>>({
        resolver: zodResolver(createSharesSchema),
        defaultValues: {
            count: 3,
            threshold: 2,
        }
    })

    const onSubmit = useCallback((data: z.infer<typeof createSharesSchema>) => {
        const sk = createPrivateKey()
        const pk = createPublicKey(sk)
        const shares = split(sk, data.count, data.threshold)

        props.onNewShares(pk, shares)

    }, [props.onNewShares])

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                        control={form.control}
                        name="count"

                        render={({field}) =>
                            <FormItem>
                                <FormLabel>Number of Shares</FormLabel>
                                <FormDescription>
                                    The number of parties to whom you wish to distribute partial keys
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        {...field}
                                        onChange={event => field.onChange(+event.target.value)}
                                    />
                                </FormControl>
                            </FormItem>
                        }
                    />

                    <FormField
                        control={form.control}
                        name="threshold"
                        render={({field}) =>
                            <FormItem>
                                <FormLabel>Threshold</FormLabel>
                                <FormDescription>
                                    The number of parties who must sign in order to trigger your dead man's switch
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        {...field}
                                        onChange={event => field.onChange(+event.target.value)}
                                    />
                                </FormControl>
                            </FormItem>
                        }
                    />

                    <FormMessage/>
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    )
}