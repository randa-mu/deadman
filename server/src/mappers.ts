import {ZodError} from "zod"
import {UploadCiphertextSchema, UploadPartialSignatureSchema} from "@shared/api"
import type {CiphertextInsertion, PartialSignatureInsertion} from "@server/db"

export function parseCiphertext(json: any): CiphertextInsertion | ZodError<unknown> {
    const result = UploadCiphertextSchema.safeParse(json)
    if (result.error) {
        console.error(result.error)
        return result.error
    }

    const data = result.data
    return {
        threshold: BigInt(data.threshold),
        ciphertext: decodeBytes(data.ciphertext),
        conditions: decodeBytes(data.conditions),
        publicKeyShares: data.publicKeyShares.map(decodeBytes)
    }
}

export function parsePartialSignature(ciphertextId: string, json: any): PartialSignatureInsertion | ZodError<unknown> {
    const result = UploadPartialSignatureSchema.safeParse(json)
    if (result.error) {
        return result.error
    }

    const data = result.data
    return {
        ciphertextId,
        signature: decodeBytes(data.partialSignature),
        publicKey: decodeBytes(data.publicKey),
    }
}

function decodeBytes(input: string): Uint8Array {
    return Buffer.from(input, "hex")
}
