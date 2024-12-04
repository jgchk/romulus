import type { ReleaseRepository } from '../../domain/repositories/release-repository'

export class DeleteReleaseCommand {
  constructor(private readonly releaseRepository: ReleaseRepository) {}

  async execute(releaseId: number): Promise<void> {
    await this.releaseRepository.delete(releaseId)
  }
}
