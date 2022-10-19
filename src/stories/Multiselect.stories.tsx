import { ComponentMeta, Story } from '@storybook/react'
import { range } from 'ramda'
import { ComponentProps, useMemo, useState } from 'react'

import Button from '../components/common/Button'
import M from '../components/common/Multiselect'
import { HasId } from '../components/common/Multiselect/context'

export default {
  title: 'Multiselect',
  component: M,
} as ComponentMeta<typeof M>

const Template: Story<ComponentProps<typeof M> & { numOptions: number }> = ({
  numOptions,
  ...args
}) => {
  const all: HasId[] = range(1, 100).map((id) => ({ id }))

  const [selected, setSelected] = useState<HasId[]>([])
  const [query, setQuery] = useState('')

  const options = useMemo(() => {
    const selectedIds = new Set(selected.map((s) => s.id))
    return all.filter(
      (i) => i.id.toString().startsWith(query) && !selectedIds.has(i.id)
    )
  }, [all, query, selected])

  const [page, setPage] = useState(1)

  return (
    <M
      {...args}
      value={selected}
      onChange={setSelected}
      query={query}
      onQueryChange={setQuery}
      options={options}
      className='w-full'
    >
      <M.Box>
        {selected.map((item) => (
          <M.Selected key={item.id} item={item}>
            {item.id}
          </M.Selected>
        ))}
        <M.Input />
      </M.Box>
      <M.Options>
        {options.slice(0, page * numOptions).map((option) => (
          <M.Option key={option.id} item={option}>
            {option.id}
          </M.Option>
        ))}
        {options.length > page * numOptions && (
          <div className='flex w-full justify-center'>
            <Button template='secondary' onClick={() => setPage((p) => p + 1)}>
              Load More
            </Button>
          </div>
        )}
      </M.Options>
    </M>
  )
}

export const Multiselect = Template.bind({})
Multiselect.args = {
  numOptions: 100,
}

const PopoverDirectionTemplate: Story<
  ComponentProps<typeof M> & { numOptions: number }
> = ({ numOptions, ...args }) => {
  const all: HasId[] = range(1, 100).map((id) => ({ id }))

  const [selected, setSelected] = useState<HasId[]>([])
  const [query, setQuery] = useState('')

  const options = useMemo(() => {
    const selectedIds = new Set(selected.map((s) => s.id))
    return all.filter(
      (i) => i.id.toString().startsWith(query) && !selectedIds.has(i.id)
    )
  }, [all, query, selected])

  const [page, setPage] = useState(1)

  return (
    <div className='flex h-[calc(100vh-32px)] w-full items-end'>
      <M
        {...args}
        value={selected}
        onChange={setSelected}
        query={query}
        onQueryChange={setQuery}
        options={options}
        className='flex-1'
      >
        <M.Box>
          {selected.map((item) => (
            <M.Selected key={item.id} item={item}>
              {item.id}
            </M.Selected>
          ))}
          <M.Input />
        </M.Box>
        <M.Options>
          {options.slice(0, page * numOptions).map((option) => (
            <M.Option key={option.id} item={option}>
              {option.id}
            </M.Option>
          ))}
          {options.length > page * numOptions && (
            <div className='flex w-full justify-center'>
              <Button
                template='secondary'
                onClick={() => setPage((p) => p + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </M.Options>
      </M>
    </div>
  )
}

export const PopoverDirection = PopoverDirectionTemplate.bind({})
PopoverDirection.args = {
  numOptions: 100,
}
