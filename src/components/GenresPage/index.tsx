import { FC, useCallback } from 'react'

import useWindowSize from '../../hooks/useWindowSize'
import SplitPane from '../common/SplitPane'
import GenreNavigator from './GenreNavigator'
import GenreCreate from './GenreView/Create'
import GenreViewPlaceholder from './GenreView/Default'
import GenreEdit from './GenreView/Edit'
import { GenreFormFields } from './GenreView/Form'
import GenreHistory from './GenreView/History'
import GenreView from './GenreView/View'

export type GenrePageView =
  | { type: 'default' }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'history'; id: number }
  | { type: 'create' }

const GenrePage: FC<{ view: GenrePageView }> = ({ view }) => {
  const renderGenre = useCallback(() => {
    switch (view.type) {
      case 'default':
        return <GenreViewPlaceholder />
      case 'view':
        return <GenreView id={view.id} />
      case 'history':
        return <GenreHistory id={view.id} />
      case 'edit':
        return <GenreEdit id={view.id} autoFocus={view.autoFocus} />
      case 'create':
        return <GenreCreate />
    }
  }, [view])

  const { width } = useWindowSize()

  return (
    <>
      <SplitPane
        defaultSize={300}
        minSize={200}
        maxSize={width - 300}
        className='hidden h-full md:flex'
      >
        <GenreNavigator />
        {renderGenre()}
      </SplitPane>

      {view.type === 'default' && <GenreNavigator className='md:hidden' />}
      {view.type !== 'default' && (
        <div className='h-full md:hidden'>{renderGenre()}</div>
      )}
    </>
  )
}

export default GenrePage
