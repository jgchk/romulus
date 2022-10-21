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
import { FC, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { RiDeleteBinLine, RiSortAsc, RiSortDesc } from 'react-icons/ri'

import IconButton from '../../components/common/IconButton'
import { CenteredLoader } from '../../components/common/Loader'
import Paginator from '../../components/common/Paginator'
import Tooltip from '../../components/common/Tooltip'
import { DefaultSong } from '../../server/db/song/outputs'
import { useDeleteSongMutation, useSongsQuery } from '../../services/songs'
import { useIntRouteParam } from '../../utils/routes'

const SongsTable: FC = () => {
  const songsQuery = useSongsQuery()

  const page = useIntRouteParam('page')
  const size = useIntRouteParam('size')

  if (songsQuery.data) {
    return <HasData songs={songsQuery.data} page={page} size={size} />
  }

  if (songsQuery.error) {
    return <div>Error fetching songs :(</div>
  }

  return <CenteredLoader />
}

const columnHelper = createColumnHelper<DefaultSong>()

const HasData: FC<{
  songs: DefaultSong[]
  page?: number
  size?: number
}> = ({ songs, page = 0, size: rawSize = 30 }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'title', desc: false },
  ])

  const size = useMemo(() => Math.min(rawSize, 100), [rawSize])

  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: size,
    pageIndex: page,
  })

  const router = useRouter()

  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor('title', { header: 'Title' }),
      columnHelper.display({
        id: 'buttons',
        cell: (props) => {
          const id = props.row.original.id
          const title = props.row.original.title
          return <DeleteButton id={id} title={title} />
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: songs,
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

const DeleteButton: FC<{ id: number; title: string }> = ({ id, title }) => {
  const { mutate, isLoading } = useDeleteSongMutation()

  const handleClick = useCallback(
    () =>
      mutate(
        { id },
        {
          onSuccess: () => {
            toast.success(`Deleted song '${title}'`)
          },
        }
      ),
    [id, mutate, title]
  )

  return (
    <Tooltip tip='Delete'>
      <IconButton onClick={handleClick} loading={isLoading}>
        <RiDeleteBinLine />
      </IconButton>
    </Tooltip>
  )
}

export default SongsTable
