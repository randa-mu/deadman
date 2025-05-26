import {Database} from "bun:sqlite"
import {randomUUID} from "node:crypto"

const DB_FILE = process.env.DEADMAN_STATE_FILE || "./state.sqlite"

export class DeadmanDatabase {
    db: Database

    constructor(filename = DB_FILE) {
        const db = new Database(filename, {create: true, safeIntegers: true})
        db.exec("PRAGMA foreign_keys = ON ")
        db.exec(`
            CREATE TABLE IF NOT EXISTS ciphertexts
            (
                id         TEXT PRIMARY KEY,
                threshold  INTEGER NOT NULL,
                conditions BLOB    NOT NULL,
                ciphertext BLOB    NOT NULL
            )
        `)

        db.exec(`
            CREATE TABLE IF NOT EXISTS partial_signatures
            (
                ciphertext_id TEXT        NOT NULL REFERENCES ciphertexts (id) ON DELETE CASCADE,
                public_key    BLOB UNIQUE NOT NULL,
                signature     BLOB,
                share_index   INTEGER     NOT NULL,
                PRIMARY KEY (ciphertext_id, public_key)
            )
        `)
        this.db = db
    }

    insertCiphertext(insertion: CiphertextInsertion): string {
        const ciphertextId = randomUUID()

        const insert = this.db.transaction((insertion: CiphertextInsertion) => {
            const ciphertextQuery = this.db.query("INSERT INTO ciphertexts(id, threshold, conditions, ciphertext) VALUES ($1, $2, $3, $4)")
            ciphertextQuery.run({
                $1: ciphertextId,
                $2: insertion.threshold,
                $3: insertion.conditions,
                $4: insertion.ciphertext
            })

            insertion.publicKeyShares.forEach((publicKey, i) => {
                this.db.query("INSERT INTO partial_signatures(ciphertext_id, public_key, share_index) VALUES ($1, $2, $3)").run({
                    $1: ciphertextId,
                    $2: publicKey,
                    $3: BigInt(i + 1)
                })
            })
        })

        insert(insertion)

        return ciphertextId
    }

    getCiphertext(id: string): CiphertextEntry | null {
        const result = this.db.query<any, string>("SELECT * FROM ciphertexts WHERE id = ? LIMIT 1").get(id)
        if (!result) {
            return null
        }

        return {
            ciphertext: result.ciphertext,
            conditions: result.conditions,
            threshold: result.threshold,
        }
    }

    insertPartialSignature(entry: PartialSignatureInsertion) {
        const {changes} = this.db.query("UPDATE partial_signatures SET signature = $1 WHERE ciphertext_id = $2 AND public_key = $3").run({
            $1: entry.signature,
            $2: entry.ciphertextId,
            $3: entry.publicKey,
        })

        if (changes === 0) {
            throw Error("partial didn't exist")
        }
    }

    getPartialsForCiphertext(ciphertextId: string): Array<PartialSignatureInsertion> {
        const results = this.db.query<any, string>("SELECT * FROM partial_signatures WHERE ciphertext_id = ?").iterate(ciphertextId) ?? []
        if (!results) {
            return []
        }

        const out = []
        for (const result of results) {
            out.push({
                shareIndex: result.share_index,
                signature: result.signature,
                ciphertextId: result.ciphertext_id,
                publicKey: result.public_key,
            })
        }

        return out
    }
}

export type CiphertextInsertion = {
    threshold: bigint
    conditions: Uint8Array
    ciphertext: Uint8Array
    publicKeyShares: Array<Uint8Array>
}

export interface CiphertextEntry {
    threshold: bigint
    conditions: Uint8Array
    ciphertext: Uint8Array
}

export interface PartialSignatureInsertion {
    shareIndex: bigint
    ciphertextId: string
    publicKey: Uint8Array
    signature: Uint8Array
}
