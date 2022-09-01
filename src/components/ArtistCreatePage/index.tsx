import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'

import { ArtistObject } from '../../server/services/spotify/types'
import { useAddArtistMutation } from '../../services/artists'
import Button from '../common/Button'
import ArtistForm, { ArtistFormData } from './ArtistForm'
import ImportForm from './ImportForm'

const ArtistCreatePage: FC = () => {
  const [enterManually, setEnterManually] = useState(false)
  const [importData, setImportData] = useState<ArtistObject>()

  const showImportForm = useMemo(
    () => enterManually || importData,
    [enterManually, importData]
  )

  const { mutate, isLoading, isSuccess } = useAddArtistMutation()

  const router = useRouter()
  const handleCreate = useCallback(
    (data: ArtistFormData) =>
      mutate(data, {
        onSuccess: async (data) => {
          await router.push({
            pathname: '/artists/[id]',
            query: { id: data.id.toString() },
          })
        },
      }),
    [mutate, router]
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
          <div className='border p-4 shadow-sm bg-white mt-4'>
            <ArtistForm
              importData={importData}
              onSubmit={(data) => handleCreate(data)}
              isSubmitted={isSuccess}
              isSubmitting={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistCreatePage
