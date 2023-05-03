import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'
import { RiSortAsc, RiSortDesc } from 'react-icons/ri'

import { CenteredLoader } from '../../components/common/Loader'
import Paginator from '../../components/common/Paginator'
import Tooltip from '../../components/common/Tooltip'
import RelevanceChip from '../../components/GenresPage/GenreNavigator/Tree/RelevanceChip'
import GenreTypeChip from '../../components/GenresPage/GenreTypeChip'
import { Sort } from '../../server/db/genre/inputs'
import { DefaultGenre } from '../../server/db/genre/outputs'
import { usePaginatedGenresQuery } from '../../services/genres'
import { getTimeSinceShort, toPrettyDate } from '../../utils/datetime'
import { useIntRouteParam } from '../../utils/routes'

const GenresTable: FC = () => {
  const page = useIntRouteParam('page')
  const size = useIntRouteParam('size')

  const router = useRouter()
  const sort = useMemo(() => {
    const rawValue = router.query['sort']
    if (rawValue === undefined || rawValue === '') return undefined

    const value = Array.isArray(rawValue)
      ? rawValue.map((v) => JSON.parse(v) as unknown)
      : (JSON.parse(rawValue) as unknown)

    const result = Sort.safeParse(value)
    if (result.success) {
      return [result.data]
    } else {
      const resultArray = Sort.array().safeParse(value)
      if (resultArray.success) {
        return resultArray.data
      }
    }
  }, [router.query])

  const genresQuery = usePaginatedGenresQuery(page, size, sort)

  if (genresQuery.data) {
    return (
      <HasData
        genres={genresQuery.data.results}
        total={genresQuery.data.total}
        page={page}
        size={size}
        sorting={sort}
      />
    )
  }

  if (genresQuery.error) {
    return <div>Error fetching genres :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultGenre>()

const defaultColumns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (props) => {
      const genre = props.row.original

      return (
        <Link
          href={{ pathname: '/genres', query: { id: genre.id.toString() } }}
        >
          <a className='block text-gray-700 hover:font-bold'>
            {genre.name}
            {genre?.subtitle && (
              <>
                {' '}
                <span className='text-sm text-gray-600'>
                  [{genre.subtitle}]
                </span>
              </>
            )}
          </a>
        </Link>
      )
    },
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (props) => <GenreTypeChip type={props.getValue()} />,
  }),
  columnHelper.accessor('relevance', {
    header: 'Relevance',
    cell: (props) => <RelevanceChip relevance={props.getValue()} />,
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Last Updated',
    cell: (props) => (
      <div>
        <Tooltip tip={toPrettyDate(props.getValue())} className='w-fit'>
          {getTimeSinceShort(props.getValue())}
        </Tooltip>
      </div>
    ),
  }),
]

const HasData: FC<{
  genres: DefaultGenre[]
  total: number
  page?: number
  size?: number
  sorting?: SortingState
}> = ({ genres, total, page = 0, size: rawSize = 30, sorting }) => {
  // const [sorting, setSorting] = useState<SortingState>([
  //   { id: 'name', desc: false },
  // ])

  const size = useMemo(() => Math.min(rawSize, 100), [rawSize])

  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: size,
    pageIndex: page,
  })

  const router = useRouter()

  const table = useReactTable({
    data: genres,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: Math.ceil(total / size),
    manualPagination: true,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: (s) => {
      const sa = typeof s === 'function' ? s(sorting ?? []) : s
      void router.push({
        query: {
          page: pagination.pageIndex.toString(),
          size: pagination.pageSize.toString(),
          sort: JSON.stringify(sa),
        },
      })
    },
    onPaginationChange: (p) => {
      const pa = typeof p === 'function' ? p(pagination) : p
      setPagination(p)
      void router.push({
        query: {
          page: pa.pageIndex.toString(),
          size: pa.pageSize.toString(),
          sort: JSON.stringify(sorting),
        },
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

export default GenresTable
