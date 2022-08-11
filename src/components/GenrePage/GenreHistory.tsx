import { GenreOperation } from '@prisma/client'
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

import { DefaultGenreHistory } from '../../server/db/genre/types'
import { useGenreHistoryQuery } from '../../services/genres'
import { capitalize } from '../../utils/string'
import { CenteredLoader } from '../common/Loader'

const GenreHistory: FC<{ id: number }> = ({ id }) => {
  const historyQuery = useGenreHistoryQuery(id)

  if (historyQuery.data) {
    return <HasData history={historyQuery.data} />
  }

  if (historyQuery.error) {
    return <div>Error fetching history :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultGenreHistory>()

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
        <a className='text-blue-500 hover:underline'>
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

const HasData: FC<{ history: DefaultGenreHistory[] }> = ({ history }) => {
  const { id, name } = useMemo(() => {
    const latestHistory = history[0]
    return { id: latestHistory.treeGenreId, name: latestHistory.name }
  }, [history])

  return (
    <div className='flex-1 overflow-auto p-4'>
      <div className='flex items-center pb-4 border-b border-gray-100'>
        <Link
          href={{
            pathname: '/genres/[id]',
            query: { id: id.toString() },
          }}
        >
          <a className='p-1.5 mr-1.5 text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-full'>
            <IoMdArrowBack size={18} />
          </a>
        </Link>
        <div className='text-2xl font-bold text-gray-600'>{name}</div>
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

const Table: FC<{ history: DefaultGenreHistory[] }> = ({
  history: unsortedHistory,
}) => {
  const history = useMemo(
    () =>
      unsortedHistory.sort((a, b) => {
        // always show CREATE first
        if (
          a.operation === GenreOperation.CREATE &&
          b.operation !== GenreOperation.CREATE
        ) {
          return -1
        } else if (
          b.operation === GenreOperation.CREATE &&
          a.operation !== GenreOperation.CREATE
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

export default GenreHistory
