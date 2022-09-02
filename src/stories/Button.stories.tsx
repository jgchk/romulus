import { ComponentMeta, ComponentStory } from '@storybook/react'

import ButtonComponent from '../components/common/Button'

export default {
  title: 'Button',
  component: ButtonComponent,
} as ComponentMeta<typeof ButtonComponent>

const Template: ComponentStory<typeof ButtonComponent> = (args) => (
  <ButtonComponent {...args} />
)

export const Button = Template.bind({})
Button.args = {
  children: 'Label',
  disabled: false,
}
