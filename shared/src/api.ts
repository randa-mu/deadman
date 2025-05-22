import {z} from "zod"
import {hexSchema} from "@shared/keyshares"

export const UploadCiphertextSchema = z.object({
    ciphertext: hexSchema,
    conditions: hexSchema,
    threshold: z.number(),
    publicKeyShares: z.array(hexSchema),
})

export const UploadPartialSignatureSchema = z.object({
    partialSignature: hexSchema,
    publicKey: hexSchema,
})