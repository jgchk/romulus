import type { TrackRepository } from '../../domain/repositories/track-repository'

export class DeleteTrackCommand {
  constructor(private readonly trackRepository: TrackRepository) {}

  async execute(trackId: number): Promise<void> {
    await this.trackRepository.delete(trackId)
  }
}
