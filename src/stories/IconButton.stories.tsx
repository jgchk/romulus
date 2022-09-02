import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Ri24HoursFill } from 'react-icons/ri'

import IconButtonComponent from '../components/common/IconButton'

export default {
  title: 'IconButton',
  component: IconButtonComponent,
} as ComponentMeta<typeof IconButtonComponent>

const Template: ComponentStory<typeof IconButtonComponent> = (args) => (
  <IconButtonComponent {...args} />
)

export const IconButton = Template.bind({})
IconButton.args = {
  disabled: false,
  children: <Ri24HoursFill />,
}
