import { CrudOperation } from '@prisma/client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { compareAsc, format } from 'date-fns'
import Link from 'next/link'
import { equals, isEmpty } from 'ramda'
import { FC, useCallback, useMemo, useState } from 'react'
import { IoMdArrowBack } from 'react-icons/io'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { DefaultGenreHistory } from '../../../server/db/genre-history/outputs'
import { useGenreHistoryQuery } from '../../../services/genre-history'
import { capitalize } from '../../../utils/string'
import GenreLink from '../../common/GenreLink'
import IconButton from '../../common/IconButton'
import Label from '../../common/Label'
import { CenteredLoader } from '../../common/Loader'
import Tooltip from '../../common/Tooltip'
import GenreTypeChip from '../GenreTypeChip'

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
    <div className='h-full flex-1 overflow-auto p-4'>
      <div className='flex items-center border-b border-gray-100 pb-4'>
        {genre ? (
          <>
            <GenreLink
              id={genre.id}
              className='mr-1.5 rounded-full p-1.5 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
            >
              <IoMdArrowBack size={18} />
            </GenreLink>
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

const Table: FC<{ history: DefaultGenreHistory[] }> = ({ history }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean | undefined>>(
    {}
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        cell: (props) => {
          const id = props.row.id
          const isExpanded = !!expanded[id]
          return (
            <Tooltip tip={`${isExpanded ? 'Hide' : 'Show'} Changes`}>
              <IconButton
                onClick={() =>
                  setExpanded((e) => ({ ...e, [id]: !isExpanded }))
                }
              >
                {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </IconButton>
            </Tooltip>
          )
        },
      }),
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
              <a className='text-primary-500 hover:underline'>
                {account.username}
              </a>
            </Link>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (props) => format(props.getValue(), 'PPpp'),
      }),
    ],
    [expanded]
  )

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className='w-full'>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className='p-1 px-2 text-left'
                style={{ width: header.id === 'expand' ? 0 : undefined }}
              >
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
        {table.getRowModel().rows.map((row, i) => {
          const isExpanded = !!expanded[row.id]
          const lastRow = table.getRowModel().rows[i - 1]

          return (
            <>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='p-1 px-2'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>

              {isExpanded && (
                <tr>
                  <td />
                  <td className='p-1 px-2' colSpan={3}>
                    <Diff
                      lastHistory={lastRow?.original}
                      thisHistory={row.original}
                    />
                  </td>
                </tr>
              )}
            </>
          )
        })}
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

type DiffAction = 'create' | 'update' | 'delete' | null

const Diff: FC<{
  lastHistory?: DefaultGenreHistory
  thisHistory: DefaultGenreHistory
}> = ({ lastHistory, thisHistory }) => {
  const getAction = useCallback(
    <T,>(fn: (hist: DefaultGenreHistory) => T): DiffAction => {
      const thisValue = fn(thisHistory)

      if (!lastHistory) {
        return thisValue && !isEmpty(thisValue) ? 'create' : null
      }

      const lastValue = fn(lastHistory)

      if (equals(lastValue, thisValue)) {
        return null
      }

      return thisValue && !isEmpty(thisValue) ? 'update' : 'delete'
    },
    [lastHistory, thisHistory]
  )

  const changed = useMemo(
    () => ({
      name: getAction((h) => h.name),
      subtitle: getAction((h) => h.subtitle),
      type: getAction((h) => h.type),
      shortDescription: getAction((h) => h.shortDescription),
      longDescription: getAction((h) => h.longDescription),
      notes: getAction((h) => h.notes),
      akas: getAction((h) => h.akas),
      parentGenreIds: getAction((h) => h.parentGenreIds),
      influencedByGenreIds: getAction((h) => h.influencedByGenreIds),
    }),
    [getAction]
  )

  const getActionClass = useCallback((action: DiffAction) => {
    switch (action) {
      case 'create':
        return 'border border-green-500 bg-green-300'
      case 'update':
        return 'border border-yellow-500 bg-yellow-300'
      case 'delete':
        return 'border border-red-500 bg-red-300'
    }
  }, [])

  return (
    <div className='flex space-x-3'>
      {lastHistory ? (
        <div className='flex-1 rounded border border-gray-300 bg-gray-100'>
          <div className='border-b border-gray-200 p-2 px-3 text-sm font-bold uppercase tracking-wide text-gray-500'>
            Before
          </div>
          <div className='space-y-3 p-2 px-3'>
            {lastHistory.name && (
              <div>
                <Label>Name</Label>
                <div>{lastHistory.name}</div>
              </div>
            )}
            {lastHistory.subtitle && (
              <div>
                <Label>Subtitle</Label>
                <div>{lastHistory.subtitle}</div>
              </div>
            )}
            {lastHistory.type && (
              <div>
                <Label>Type</Label>
                <div>
                  <GenreTypeChip type={lastHistory.type} />
                </div>
              </div>
            )}
            {lastHistory.shortDescription && (
              <div>
                <Label>Short Description</Label>
                <div>{lastHistory.shortDescription}</div>
              </div>
            )}
            {lastHistory.longDescription && (
              <div>
                <Label>Long Description</Label>
                <div>{lastHistory.longDescription}</div>
              </div>
            )}
            {lastHistory.notes && (
              <div>
                <Label>Notes</Label>
                <div>{lastHistory.notes}</div>
              </div>
            )}
            {lastHistory.akas.length > 0 && (
              <div>
                <Label>AKAs</Label>
                <div>{JSON.stringify(lastHistory.akas)}</div>
              </div>
            )}
            {lastHistory.parentGenreIds.length > 0 && (
              <div>
                <Label>Parents</Label>
                <div>{lastHistory.parentGenreIds}</div>
              </div>
            )}
            {lastHistory.influencedByGenreIds.length > 0 && (
              <div>
                <Label>Influences</Label>
                <div>{lastHistory.influencedByGenreIds}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex flex-1 flex-col rounded border border-gray-300 bg-gray-100'>
          <div className='border-b border-gray-200 p-2 px-3 text-sm font-bold uppercase tracking-wide text-gray-500'>
            Before
          </div>
          <div className='flex flex-1 items-center justify-center text-sm text-gray-500'>
            None
          </div>
        </div>
      )}

      <div className='flex-1 rounded border border-gray-300 bg-gray-100'>
        <div className='border-b border-gray-200 p-2 px-3 text-sm font-bold uppercase tracking-wide text-gray-500'>
          After
        </div>
        <div className='space-y-1 p-1'>
          {(thisHistory.name || changed.name) && (
            <div
              className={clsx('rounded p-1 px-2', getActionClass(changed.name))}
            >
              <Label>Name</Label>
              <div>{thisHistory.name}</div>
            </div>
          )}
          {(thisHistory.subtitle || changed.subtitle) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.subtitle)
              )}
            >
              <Label>Subtitle</Label>
              <div>{thisHistory.subtitle}</div>
            </div>
          )}
          {(thisHistory.type || changed.type) && (
            <div
              className={clsx('rounded p-1 px-2', getActionClass(changed.type))}
            >
              <Label>Type</Label>
              <div>
                <GenreTypeChip type={thisHistory.type} />
              </div>
            </div>
          )}
          {(thisHistory.shortDescription || changed.shortDescription) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.shortDescription)
              )}
            >
              <Label>Short Description</Label>
              <div>{thisHistory.shortDescription}</div>
            </div>
          )}
          {(thisHistory.longDescription || changed.longDescription) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.longDescription)
              )}
            >
              <Label>Long Description</Label>
              <div>{thisHistory.longDescription}</div>
            </div>
          )}
          {(thisHistory.notes || changed.notes) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.notes)
              )}
            >
              <Label>Notes</Label>
              <div>{thisHistory.notes}</div>
            </div>
          )}
          {(thisHistory.akas.length > 0 || changed.akas) && (
            <div
              className={clsx('rounded p-1 px-2', getActionClass(changed.akas))}
            >
              <Label>AKAs</Label>
              <div>{JSON.stringify(thisHistory.akas)}</div>
            </div>
          )}
          {(thisHistory.parentGenreIds.length > 0 ||
            changed.parentGenreIds) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.parentGenreIds)
              )}
            >
              <Label>Parents</Label>
              <div>{thisHistory.parentGenreIds}</div>
            </div>
          )}
          {(thisHistory.influencedByGenreIds.length > 0 ||
            changed.influencedByGenreIds) && (
            <div
              className={clsx(
                'rounded p-1 px-2',
                getActionClass(changed.influencedByGenreIds)
              )}
            >
              <Label>Influences</Label>
              <div>{thisHistory.influencedByGenreIds}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenreHistory
