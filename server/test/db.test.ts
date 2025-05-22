import {describe, expect, it} from "bun:test"
import {randomUUID} from "node:crypto"
import * as os from "node:os"
import path from "path"
import {DeadmanDatabase} from "@server/db"

describe("database", () => {
    it("can insert and read a new ciphertext", () => {
        const db = new DeadmanDatabase(tmp())

        const id = db.insertCiphertext({
            threshold: 3n,
            ciphertext: Buffer.from("deadbeef", "hex"),
            conditions: Buffer.from("cafebabe", "hex"),
            publicKeyShares: [new Uint8Array([0x1]), new Uint8Array([0x2]), new Uint8Array([0x12])]
        })

        const ciphertext = db.getCiphertext(id)
        console.log(ciphertext)
        expect(ciphertext).not.toBeNil()
        expect(ciphertext?.threshold).toEqual(3n)
        expect(ciphertext?.ciphertext).toEqual(Buffer.from("deadbeef", "hex"))
    })

    it("creates partials for each public key on insertion of a ciphertext", () => {
        const db = new DeadmanDatabase(tmp())

        const id = db.insertCiphertext({
            threshold: 3n,
            ciphertext: Buffer.from("deadbeef", "hex"),
            conditions: Buffer.from("cafebabe", "hex"),
            publicKeyShares: [new Uint8Array([0x1]), new Uint8Array([0x2]), new Uint8Array([0x12])]
        })

        const partials = db.getPartialsForCiphertext(id)
        expect(partials).not.toBeNil()
        expect(partials.length).toEqual(3)
        expect(partials[0]?.publicKey).toEqual(new Uint8Array([0x1]))
        expect(partials[0]?.signature).toBeNil()
        expect(partials[0]?.ciphertextId).toEqual(id)
        expect(partials[1]?.publicKey).toEqual(new Uint8Array([0x2]))
        expect(partials[2]?.publicKey).toEqual(new Uint8Array([0x12]))

    })

    it("can add a partial signature for a valid public key", () => {
        const db = new DeadmanDatabase(tmp())
        const id = db.insertCiphertext({
            threshold: 3n,
            ciphertext: Buffer.from("deadbeef", "hex"),
            conditions: Buffer.from("cafebabe", "hex"),
            publicKeyShares: [new Uint8Array([0x1]), new Uint8Array([0x2]), new Uint8Array([0x12])]
        })

        db.insertPartialSignature({
            ciphertextId: id,
            publicKey: new Uint8Array([0x12]),
            signature: Buffer.from("beefb00b", "hex"),
        })

        const partials = db.getPartialsForCiphertext(id)
        console.log(partials)
        const signed = partials.filter(it => !!it && Buffer.from(it.publicKey).equals(new Uint8Array([0x12])))
        expect(signed.length).toEqual(1)
        expect(signed[0]?.signature).toEqual(Buffer.from("beefb00b", "hex"))
    })

    it("inserting two of the same public key blows up", () => {
        const db = new DeadmanDatabase(tmp())
        expect(() => db.insertCiphertext({
            threshold: 3n,
            ciphertext: Buffer.from("deadbeef", "hex"),
            conditions: Buffer.from("cafebabe", "hex"),
            publicKeyShares: [new Uint8Array([0x1]), new Uint8Array([0x1])]
        })).toThrowError()
    })

    it("updating a partial without a corresponding ciphertext blows up", () => {
        const db = new DeadmanDatabase(tmp())

        expect(() => {
            db.insertPartialSignature({
                ciphertextId: "made-up-id",
                publicKey: new Uint8Array([0x33]),
                signature: Buffer.from("beefb00b", "hex"),
            })
        }).toThrowError()
    })
})

function tmp(prefix = "tmp", suffix = ".tmp"): string {
    const fileName = `${prefix}-${randomUUID()}${suffix}`
    const tmpDir = os.tmpdir()
    const filePath = path.join(tmpDir, fileName)
    Bun.write(filePath, new Uint8Array())
    return filePath
}
