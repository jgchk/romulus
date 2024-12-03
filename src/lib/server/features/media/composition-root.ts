import { MediaCommandsCompositionRoot } from './commands/composition-root'
import { MediaQueriesCompositionRoot } from './queries/composition-root'

export class MediaCompositionRoot {
  commands(): MediaCommandsCompositionRoot {
    return new MediaCommandsCompositionRoot()
  }

  queries(): MediaQueriesCompositionRoot {
    return new MediaQueriesCompositionRoot()
  }
}
