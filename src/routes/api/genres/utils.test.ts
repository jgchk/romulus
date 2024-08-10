import { describe, expect } from 'vitest'

import { test } from '../../../vitest-setup'
import { parseQueryParams } from './utils'

describe('parseQueryParams', () => {
  test('should parse skip values', () => {
    const url = new URL('http://localhost?skip=10')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.skip).toBe(10)
  })

  test('should parse limit values', () => {
    const url = new URL('http://localhost?limit=10')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.limit).toBe(10)
  })

  test('should fail on limit values below 0', () => {
    const url = new URL('http://localhost?limit=-1')
    const result = parseQueryParams(url)
    expect(result.success).toBe(false)
  })

  test('should fail on limit values above 100', () => {
    const url = new URL('http://localhost?limit=101')
    const result = parseQueryParams(url)
    expect(result.success).toBe(false)
  })

  test('should parse no include', () => {
    const url = new URL('http://localhost')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.include).toEqual([])
  })

  test('should parse single include', () => {
    const url = new URL('http://localhost?include=parents')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.include).toEqual(['parents'])
  })

  test('should parse multiple include', () => {
    const url = new URL('http://localhost?include=parents&include=influencedBy')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.include).toEqual(['parents', 'influencedBy'])
  })

  test('should parse filter.name', () => {
    const url = new URL('http://localhost?name=foo')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.name).toBe('foo')
  })

  test('should parse filter.subtitle', () => {
    const url = new URL('http://localhost?subtitle=foo')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.subtitle).toBe('foo')
  })

  test('should parse filter.type', () => {
    const url = new URL('http://localhost?type=STYLE')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.type).toBe('STYLE')
  })

  test('should fail on invalid filter.type', () => {
    const url = new URL('http://localhost?type=INVALID')
    const result = parseQueryParams(url)
    expect(result.success).toBe(false)
  })

  test('should parse filter.relevance', () => {
    const url = new URL('http://localhost?relevance=1')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.relevance).toBe(1)
  })

  test('should fail on invalid filter.relevance', () => {
    const url = new URL('http://localhost?relevance=50')
    const result = parseQueryParams(url)
    expect(result.success).toBe(false)
  })

  test('should parse filter.nsfw', () => {
    const url = new URL('http://localhost?nsfw=true')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.nsfw).toBe(true)

    const url2 = new URL('http://localhost?nsfw=false')
    const result2 = parseQueryParams(url2)
    expect(result2.success).toBe(true)
    expect(result2.data?.filter?.nsfw).toBe(false)
  })

  test('should parse filter.shortDescription', () => {
    const url = new URL('http://localhost?shortDescription=foo')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.shortDescription).toBe('foo')
  })

  test('should parse filter.longDescription', () => {
    const url = new URL('http://localhost?longDescription=foo')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.longDescription).toBe('foo')
  })

  test('should parse filter.notes', () => {
    const url = new URL('http://localhost?notes=foo')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.notes).toBe('foo')
  })

  test('should parse filter.createdAt', () => {
    const date = '2024-08-05T11:13:59.174Z'
    const url = new URL(`http://localhost?createdAt=${date}`)
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.createdAt).toEqual(new Date(date))
  })

  test('should parse filter.updatedAt', () => {
    const date = '2024-08-05T11:13:59.174Z'
    const url = new URL(`http://localhost?updatedAt=${date}`)
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.updatedAt).toEqual(new Date(date))
  })

  test('should parse filter.createdBy', () => {
    const url = new URL('http://localhost?createdBy=1')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.filter?.createdBy).toBe(1)
  })

  test('should parse sort.field', () => {
    const url = new URL('http://localhost?sort=createdAt')
    const result = parseQueryParams(url)
    expect(result.success).toBe(true)
    expect(result.data?.sort?.field).toBe('createdAt')
  })
})
