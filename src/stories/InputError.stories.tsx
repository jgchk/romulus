import InputErrorComponent from '../components/common/InputError'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  title: 'InputError',
  component: InputErrorComponent,
} as ComponentMeta<typeof InputErrorComponent>

const Template: ComponentStory<typeof InputErrorComponent> = (args) => (
  <InputErrorComponent {...args} />
)

export const InputError = Template.bind({})
InputError.args = {
  children: 'Error message',
}
