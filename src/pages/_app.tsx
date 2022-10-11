import '../../styles/globals.css'

import { withTRPC } from '@trpc/next'
import { AppType } from 'next/dist/shared/lib/utils'
import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import superjson from 'superjson'

import ErrorBoundary from '../components/ErrorBoundary'
import Layout from '../components/Layout'
import { AppRouter } from '../server/routers/_app'
import { showErrorToast } from '../utils/error'
import { getBaseTrpcUrl } from '../utils/trpc'

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

const MyApp: AppType = ({ Component, pageProps }) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Layout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </QueryClientProvider>
  </ErrorBoundary>
)

export default withTRPC<AppRouter>({
  config: ({ ctx }) => ({
    url: `${getBaseTrpcUrl()}/api/trpc`,
    transformer: superjson,
    queryClientConfig: {
      queryCache,
      mutationCache,
      defaultOptions,
    },
    headers: {
      cookie: ctx?.req?.headers.cookie,
    },
  }),
  ssr: true,
})(MyApp)
