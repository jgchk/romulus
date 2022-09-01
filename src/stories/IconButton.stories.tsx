import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Ri24HoursFill } from 'react-icons/ri'

import IconButtonComponent from '../components/common/IconButton'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'IconButton',
  component: IconButtonComponent,
} as ComponentMeta<typeof IconButtonComponent>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof IconButtonComponent> = (args) => (
  <IconButtonComponent {...args} />
)

export const IconButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
IconButton.args = {
  disabled: false,
  children: <Ri24HoursFill />,
}
