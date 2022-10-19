import {
  CoreInstance,
  PaginationInstance,
  RowData,
} from '@tanstack/react-table'
import {
  RiArrowLeftSFill,
  RiArrowRightSFill,
  RiSkipBackMiniFill,
  RiSkipForwardMiniFill,
} from 'react-icons/ri'

import useTablePaginationOptions from '../../hooks/useTablePaginationOptions'
import IconButton from './IconButton'
import Input from './Input'
import Select from './Select'

const Paginator = <TData extends RowData>({
  table,
}: {
  table: PaginationInstance<TData> & CoreInstance<TData>
}) => {
  const pageOptions = useTablePaginationOptions(
    table.getState().pagination.pageSize
  )

  return (
    <div className='flex flex-wrap items-center space-x-2'>
      <IconButton
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <RiSkipBackMiniFill />
      </IconButton>
      <IconButton
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <RiArrowLeftSFill />
      </IconButton>
      <IconButton
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <RiArrowRightSFill />
      </IconButton>
      <IconButton
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <RiSkipForwardMiniFill />
      </IconButton>
      <span className='flex items-center space-x-1 text-sm text-gray-800'>
        <div>Page</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      <span className='text-sm text-gray-800'>|</span>
      <span className='flex items-center space-x-1 text-sm text-gray-800'>
        <span>Go to page:</span>
        <Input
          type='number'
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={(value) => {
            const page = value ? Number(value) - 1 : 0
            table.setPageIndex(page)
          }}
          className='w-16 rounded border p-1'
        />
      </span>
      <div className='relative w-24 self-stretch'>
        <div className='absolute' style={{ width: 'max-content' }}>
          <Select
            value={pageOptions.find(
              (po) => table.getState().pagination.pageSize === po.key
            )}
            onChange={(value) => table.setPageSize(value.key ?? 30)}
            options={pageOptions}
          />
        </div>
      </div>
    </div>
  )
}

export default Paginator
