import { CompositionRoot } from './composition-root.js'

export class MediaService {
  constructor(private root: CompositionRoot) {}

  static create() {
    return new MediaService(new CompositionRoot())
  }

  async stop() {
    await this.root.db().close()
  }
}
