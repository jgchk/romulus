import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'
import { RiSortAsc, RiSortDesc } from 'react-icons/ri'

import { CenteredLoader } from '../../components/common/Loader'
import Paginator from '../../components/common/Paginator'
import { DefaultPerson } from '../../server/db/person/outputs'
import { usePeopleQuery } from '../../services/people'
import { useIntRouteParam } from '../../utils/routes'

const PeopleTable: FC = () => {
  const peopleQuery = usePeopleQuery()

  const page = useIntRouteParam('page')
  const size = useIntRouteParam('size')

  if (peopleQuery.data) {
    return <HasData people={peopleQuery.data} page={page} size={size} />
  }

  if (peopleQuery.error) {
    return <div>Error fetching people :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultPerson>()

const defaultColumns = [
  columnHelper.accessor('firstName', { header: 'First Name' }),
  columnHelper.accessor('middleName', { header: 'Middle Name' }),
  columnHelper.accessor('lastName', { header: 'Last Name' }),
]

const HasData: FC<{
  people: DefaultPerson[]
  page?: number
  size?: number
}> = ({ people, page = 0, size: rawSize = 30 }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastName', desc: false },
  ])

  const size = useMemo(() => Math.min(rawSize, 100), [rawSize])

  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: size,
    pageIndex: page,
  })

  const router = useRouter()

  const table = useReactTable({
    data: people,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: (p) => {
      const pa = typeof p === 'function' ? p(pagination) : p
      setPagination(p)
      void router.push({
        query: { page: pa.pageIndex.toString(), size: pa.pageSize.toString() },
      })
    },
  })

  return (
    <div className='p-4'>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className='p-1 px-2 text-left'>
                  {header.isPlaceholder ? null : (
                    <div
                      className={clsx(
                        'flex items-center space-x-1',
                        header.column.getCanSort() &&
                          'cursor-pointer select-none'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {{
                        asc: <RiSortAsc className='text-primary-500' />,
                        desc: <RiSortDesc className='text-primary-500' />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
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

      <Paginator table={table} />
    </div>
  )
}

export default PeopleTable
