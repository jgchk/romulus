import { ComponentMeta, ComponentStory } from '@storybook/react'
import { range } from 'ramda'
import { useState } from 'react'

import SelectComponent, { Option } from '../components/common/Select'

export default {
  title: 'Select',
  component: SelectComponent,
} as ComponentMeta<typeof SelectComponent>

const SelectTemplate: ComponentStory<typeof SelectComponent> = (args) => {
  const [value, setValue] = useState<Option>()
  return <SelectComponent {...args} value={value} onChange={setValue} />
}

export const Select = SelectTemplate.bind({})
Select.args = {
  options: range(1, 10).map((v) => ({ id: v, label: v })),
  placeholder: 'Input',
  error: false,
}
Select.argTypes = {
  value: { control: null, table: { disable: true } },
  onChange: { control: null, table: { disable: true } },
}

const PopoverDirectionTemplate: ComponentStory<typeof SelectComponent> = (
  args
) => {
  const [value, setValue] = useState<Option>()
  return (
    <div className='flex h-[calc(100vh-32px)] w-full items-end'>
      <SelectComponent
        {...args}
        value={value}
        onChange={setValue}
        className='flex-1'
      />
    </div>
  )
}

export const PopoverDirection = PopoverDirectionTemplate.bind({})
PopoverDirection.args = {
  options: range(1, 10).map((v) => ({ id: v, label: v })),
  placeholder: 'Input',
}
