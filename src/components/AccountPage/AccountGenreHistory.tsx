import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { compareDesc, format } from 'date-fns'
import Link from 'next/link'
import { FC, useMemo } from 'react'

import { DefaultGenreHistory } from '../../server/db/genre/outputs'
import { useGenreHistoryByUserQuery } from '../../services/genres'
import { capitalize } from '../../utils/string'
import { CenteredLoader } from '../common/Loader'

const AccountGenreHistory: FC<{ id: number }> = ({ id }) => {
  const historyQuery = useGenreHistoryByUserQuery(id)

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

const HasData: FC<{ history: DefaultGenreHistory[] }> = ({ history }) => (
  <div>
    {history.length > 0 ? (
      <Table history={history} />
    ) : (
      <div className='flex justify-center text-gray-600'>No history</div>
    )}
  </div>
)

const Table: FC<{ history: DefaultGenreHistory[] }> = ({
  history: unsortedHistory,
}) => {
  const history = useMemo(
    () => unsortedHistory.sort((a, b) => compareDesc(a.createdAt, b.createdAt)),
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

export default AccountGenreHistory
