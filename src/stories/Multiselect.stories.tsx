import { ComponentMeta, ComponentStory } from '@storybook/react'
import { range } from 'ramda'
import { useMemo, useState } from 'react'

import M from '../components/common/Multiselect'
import { HasId } from '../components/common/Multiselect/context'

export default {
  title: 'Multiselect',
  component: M,
} as ComponentMeta<typeof M>

const Template: ComponentStory<typeof M> = (args) => {
  const all: HasId[] = range(1, 100).map((id) => ({ id }))

  const [selected, setSelected] = useState<HasId[]>([])
  const [query, setQuery] = useState('')

  const options = useMemo(() => {
    const selectedIds = new Set(selected.map((s) => s.id))
    return all.filter(
      (i) => i.id.toString().startsWith(query) && !selectedIds.has(i.id)
    )
  }, [all, query, selected])

  return (
    <M
      {...args}
      value={selected}
      onChange={setSelected}
      query={query}
      onQueryChange={setQuery}
      options={options}
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
        {options.map((option) => (
          <M.Option key={option.id} item={option}>
            {option.id}
          </M.Option>
        ))}
      </M.Options>
    </M>
  )
}

export const Multiselect = Template.bind({})
Multiselect.args = {}
