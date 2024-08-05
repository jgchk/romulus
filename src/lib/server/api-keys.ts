import { generateIdFromEntropySize } from 'lucia'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

export function generateApiKey(): string {
  return generateIdFromEntropySize(25) // 40 character
}

export async function hashApiKey(key: string): Promise<string> {
  return encodeHex(await sha256(new TextEncoder().encode(key)))
}

export async function checkApiKey(key: string, keyHash: string): Promise<boolean> {
  return keyHash === (await hashApiKey(key))
}
