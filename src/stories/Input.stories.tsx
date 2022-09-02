import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import InputComponent from '../components/common/Input'

export default {
  title: 'Input',
  component: InputComponent,
} as ComponentMeta<typeof InputComponent>

const Template: ComponentStory<typeof InputComponent> = (args) => {
  const [value, setValue] = useState('')
  return <InputComponent {...args} value={value} onChange={setValue} />
}

export const Input = Template.bind({})
Input.args = {
  placeholder: 'Input',
  disabled: false,
  showClear: false,
  error: '',
}
Input.argTypes = {
  error: { control: 'text' },
  value: { control: null, table: { disable: true } },
  onChange: { control: null, table: { disable: true } },
}
