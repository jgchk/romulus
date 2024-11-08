import { describe, expect, it, vi } from 'vitest'

import { InvalidTokenLengthError } from '../../../authentication/commands/domain/errors/invalid-token-length'
import type { TokenGenerator } from '../../domain/token-generator'
import { CryptoTokenGenerator } from './crypto-token-generator'

describe('CryptoTokenGenerator', () => {
  function setup(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  it('should generate a string of the specified length', () => {
    const tokenGenerator = setup()
    const length = 16
    const result = tokenGenerator.generate(length)
    expect(result).toHaveLength(length)
  })

  it('should generate a string containing only hexadecimal characters', () => {
    const tokenGenerator = setup()
    const result = tokenGenerator.generate(32)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('should generate different tokens on successive calls', () => {
    const tokenGenerator = setup()
    const firstToken = tokenGenerator.generate(16)
    const secondToken = tokenGenerator.generate(16)
    expect(firstToken).not.toBe(secondToken)
  })

  it('should handle very short lengths', () => {
    const tokenGenerator = setup()
    const result = tokenGenerator.generate(1)
    expect(result).toHaveLength(1)
    expect(result).toMatch(/^[0-9a-f]$/)
  })

  it('should handle odd lengths correctly', () => {
    const tokenGenerator = setup()
    const result = tokenGenerator.generate(15)
    expect(result).toHaveLength(15)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('should throw an error for zero length', () => {
    const tokenGenerator = setup()
    expect(() => tokenGenerator.generate(0)).toThrowError(InvalidTokenLengthError)
  })

  it('should throw an error for negative length', () => {
    const tokenGenerator = setup()
    expect(() => tokenGenerator.generate(-5)).toThrowError(InvalidTokenLengthError)
  })

  it('should use crypto.getRandomValues', () => {
    const mockGetRandomValues = vi.spyOn(crypto, 'getRandomValues')
    const tokenGenerator = setup()
    tokenGenerator.generate(16)
    expect(mockGetRandomValues).toHaveBeenCalled()
  })
})
