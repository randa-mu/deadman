import type {SecretKeyShare} from "shamir-secret-sharing-bn254"
import {z} from "zod"

export type KeysharesFile = {
    id: string,
    threshold: number
    share: SecretKeyShare
    ciphertext: Uint8Array,
    conditions: Uint8Array,
}

export const hexSchema = z.string().regex(/[0-9A-Fa-f]+/g)
const keySharesSchema = z.object({
    id: z.string(),
    threshold: z.number(),
    share: z.object({
        index: hexSchema,
        key: hexSchema,
    }),
    ciphertext: hexSchema,
    conditions: hexSchema,
})

export function encodeKeysharesFile(file: KeysharesFile): string {
    const {id, threshold, ciphertext, conditions, share} = file
    return JSON.stringify({
            id,
            threshold,
            share: {
                index: share.index.toString(16),
                key: share.share.toString(16)
            },
            ciphertext: ciphertext.toHex(),
            conditions: conditions.toHex(),
        }
    )
}

export function decodeKeysharesFile(contents: string): KeysharesFile {
    const parsed = keySharesSchema.parse(JSON.parse(contents))
    return {
        id: parsed.id,
        threshold: parsed.threshold,
        share: {
            index: BigInt(`0x${parsed.share.index}`),
            share: BigInt(`0x${parsed.share.key}`),
        },
        ciphertext: Uint8Array.fromHex(parsed.ciphertext),
        conditions: Uint8Array.fromHex(parsed.conditions)
    }
}
