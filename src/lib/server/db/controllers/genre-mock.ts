import { omit } from 'ramda'

import { DEFAULT_GENRE_TYPE, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { isDefined } from '$lib/utils/types'

import type { Genre, GenreAka, GenreInfluence, GenreParent } from '../schema'
import type { ExtendedInsertGenre, IGenresDatabase } from './genre'

export class MockGenresDatabase implements IGenresDatabase {
  private id: number
  private db: {
    genres: Map<Genre['id'], Genre>
    genreAkas: Map<string, GenreAka>
    genreParents: Map<string, GenreParent>
    genreInfluences: Map<string, GenreInfluence>
  }

  constructor() {
    this.id = 0
    this.db = {
      genres: new Map(),
      genreAkas: new Map(),
      genreParents: new Map(),
      genreInfluences: new Map(),
    }
  }

  insert(...data: Parameters<IGenresDatabase['insert']>) {
    const results = []

    for (const insertGenre of data) {
      const genre = this.createGenre(insertGenre)
      this.db.genres.set(genre.id, genre)

      const akas = this.createAkas(genre.id, insertGenre.akas)
      const parents = this.createParents(genre.id, insertGenre.parents).map(
        (parent) => parent.parentId,
      )
      const influencedBy = this.createInfluences(genre.id, insertGenre.influencedBy).map(
        (influence) => influence.influencerId,
      )

      results.push({ ...genre, akas, parents, influencedBy })
    }

    return Promise.resolve(results)
  }

  update(id: Genre['id'], update: Parameters<IGenresDatabase['update']>[1]) {
    const genre = this.getGenre(id)
    this.updateAkas(id, update.akas)
    this.updateParents(id, update.parents)
    this.updateInfluences(id, update.influencedBy)

    const updatedGenre = { ...genre, ...update }
    this.db.genres.set(id, updatedGenre)

    return Promise.resolve({
      ...updatedGenre,
      akas: this.getAkas(id),
      parents: this.getParentIds(id),
      influencedBy: this.getInfluencedByIds(id),
    })
  }

  findAllIds() {
    return Promise.resolve(Array.from(this.db.genres.values()).map(({ id }) => id))
  }

  findByIdSimple(id: Genre['id']) {
    return Promise.resolve(this.db.genres.get(id))
  }

  findByIdDetail(id: Genre['id']) {
    const genre = this.db.genres.get(id)
    if (!genre) return Promise.resolve(undefined)

    return Promise.resolve({
      ...genre,
      akas: this.getAkasDetail(id),
      parents: this.getParentsDetail(id),
      children: this.getChildrenDetail(id),
      influencedBy: this.getInfluencedByDetail(id),
      influences: this.getInfluencesDetail(id),
      history: [],
    })
  }

  findByIdHistory(id: Genre['id']) {
    const genre = this.db.genres.get(id)
    if (!genre) return Promise.resolve(undefined)

    return Promise.resolve({
      ...genre,
      akas: this.getAkasHistory(id),
      parents: this.getParentIds(id),
      children: this.getChildrenHistory(id),
      influencedBy: this.getInfluencedByIds(id),
      influences: this.getInfluencesHistory(id),
    })
  }

  findByIdEdit(id: Genre['id']) {
    const genre = this.db.genres.get(id)
    if (!genre) return Promise.resolve(undefined)

    return Promise.resolve({
      ...genre,
      akas: this.getAkas(id),
      parents: this.getParentIds(id),
      influencedBy: this.getInfluencedByIds(id),
    })
  }

  findByIds(ids: Genre['id'][]) {
    return Promise.resolve(
      ids
        .map((id) => {
          const genre = this.db.genres.get(id)
          if (!genre) return undefined

          return {
            ...genre,
            akas: this.getAkas(id),
            parents: this.getParentIds(id),
            influencedBy: this.getInfluencedByIds(id),
          }
        })
        .filter(isDefined),
    )
  }

  async findAllSimple() {
    return Promise.resolve(
      Array.from(this.db.genres.values()).map((genre) => ({
        id: genre.id,
        name: genre.name,
        parents: this.getParentIds(genre.id),
      })),
    )
  }

  async findAllTree() {
    return Promise.resolve(
      Array.from(this.db.genres.values()).map((genre) => ({
        id: genre.id,
        name: genre.name,
        subtitle: genre.subtitle,
        type: genre.type,
        relevance: genre.relevance,
        nsfw: genre.nsfw,
        updatedAt: genre.updatedAt,
        akas: this.getAkasNames(genre.id),
        parents: this.getParentIds(genre.id),
        children: this.getChildIds(genre.id),
      })),
    )
  }

  deleteById(id: Genre['id']) {
    this.db.genres.delete(id)
    this.deleteAkas(id)
    this.deleteParents(id)
    this.deleteInfluences(id)
    return Promise.resolve()
  }

  deleteAll() {
    this.db.genres.clear()
    this.db.genreAkas.clear()
    this.db.genreParents.clear()
    this.db.genreInfluences.clear()
    return Promise.resolve()
  }

  private createGenre(data: ExtendedInsertGenre): Genre {
    return {
      id: this.id++,
      name: data.name,
      subtitle: data.subtitle ?? null,
      type: data.type ?? DEFAULT_GENRE_TYPE,
      relevance: data.relevance ?? UNSET_GENRE_RELEVANCE,
      nsfw: data.nsfw ?? false,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription ?? null,
      notes: data.notes ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? undefined,
    }
  }

  private createAkas(genreId: Genre['id'], akas: ExtendedInsertGenre['akas']) {
    return akas.map((aka_) => {
      const aka = { genreId, ...aka_ }
      this.db.genreAkas.set(`${genreId}-${aka.name}`, aka)
      return omit(['genreId'], aka)
    })
  }

  private createParents(childId: Genre['id'], parentIds: Genre['id'][]) {
    return parentIds.map((parentId) => {
      const parent = { parentId, childId }
      this.db.genreParents.set(`${parentId}-${childId}`, parent)
      return parent
    })
  }

  private createInfluences(influencedId: Genre['id'], influencerIds: Genre['id'][]) {
    return influencerIds.map((influencerId) => {
      const influence = { influencerId, influencedId }
      this.db.genreInfluences.set(`${influencerId}-${influencedId}`, influence)
      return influence
    })
  }

  private getGenre(id: Genre['id']) {
    const genre = this.db.genres.get(id)
    if (!genre) throw new Error(`Genre not found: ${id}`)
    return genre
  }

  private getAkas(id: Genre['id']) {
    return Array.from(this.db.genreAkas.values())
      .filter((aka) => aka.genreId === id)
      .map((aka) => omit(['genreId'], aka))
  }

  private getAkasNames(id: Genre['id']) {
    return this.getAkas(id).map((aka) => aka.name)
  }

  private getAkasDetail(id: Genre['id']) {
    return this.getAkas(id).map((aka) => ({ name: aka.name }))
  }

  private getAkasHistory(id: Genre['id']) {
    return this.getAkas(id)
  }

  private getParents(id: Genre['id']) {
    return Array.from(this.db.genreParents.values())
      .filter((parent) => parent.childId === id)
      .map((parent) => ({ parentId: parent.parentId }))
  }

  private getParentIds(id: Genre['id']) {
    return this.getParents(id).map((parent) => parent.parentId)
  }

  private getParentsDetail(id: Genre['id']) {
    return this.getParents(id).map((parent) => ({
      parent: this.db.genres.get(parent.parentId)!,
    }))
  }

  private getChildren(id: Genre['id']) {
    return Array.from(this.db.genreParents.values())
      .filter((parent) => parent.parentId === id)
      .map((parent) => ({ childId: parent.childId }))
  }

  private getChildIds(id: Genre['id']) {
    return this.getChildren(id).map((child) => child.childId)
  }

  private getChildrenHistory(id: Genre['id']) {
    return this.getChildren(id).map((child) => ({
      ...this.db.genres.get(child.childId)!,
      akas: this.getAkasHistory(child.childId),
      parents: this.getParentIds(child.childId),
      children: this.getChildrenIds(child.childId),
      influencedBy: this.getInfluencedByIds(child.childId),
    }))
  }

  private getChildrenIds(id: Genre['id']) {
    return this.getChildren(id).map((child) => child.childId)
  }

  private getChildrenDetail(id: Genre['id']) {
    return this.getChildren(id).map((child) => ({
      child: this.db.genres.get(child.childId)!,
    }))
  }

  private getInfluencedBy(id: Genre['id']) {
    return Array.from(this.db.genreInfluences.values())
      .filter((influence) => influence.influencedId === id)
      .map((influence) => ({ influencerId: influence.influencerId }))
  }

  private getInfluencedByIds(id: Genre['id']) {
    return this.getInfluencedBy(id).map((influence) => influence.influencerId)
  }

  private getInfluencedByDetail(id: Genre['id']) {
    return this.getInfluencedBy(id).map((influence) => ({
      influencer: this.db.genres.get(influence.influencerId)!,
    }))
  }

  private getInfluences(id: Genre['id']) {
    return Array.from(this.db.genreInfluences.values())
      .filter((influence) => influence.influencerId === id)
      .map((influence) => ({ influenced: this.db.genres.get(influence.influencedId)! }))
  }

  private getInfluencesDetail(id: Genre['id']) {
    return this.getInfluences(id).map((influence) => ({
      influenced: this.db.genres.get(influence.influenced.id)!,
    }))
  }

  private getInfluencesHistory(id: Genre['id']) {
    return this.getInfluences(id).map((influence) => ({
      ...influence.influenced,
      akas: this.getAkasHistory(influence.influenced.id),
      parents: this.getParentIds(influence.influenced.id),
      children: this.getChildrenIds(influence.influenced.id),
      influencedBy: this.getInfluencedByIds(influence.influenced.id),
    }))
  }

  private updateAkas(id: Genre['id'], akas?: ExtendedInsertGenre['akas']) {
    if (!akas) return
    this.deleteAkas(id)
    this.createAkas(id, akas)
  }

  private updateParents(id: Genre['id'], parentIds?: Genre['id'][]) {
    if (!parentIds) return
    this.deleteParents(id)
    this.createParents(id, parentIds)
  }

  private updateInfluences(id: Genre['id'], influencerIds?: Genre['id'][]) {
    if (!influencerIds) return
    this.deleteInfluences(id)
    this.createInfluences(id, influencerIds)
  }

  private deleteAkas(id: Genre['id']) {
    for (const [key, aka] of this.db.genreAkas.entries()) {
      if (aka.genreId === id) {
        this.db.genreAkas.delete(key)
      }
    }
  }

  private deleteParents(id: Genre['id']) {
    for (const [key, parent] of this.db.genreParents.entries()) {
      if (parent.childId === id || parent.parentId === id) {
        this.db.genreParents.delete(key)
      }
    }
  }

  private deleteInfluences(id: Genre['id']) {
    for (const [key, influence] of this.db.genreInfluences.entries()) {
      if (influence.influencedId === id || influence.influencerId === id) {
        this.db.genreInfluences.delete(key)
      }
    }
  }
}
