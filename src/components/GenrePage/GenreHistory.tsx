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

import { DefaultGenreHistory } from '../../server/db/genre-history/outputs'
import { useGenreHistoryQuery } from '../../services/genre-history'
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
    cell: (props) => {
      const account = props.getValue()

      if (!account) {
        return <div className='text-gray-500 line-through'>Deleted</div>
      }

      return (
        <Link
          href={{
            pathname: '/accounts/[id]',
            query: { id: account.id.toString() },
          }}
        >
          <a className='text-blue-500 hover:underline'>{account.username}</a>
        </Link>
      )
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: (props) => format(props.getValue(), 'PPpp'),
  }),
]

const HasData: FC<{ history: DefaultGenreHistory[] }> = ({
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

  const genre = useMemo(() => {
    const latestHistory = history[history.length - 1]
    if (!latestHistory) return
    return {
      id: latestHistory.treeGenreId,
      name: latestHistory.name,
      subtitle: latestHistory.subtitle,
    }
  }, [history])

  return (
    <div className='flex-1 overflow-auto p-4'>
      <div className='flex items-center pb-4 border-b border-gray-100'>
        {genre ? (
          <>
            <Link
              href={{
                pathname: '/genres',
                query: { id: genre.id.toString() },
              }}
            >
              <a className='p-1.5 mr-1.5 text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-full'>
                <IoMdArrowBack size={18} />
              </a>
            </Link>
            <div className='text-2xl font-bold text-gray-600'>
              {genre.name}
              {genre.subtitle && (
                <>
                  {' '}
                  <span className='text-lg text-gray-500'>
                    [{genre.subtitle}]
                  </span>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <span className='p-1.5 mr-1.5 text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-full'>
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

const Table: FC<{ history: DefaultGenreHistory[] }> = ({ history }) => {
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
