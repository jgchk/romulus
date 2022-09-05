import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import RomcodeEditorComponent from '../components/common/RomcodeEditor'

export default {
  title: 'RomcodeEditor',
  component: RomcodeEditorComponent,
} as ComponentMeta<typeof RomcodeEditorComponent>

const Template: ComponentStory<typeof RomcodeEditorComponent> = (args) => {
  const [value, setValue] = useState('')

  return (
    <RomcodeEditorComponent
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export const RomcodeEditor = Template.bind({})
RomcodeEditor.args = {}
