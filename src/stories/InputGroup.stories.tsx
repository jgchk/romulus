import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import Input from '../components/common/Input'
import InputGroupComponent from '../components/common/InputGroup'

export default {
  title: 'InputGroup',
  component: InputGroupComponent,
} as ComponentMeta<typeof InputGroupComponent>

const Template: ComponentStory<typeof InputGroupComponent> = (args) => {
  const [value, setValue] = useState('')

  return (
    <InputGroupComponent {...args}>
      <Input value={value} onChange={setValue} />
    </InputGroupComponent>
  )
}

export const InputGroup = Template.bind({})
InputGroup.args = {
  id: 'input',
  label: 'Label',
  required: false,
  error: '',
}
InputGroup.argTypes = {
  error: { control: 'text' },
}
