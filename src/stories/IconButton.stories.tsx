import IconButtonComponent from '../components/common/IconButton'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Ri24HoursFill } from 'react-icons/ri'

export default {
  title: 'IconButton',
  component: IconButtonComponent,
} as ComponentMeta<typeof IconButtonComponent>

const Template: ComponentStory<typeof IconButtonComponent> = (args) => (
  <IconButtonComponent {...args}>
    <Ri24HoursFill />
  </IconButtonComponent>
)

export const IconButton = Template.bind({})
IconButton.args = {
  disabled: false,
  loading: false,
}
