import { FC, useCallback, useMemo, useState } from 'react'

import { AlbumObject } from '../../server/services/spotify/types'
import { useAddReleaseMutation } from '../../services/releases'
import Button from '../common/Button'
import ImportForm from './ImportForm'
import ReleaseForm, { ReleaseFormData } from './ReleaseForm'

const ReleaseCreatePage: FC = () => {
  const [enterManually, setEnterManually] = useState(false)
  const [importData, setImportData] = useState<AlbumObject>()

  const showImportForm = useMemo(
    () => enterManually || importData,
    [enterManually, importData]
  )

  const {
    mutate: addRelease,
    isLoading: isAddingRelease,
    isSuccess: isReleaseAdded,
  } = useAddReleaseMutation()

  const handleCreate = useCallback(
    (data: ReleaseFormData) =>
      addRelease(
        {
          issue: {
            type: 'new',
            data: {
              title: data.title,
              releaseDate: data.releaseDate ?? undefined,
              spotifyId: data.spotifyId ?? undefined,
              artists: [],
              objects: [],
            },
          },
        },
        {
          onSuccess: (data) => {
            console.log(data)
          },
        }
      ),
    [addRelease]
  )

  return (
    <div className='bg-texture flex h-full items-center justify-center'>
      <div>
        <div className='flex flex-col items-center'>
          <div className='flex flex-col items-center border bg-white p-4 shadow-sm'>
            <div className='mb-3 text-gray-700'>Import from Spotify</div>
            <ImportForm onData={(data) => setImportData(data)} />
          </div>

          {!showImportForm && (
            <>
              <div className='my-3 text-gray-700'>or</div>
              <Button
                template='secondary'
                onClick={() => setEnterManually(true)}
              >
                Enter Manually
              </Button>
            </>
          )}
        </div>

        {showImportForm && (
          <div className='mt-4 border bg-white p-4 shadow-sm'>
            <ReleaseForm
              importData={importData}
              onSubmit={(data) => handleCreate(data)}
              isSubmitted={isReleaseAdded}
              isSubmitting={isAddingRelease}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ReleaseCreatePage
