import { FetchError } from '@romulus/genres/client'
import { isHttpError, isRedirect } from '@sveltejs/kit'
import { err, ok } from 'neverthrow'
import { describe, expect, it, vi } from 'vitest'

import { actions, load } from './+page.server'

describe('load', () => {
  it('should return an error message when not logged in', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: undefined,
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  ok({
                    success: true,
                    genre: {
                      id: 0,
                      name: 'Test Genre',
                      subtitle: null,
                      type: 'STYLE',
                      akas: { primary: [], secondary: [], tertiary: [] },
                      nsfw: false,
                      parents: [],
                      children: [],
                      derivedFrom: [],
                      derivations: [],
                      influences: [],
                      influencedBy: [],
                      shortDescription: null,
                      longDescription: null,
                      notes: null,
                      relevance: 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      contributors: [],
                    },
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to edit genres' })
    }
  })

  it('should return an error message when logged in without edit genre permission', async () => {
    try {
      await load({
        params: { id: '0' },
        locals: {
          user: { permissions: { genres: { canEdit: false } } },
          di: {
            genres: () => ({
              getGenre: () =>
                Promise.resolve(
                  ok({
                    success: true,
                    genre: {
                      id: 0,
                      name: 'Test Genre',
                      subtitle: null,
                      type: 'STYLE',
                      akas: { primary: [], secondary: [], tertiary: [] },
                      nsfw: false,
                      parents: [],
                      children: [],
                      derivedFrom: [],
                      derivations: [],
                      influences: [],
                      influencedBy: [],
                      shortDescription: null,
                      longDescription: null,
                      notes: null,
                      relevance: 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      contributors: [],
                    },
                  }),
                ),
            }),
          },
        },
      })
      expect.fail('Expected an error')
    } catch (err) {
      if (!isHttpError(err)) expect.fail('Expected an HTTP error')
      expect(err.status).toBe(403)
      expect(err.body).toEqual({ message: 'You do not have permission to edit genres' })
    }
  })

  it('should prefill the form with the genre data', async () => {
    const res = await load({
      params: { id: '0' },
      locals: {
        user: { permissions: { genres: { canEdit: true } } },
        di: {
          genres: () => ({
            getGenre: () =>
              Promise.resolve(
                ok({
                  success: true,
                  genre: {
                    id: 0,
                    name: 'Test Genre',
                    subtitle: null,
                    type: 'STYLE',
                    akas: {
                      primary: ['primary-aka-one', 'primary-aka-two'],
                      secondary: [],
                      tertiary: [],
                    },
                    nsfw: false,
                    parents: [],
                    children: [],
                    derivedFrom: [],
                    derivations: [],
                    influences: [],
                    influencedBy: [],
                    shortDescription: null,
                    longDescription: null,
                    notes: null,
                    relevance: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    contributors: [],
                  },
                }),
              ),
          }),
        },
      },
    })
    expect(res.form.data).toEqual({
      name: 'Test Genre',
      subtitle: null,
      type: 'STYLE',
      primaryAkas: 'primary-aka-one, primary-aka-two',
      secondaryAkas: null,
      tertiaryAkas: null,
      nsfw: false,
      parents: [],
      derivedFrom: [],
      influencedBy: [],
      shortDescription: null,
      longDescription: null,
      notes: null,
      relevance: 1,
    })
  })
})
