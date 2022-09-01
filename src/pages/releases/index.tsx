import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { NextPage } from 'next'
import { FC, useMemo } from 'react'

import Button from '../../components/common/Button'
import { CenteredLoader } from '../../components/common/Loader'
import { DefaultRelease } from '../../server/db/release/output'
import {
  useDeleteReleaseMutation,
  useReleasesQuery,
} from '../../services/releases'

const Releases: NextPage = () => {
  const releasesQuery = useReleasesQuery()

  if (releasesQuery.data) {
    return <HasData releases={releasesQuery.data} />
  }

  if (releasesQuery.error) {
    return <div>Error fetching releases :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultRelease>()

const HasData: FC<{ releases: DefaultRelease[] }> = ({ releases }) => {
  const { mutate: deleteRelease } = useDeleteReleaseMutation()

  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
      }),
      columnHelper.accessor('issues', {
        header: 'Issues',
        cell: (props) => {
          const issues = props.getValue()
          return issues.map((issue) => issue.title).join(', ')
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: (props) => {
          const id = props.row.original.id
          return (
            <Button template='danger' onClick={() => deleteRelease({ id })}>
              Delete
            </Button>
          )
        },
      }),
    ],
    [deleteRelease]
  )

  const table = useReactTable({
    data: releases,
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

export default Releases
