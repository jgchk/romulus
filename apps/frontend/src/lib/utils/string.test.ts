import { describe, expect, it } from 'vitest'

import { genreTitle, pageTitle } from './string'

describe('pageTitle', () => {
  it('should return the name of the site by default', () => {
    expect(pageTitle()).toBe('Romulus')
  })

  it('should return the passed title and the name of the site', () => {
    expect(pageTitle('Genres')).toBe('Genres • Romulus')
  })

  it('should return all passed titles and the name of the site', () => {
    expect(pageTitle('Action', 'Genres')).toBe('Action • Genres • Romulus')
  })
})

describe('genreTitle', () => {
  it('should return the genre name', () => {
    expect(genreTitle('Genre')).toBe('Genre')
  })

  it('should return the subtitle if it has one', () => {
    expect(genreTitle('Genre', 'Subtitle')).toBe('Genre [Subtitle]')
  })

  it('should return just the name if the subtitle is null', () => {
    expect(genreTitle('Genre', null)).toBe('Genre')
  })
})
