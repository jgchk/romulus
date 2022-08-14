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
import { isBrowser } from '../utils/dom'
import { showErrorToast } from '../utils/error'

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

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
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
}

const getBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV

  if (env === 'production') {
    return `https://www.romulus.lol`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`

    return {
      url,
      transformer: superjson,
      queryClientConfig: {
        queryCache,
        mutationCache,
        defaultOptions,
      },
      headers: isBrowser
        ? undefined
        : () => {
            const cookieStr = ctx?.req?.headers.cookie

            if (cookieStr) {
              return { Cookie: cookieStr }
            }

            return {}
          },
    }
  },
  ssr: true,
})(MyApp)
