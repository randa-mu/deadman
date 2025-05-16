export type UploadCiphertextApiResponse = {
  id: string
}

export type GetCiphertextApiResponse = {
  id: string,
  ciphertext: string
}

export function encodeGetCiphertextApiResponse(id: string, ciphertext: Uint8Array): GetCiphertextApiResponse {
  return {
    id,
    ciphertext: ciphertext.toHex(),
  }
}

export function decodeGetCiphertextApiResponse(response: GetCiphertextApiResponse) {
  return {
    id: response.id,
    ciphertext: Uint8Array.fromHex(response.ciphertext)
  }
}