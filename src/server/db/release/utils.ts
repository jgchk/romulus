import { TrackInput } from './inputs'

export const makeTrackDbInput = (tracks: TrackInput[]) =>
  tracks.map((track, i) => ({
    song: { create: { title: track.title } },
    displayNum:
      track.displayNum === undefined ||
      Number.parseInt(track.displayNum) === i + 1
        ? null
        : track.displayNum,
    orderNum: i,
  }))
