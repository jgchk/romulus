import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

import { CryptoTokenGenerator } from './features/authentication/commands/infrastructure/token/crypto-token-generator'

export function generateApiKey(): string {
  const token = new CryptoTokenGenerator().generate(40)
  if (token instanceof Error) {
    throw token
  }
  return token
}

export async function hashApiKey(key: string): Promise<string> {
  return encodeHex(await sha256(new TextEncoder().encode(key)))
}

export async function checkApiKey(key: string, keyHash: string): Promise<boolean> {
  return keyHash === (await hashApiKey(key))
}
