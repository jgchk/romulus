import {
  get,
  type Invalidator,
  type Readable,
  type Subscriber,
  type Unsubscriber,
  type Writable,
  writable,
} from 'svelte/store'

export class ReleaseFormStore implements Readable<ReleaseFormState> {
  private store: Writable<ReleaseFormState>

  constructor(initialState: Partial<ReleaseFormState> = {}) {
    this.store = writable({
      title: initialState.title ?? '',
      artists: initialState.artists ?? [],
      tracks: initialState.tracks ?? [],
    })
  }

  subscribe(
    run: Subscriber<ReleaseFormState>,
    invalidate?: Invalidator<ReleaseFormState>,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }

  setTitle(title: string) {
    this.store.update((state) => {
      state.title = title
      return state
    })
  }

  setArt(art: string) {
    this.store.update((state) => {
      state.art = art
      return state
    })
  }

  setYear(year: number | undefined) {
    this.store.update((state) => {
      state.year = year
      return state
    })
  }

  setMonth(month: number | undefined) {
    this.store.update((state) => {
      state.month = month
      return state
    })
  }

  setDay(day: number | undefined) {
    this.store.update((state) => {
      state.day = day
      return state
    })
  }

  setArtists(artists: ReleaseFormState['artists']) {
    this.store.update((state) => {
      state.artists = artists
      return state
    })
  }

  addTrack() {
    this.store.update((state) => {
      state.tracks.push({
        artists: [],
        title: '',
        duration: '',
      })
      return state
    })
  }

  track(index: number) {
    return {
      setTitle: (title: string) => {
        this.store.update((state) => {
          const track = state.tracks[index]
          if ('id' in track) {
            track.overrides.title = title
          } else {
            track.title = title
          }
          return state
        })
      },

      setArtists: (artists: ReleaseFormState['artists']) => {
        this.store.update((state) => {
          const track = state.tracks[index]
          if ('id' in track) {
            track.overrides.artists = artists
          } else {
            track.artists = artists
          }
          return state
        })
      },

      setDuration: (duration: string) => {
        this.store.update((state) => {
          const track = state.tracks[index]
          if ('id' in track) {
            track.overrides.duration = duration
          } else {
            track.duration = duration
          }
          return state
        })
      },

      useExistingTrack: (id: number, data: ExistingTrackState['data']) => {
        this.store.update((state) => {
          state.tracks[index] = {
            id,
            data,
            overrides: {},
          }
          return state
        })
      },

      remove: () => {
        this.store.update((state) => {
          state.tracks.splice(index, 1)
          return state
        })
      },
    }
  }

  toServerInput(): ReleaseFormServerInput {
    const data = get(this.store)
    return {
      title: data.title,
      art: data.art,
      year: data.year,
      month: data.month,
      day: data.day,
      artists: data.artists.map((artist) => artist.id),
      tracks: data.tracks.map((track) => {
        if ('id' in track) {
          return {
            id: track.id,
            overrides: {
              artists: track.overrides.artists?.map((artist) => artist.id),
              title: track.overrides.title,
              duration: track.overrides.duration,
            },
          }
        } else {
          return {
            artists: track.artists.map((artist) => artist.id),
            title: track.title,
            duration: track.duration,
          }
        }
      }),
    }
  }
}

type ReleaseFormState = {
  title: string
  art?: string
  year?: number
  month?: number
  day?: number

  artists: {
    id: number
    name: string
  }[]

  tracks: (NewTrackState | ExistingTrackState)[]
}

type NewTrackState = {
  artists: {
    id: number
    name: string
  }[]
  title: string
  duration: string
}

type ExistingTrackState = {
  id: number
  data: {
    artists: {
      id: number
      name: string
    }[]
    title: string
    duration: string
  }
  overrides: {
    artists?: {
      id: number
      name: string
    }[]
    title?: string
    duration?: string
  }
}

type ReleaseFormServerInput = {
  title: string
  art?: string
  year?: number
  month?: number
  day?: number

  artists: number[]

  tracks: (NewTrackServerInput | ExistingTrackServerInput)[]
}

type NewTrackServerInput = {
  artists: number[]
  title: string
  duration: string
}

type ExistingTrackServerInput = {
  id: number
  overrides: {
    artists?: number[]
    title?: string
    duration?: string
  }
}
