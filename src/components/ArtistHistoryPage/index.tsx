import { CrudOperation } from '@prisma/client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { compareAsc, format } from 'date-fns'
import Link from 'next/link'
import { FC, useMemo } from 'react'
import { IoMdArrowBack } from 'react-icons/io'

import { DefaultArtistHistory } from '../../server/db/artist-history/outputs'
import { useArtistHistoryQuery } from '../../services/artist-history'
import { capitalize } from '../../utils/string'
import { CenteredLoader } from '../common/Loader'

const ArtistHistoryPage: FC<{ id: number }> = ({ id }) => {
  const historyQuery = useArtistHistoryQuery(id)

  if (historyQuery.data) {
    return <HasData history={historyQuery.data} />
  }

  if (historyQuery.error) {
    return <div>Error fetching history :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultArtistHistory>()

const defaultColumns = [
  columnHelper.accessor('operation', {
    header: 'Change',
    cell: (props) => capitalize(props.getValue()),
  }),
  columnHelper.accessor('account', {
    header: 'Contributor',
    cell: (props) => (
      <Link
        href={{
          pathname: '/accounts/[id]',
          query: { id: props.getValue().id.toString() },
        }}
      >
        <a className='text-primary-500 hover:underline'>
          {props.getValue().username}
        </a>
      </Link>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: (props) => format(props.getValue(), 'PPpp'),
  }),
]

const HasData: FC<{ history: DefaultArtistHistory[] }> = ({ history }) => {
  const artist = useMemo(() => {
    const latestHistory = history[0]
    if (!latestHistory) return
    return { id: latestHistory.artistId, name: latestHistory.name }
  }, [history])

  return (
    <div className='flex-1 overflow-auto p-4'>
      <div className='flex items-center border-b border-gray-100 pb-4'>
        {artist ? (
          <>
            <Link
              href={{
                pathname: '/artists/[id]',
                query: { id: artist.id.toString() },
              }}
            >
              <a className='mr-1.5 rounded-full p-1.5 text-gray-600 hover:bg-primary-100 hover:text-primary-700'>
                <IoMdArrowBack size={18} />
              </a>
            </Link>
            <div className='text-2xl font-bold text-gray-600'>
              {artist.name}
            </div>
          </>
        ) : (
          <>
            <span className='mr-1.5 rounded-full p-1.5 text-gray-600 hover:bg-primary-100 hover:text-primary-700'>
              <IoMdArrowBack size={18} />
            </span>
            <div className='text-2xl font-bold text-gray-600'>Loading...</div>
          </>
        )}
      </div>

      <div className='pt-4'>
        {history.length > 0 ? (
          <Table history={history} />
        ) : (
          <div className='flex justify-center text-gray-600'>No history</div>
        )}
      </div>
    </div>
  )
}

const Table: FC<{ history: DefaultArtistHistory[] }> = ({
  history: unsortedHistory,
}) => {
  const history = useMemo(
    () =>
      unsortedHistory.sort((a, b) => {
        // always show CREATE first
        if (
          a.operation === CrudOperation.CREATE &&
          b.operation !== CrudOperation.CREATE
        ) {
          return -1
        } else if (
          b.operation === CrudOperation.CREATE &&
          a.operation !== CrudOperation.CREATE
        ) {
          return 1
        }

        return compareAsc(a.createdAt, b.createdAt)
      }),
    [unsortedHistory]
  )

  const table = useReactTable({
    data: history,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className='p-1 px-2 text-left'>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className='p-1 px-2'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  )
}

export default ArtistHistoryPage
