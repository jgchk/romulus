import { FC } from 'react'

import useWindowSize from '../../hooks/useWindowSize'
import { DefaultReleaseType } from '../../server/db/release-type/outputs'
import SplitPane from '../common/SplitPane'
import DesignerNode from './nodes'
import Sidebar from './Sidebar'

const PageDesigner: FC<{ releaseType: DefaultReleaseType }> = () => {
  const { width } = useWindowSize()

  return (
    <SplitPane
      defaultSize={300}
      minSize={200}
      maxSize={width - 300}
      className='hidden h-full md:flex'
    >
      <div>
        <Sidebar />
      </div>
      <div className='flex h-full w-full items-center justify-center bg-gray-100'>
        <div className='h-[506.25px] w-[900px] bg-white'>
          <DesignerNode id={0} />
        </div>
      </div>
    </SplitPane>
  )
}

export default PageDesigner
