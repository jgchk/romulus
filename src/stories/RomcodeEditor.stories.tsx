import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'
import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import superjson from 'superjson'

import RomcodeEditorComponent from '../components/common/Romcode/Editor'
import { showErrorToast } from '../utils/error'
import { trpc } from '../utils/trpc'

export default {
  title: 'RomcodeEditor',
  component: RomcodeEditorComponent,
} as ComponentMeta<typeof RomcodeEditorComponent>

const queryCache = new QueryCache({
  onError: (error, query) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (query.options.showToast) {
      void showErrorToast(error)
    }
  },
})

const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (mutation.options.showToast) {
      void showErrorToast(error)
    }
  },
})

const defaultOptions: DefaultOptions = {
  // TODO: tell typescript that showToast is a valid option
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queries: { showToast: true },

  // TODO: tell typescript that showToast is a valid option
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mutations: { showToast: true },
}

const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions,
})

const trpcClient = trpc.createClient({
  url: 'http://localhost:3000/api/trpc',
  transformer: superjson,
})

const Template: ComponentStory<typeof RomcodeEditorComponent> = (args) => {
  const [value, setValue] = useState('')

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RomcodeEditorComponent {...args} value={value} onChange={setValue} />
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export const RomcodeEditor = Template.bind({})
RomcodeEditor.args = {}
