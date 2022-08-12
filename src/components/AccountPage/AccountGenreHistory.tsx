import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import Link from 'next/link'
import { FC, useMemo } from 'react'

import { DefaultGenreHistory } from '../../server/db/genre/outputs'
import { useGenreHistoryByUserQuery } from '../../services/genres'
import { capitalize } from '../../utils/string'
import { ButtonTertiary } from '../common/Button'
import { CenteredLoader } from '../common/Loader'

const columnHelper = createColumnHelper<DefaultGenreHistory>()

const defaultColumns = [
  columnHelper.accessor('name', {
    header: 'Genre',
    cell: (props) => (
      <Link
        href={{
          pathname: '/genres/[id]',
          query: { id: props.row.original.treeGenreId.toString() },
        }}
      >
        <a className='text-blue-500 hover:underline'>{props.getValue()}</a>
      </Link>
    ),
  }),
  columnHelper.accessor('operation', {
    header: 'Change',
    cell: (props) => capitalize(props.getValue()),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: (props) => format(props.getValue(), 'PPpp'),
  }),
]

const AccountGenreHistory: FC<{ id: number }> = ({ id }) => {
  const {
    data: history,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGenreHistoryByUserQuery(id)

  const data: DefaultGenreHistory[] = useMemo(
    () => history?.pages.flatMap((page) => page.history) ?? [],
    [history?.pages]
  )

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (data) {
    if (data.length === 0) {
      return <div className='flex justify-center text-gray-600'>No history</div>
    }

    return (
      <>
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
        <div className='w-full flex justify-center'>
          <ButtonTertiary
            onClick={() => void fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
          </ButtonTertiary>
        </div>
      </>
    )
  }

  if (error) {
    return <div>Error fetching history :(</div>
  }

  return <CenteredLoader />
}

export default AccountGenreHistory
