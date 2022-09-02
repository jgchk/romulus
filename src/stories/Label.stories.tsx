import { ComponentMeta, ComponentStory } from '@storybook/react'

import LabelComponent from '../components/common/Label'

export default {
  title: 'Label',
  component: LabelComponent,
} as ComponentMeta<typeof LabelComponent>

const Template: ComponentStory<typeof LabelComponent> = (args) => (
  <LabelComponent {...args} />
)

export const Label = Template.bind({})
Label.args = {
  children: 'Label',
}
