import {z} from "zod"
import {hexSchema} from "@shared/keyshares"

export const UploadCiphertextSchema = z.object({
    ciphertext: hexSchema,
    conditions: hexSchema,
    threshold: z.number(),
    publicKeyShares: z.array(hexSchema),
})

type UploadCiphertextApiResponse = {
    id: string
}

export async function uploadCiphertext(serverUrl: string, input: z.infer<typeof UploadCiphertextSchema>): Promise<UploadCiphertextApiResponse> {
    const response = await fetch(`${serverUrl}/ciphertext`, {
        method: "POST",
        body: safeStringify(input),
    })
    if (response.status !== 201) {
        throw new Error(response.statusText)
    }
    return response.json() as unknown as UploadCiphertextApiResponse
}

export const UploadPartialSignatureSchema = z.object({
    shareIndex: z.number(),
    partialSignature: hexSchema,
    publicKey: hexSchema,
})

export async function uploadPartialSignature(serverUrl: string, ciphertextId: string, input: z.infer<typeof UploadPartialSignatureSchema>): Promise<void> {
    const response = await fetch(`${serverUrl}/partial/${ciphertextId}`, {
        method: "POST",
        body: safeStringify(input),
    })

    if (response.status !== 204) {
        throw new Error(response.statusText)
    }
}

export type PartialSignatureResponse = {
    partials: Array<PartialSignature>
}
export type PartialSignature = {
    shareIndex: number,
    signature: string,
    publicKey: string,
}

export async function fetchPartials(serverUrl: string, ciphertextId: string): Promise<Array<PartialSignature>> {
    const response = await fetch(`${serverUrl}/partial/${ciphertextId}`)
    if (response.status !== 200) {
        throw new Error(response.statusText)
    }
    const body = await response.json() as unknown as PartialSignatureResponse
    return body.partials ?? []
}

const safeStringify = (obj: any) => JSON.stringify(obj, (_, v) => typeof v === "bigint" ? Number(v) : v)