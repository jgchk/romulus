import { FC, useCallback, useMemo, useState } from 'react'

import { AlbumObject } from '../../server/services/spotify/types'
import { useAddReleaseMutation } from '../../services/releases'
import { ButtonSecondary } from '../common/Button'
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
    <div className='h-full bg-texture flex items-center justify-center'>
      <div>
        <div className='flex flex-col items-center'>
          <div className='border p-4 shadow-sm bg-white flex flex-col items-center'>
            <div className='text-gray-700 mb-3'>Import from Spotify</div>
            <ImportForm onData={(data) => setImportData(data)} />
          </div>

          {!showImportForm && (
            <>
              <div className='text-gray-700 my-3'>or</div>
              <ButtonSecondary onClick={() => setEnterManually(true)}>
                Enter Manually
              </ButtonSecondary>
            </>
          )}
        </div>

        {showImportForm && (
          <div className='border p-4 shadow-sm bg-white mt-4'>
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
